import { assert } from "../Common";
import { LandExitResult, REData } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { FMap } from "../floorgen/FMapData";
import { LEntity } from "../objects/LEntity";
import { SSequelSet } from "../system/SSequel";
import { SIntegration } from "../system/SIntegration";
import { REVisual } from "../visual/REVisual";
import { SRmmzHelpers } from "ts/system/SRmmzHelpers";
import { LMap } from "ts/objects/LMap";
import { GameMapBuilder } from "./GameMapBuilder";
import { SDialogContext } from "ts/system/SDialogContext";
import { SDialog } from "ts/system/SDialog";
import { paramLandExitResultVariableId } from "ts/PluginParameters";
import { SEntityFactory } from "ts/system/SEntityFactory";

export class RMMZIntegration extends SIntegration {
    onReserveTransferMap(mapId: number, x: number, y:number, d: number): void {
        $gamePlayer.reserveTransfer(mapId, x, y, d, 0);

        // マップ遷移後、同一マップへの遷移でも Game_Map.setup が実行されるようにする。Scene_Load の処理と同じ。
        $gamePlayer.requestMapReload();

        // 主に演出のため ExitMap への遷移時にプレイヤーの表示をOFFにする
        if (REData.maps[mapId].exitMap) {
            $gamePlayer.setTransparent(true);
        }

        // この後のコアスクリプト側の流れ
        // - Scene_Map.prototype.updateTransferPlayer() にて、新しい Scene_Map が作成され Scene 遷移する。
        // 
    }

    onLoadFixedMapData(map: FMap): void {
        SRmmzHelpers.buildFixedMapData(map);
    }

    onLoadFixedMapEvents(): void {
        
        // 固定マップ上のイベント情報から Entity を作成する
        $gameMap.events().forEach((e: Game_Event) => {
            if (e && e._entityData) {
                const data = e._entityData;
                if (data.troopId > 0) {
                    SEntityFactory.spawnTroopAndMembers( REData.troops[data.troopId], e.x, e.y,data.stateIds);
                    e.setTransparent(true);
                    // TODO: troop に限らず、固定マップに配置されているイベントは一律非表示にして、
                    // Entity 情報から 動的イベントを生成する流れに統一したほうがいいかも。
                }
                else {
                    SRmmzHelpers.createEntityFromRmmzEvent(data, e.eventId(), e.x, e.y);
                    e.setTransparent(true);
                }
            }
        });
        //RESystem.minimapData.refresh();
    }
    
    onRefreshGameMap(map: LMap, initialMap: FMap): void {
        const builder = new GameMapBuilder();
        builder.build(map, initialMap);
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

        if (entity.inhabitsCurrentFloor) {
            // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
            // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
        }
        else {
            // Prefab 検索
            //const eventData = SRmmzHelpers.getPrefabEventData(entity.prefabKey);
            const eventData = SRmmzHelpers.getPrefabEventData(REData.prefabs[entity.data().prefabId].key);

            //  entity に対応する動的イベントを新たに生成する
            const event = $gameMap.spawnREEvent(eventData);
            entity.rmmzEventId = event.eventId();
        }

        REVisual.entityVisualSet?.createVisual(entity);
    }

    onEntityLeavedMap(entity: LEntity): void {
        REVisual.entityVisualSet?.deleteVisual(entity);

        // RMMZ Event との関連付けを解除
        entity.inhabitsCurrentFloor = false;
        entity.rmmzEventId = 0;
    }

    onSetLandExitResult(result: LandExitResult): void {
        $gameVariables.setValue(paramLandExitResultVariableId, Math.floor(result / 100));
    }

}
