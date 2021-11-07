import { assert } from "../Common";
import { LandExitResult, REData } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { FMap } from "../floorgen/FMapData";
import { LEntity } from "../objects/LEntity";
import { SSequelSet } from "../system/SSequel";
import { SIntegration } from "../system/SIntegration";
import { REVisual } from "../visual/REVisual";
import { SRmmzHelpers } from "ts/re/system/SRmmzHelpers";
import { LMap } from "ts/re/objects/LMap";
import { VMapEditor } from "./VMapEditor";
import { SDialogContext } from "ts/re/system/SDialogContext";
import { SDialog } from "ts/re/system/SDialog";
import { paramLandExitResultVariableId } from "ts/re/PluginParameters";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { LBlock } from "ts/re/objects/LBlock";
import { DEventId } from "ts/re/data/predefineds/DBasicEvents";
import { REGame } from "../objects/REGame";

export class RMMZIntegration extends SIntegration {
    onEventPublished(eventId: DEventId, args: any, handled: boolean): void {

    }

    onReserveTransferMap(mapId: number, x: number, y: number, d: number): void {
        //console.log("reload");

        $gamePlayer.reserveTransfer(mapId, x, y, d, 0);

        // マップ遷移後、同一マップへの遷移でも Game_Map.setup が実行されるようにする。Scene_Load の処理と同じ。
        $gamePlayer.requestMapReload();

        // 主に演出のため ExitMap への遷移時にプレイヤーの表示をOFFにする。
        // 対策しないと、ExitMap へ移動したときに一瞬プレイヤーが見えてしまう。
        if (REData.maps[mapId].exitMap) {
            $gamePlayer.setTransparent(true);
        }

        // この後のコアスクリプト側の流れ
        // - Scene_Map.prototype.updateTransferPlayer() にて、新しい Scene_Map が作成され Scene 遷移する。
        // 
    }

    onEntityLocated(entity: LEntity): void {
        if (entity.entityId().equals(REGame.camera.focusedEntityId())) {
            //console.log("★★★★★");
            //$gamePlayer.reserveTransfer($gameMap.mapId(), entity.x, entity.y, $gamePlayer.direction(), 2);
            //$gamePlayer.locate(entity.x, entity.y);
            //$gamePlayer.refresh();
            REVisual._playerPosRefreshNeed = true;
        }
    }

    onLocateRmmzEvent(eventId: number, x: number, y: number): void {
        const rmmzEvent = $gameMap.event(eventId);
        rmmzEvent.locate(0, 0);
    }

    onLoadFixedMapData(map: FMap): void {
        SRmmzHelpers.buildFixedMapData(map);
    }

    onLoadFixedMapEvents(): void {
        // 固定マップ上のイベント情報から Entity を作成する
        $gameMap.events().forEach((e: Game_Event) => {
            const data = SRmmzHelpers.readEntityMetadata(e);
            if (e && data) {
                if (data.troopId > 0) {
                    SEntityFactory.spawnTroopAndMembers(REData.troops[data.troopId], e.x, e.y,data.stateIds);
                    e.setTransparent(true);
                }
                else {
                    const entity = SRmmzHelpers.createEntityFromRmmzEvent(data, e.eventId(), e.x, e.y);
                    if (entity.inhabitsCurrentFloor) {
                        entity.rmmzEventId = e.eventId();
                    }
                    else {
                        e.setTransparent(true);
                    }
                }
            }
        });
    }

    onUpdateBlock(block: LBlock): void {
        console.log("onUpdateBlock", arguments);

        if (REVisual.mapBuilder) {
            //const width = $dataMap.width;
            //const height = $dataMap.height;
            //$dataMap.data[(z * height + y) * width + x] = tileId;

            console.log("onUpdateTile", arguments);
            //REVisual.mapBuilder.setTileId
            //REVisual.mapBuilder.set
            REVisual.mapBuilder.refreshBlock(block);
    
            if (REVisual.spriteset) {
                console.log("refresh");
                REVisual.spriteset._tilemap.refresh();
            }
        }
    }


    
    onRefreshGameMap(map: LMap): void {
        REVisual.mapBuilder = new VMapEditor(map);
        REVisual.mapBuilder.build();
        //const builder = new GameMapBuilder();
        //builder.build(map);
    }

    onFlushEffectResult(entity: LEntity): void {
        const visual = REVisual.entityVisualSet?.findEntityVisualByEntity(entity);
        if (visual) {
            visual.showEffectResult();
        }
    }

    onFlushSequelSet(sequelSet: SSequelSet): void {
    }
    
    onCheckVisualSequelRunning(): boolean {
        if (SceneManager.isCurrentSceneBusy()) {
            // マップ遷移などのフェード中
            return true;
        }

        if (REVisual.entityVisualSet)
            return REVisual.entityVisualSet.visualRunning();
        else
            return false;
    }
    
    onOpenDialog(model: SDialog): void {
        REVisual.manager?.openDialog(model);
    }
    
    onUpdateDialog(context: SDialogContext): void {
        const manager = REVisual.manager;
        if (manager) {
            assert(!manager._dialogNavigator.isEmpty());
            manager._dialogNavigator.update(context);
        }
    }

    onDialogClosed(context: SDialogContext): void {
        const manager = REVisual.manager;
        if (manager) {
            manager.closeDialog(context);
        }
    }
    
    onEntityEnteredMap(entity: LEntity): void {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);

        // Prefab 検索
        const prefabId = SRmmzHelpers.getPrefabEventDataId(REData.prefabs[entity.data().prefabId].key);

        if (entity.inhabitsCurrentFloor) {
            // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
            // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            assert(entity.rmmzEventId > 0);
            $gameMap.spawnREEvent(prefabId, entity.rmmzEventId);
        }
        else {
            //  entity に対応する動的イベントを新たに生成する
            const event = $gameMap.spawnREEvent(prefabId);
            entity.rmmzEventId = event.eventId();
        }

        REVisual.entityVisualSet?.createVisual(entity);
    }

    onEntityLeavedMap(entity: LEntity): void {
        REVisual.entityVisualSet?.reserveDeleteVisual(entity);

        // Entity と RMMZ-Event の関連付けを解除
        entity.inhabitsCurrentFloor = false;
        entity.rmmzEventId = 0;
    }

    onEntityReEnterMap(entity: LEntity): void {
        this.onEntityLeavedMap(entity);
        this.onEntityEnteredMap(entity);
    }

    onSetLandExitResult(result: LandExitResult): void {
        $gameVariables.setValue(paramLandExitResultVariableId, Math.floor(result / 100));
    }

}
