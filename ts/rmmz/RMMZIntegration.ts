import { assert } from "../Common";
import { DBasics } from "../data/DBasics";
import { REData } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { FBlockComponent, FMap } from "../floorgen/FMapData";
import { REGame } from "../objects/REGame";
import { TileKind } from "../objects/REGame_Block";
import { LEntity } from "../objects/LEntity";
import { RESequelSet } from "../objects/REGame_Sequel";
import { paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId } from "../PluginParameters";
import { RMMZHelper } from "./RMMZHelper";
import { REDialogContext } from "../system/REDialog";
import { REEntityFactory } from "../system/REEntityFactory";
import { REIntegration } from "../system/REIntegration";
import { REVisual } from "../visual/REVisual";
import { SBehaviorFactory } from "ts/system/SBehaviorFactory";
import { SRmmzHelpers } from "ts/system/SRmmzHelpers";

export class RMMZIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number, x: number, y:number, d: number): void {
        $gamePlayer.reserveTransfer(floorId, x, y, d, 0);
    }

    onLoadFixedMapData(map: FMap): void {
        SRmmzHelpers.buildFixedMapData(map);
    }

    onLoadFixedMapEvents(): void {
        console.log("onLoadFixedMapEvents");
        
        // 固定マップ上のイベント情報から Entity を作成する
        $gameMap.events().forEach((e: Game_Event) => {
            if (e && e._entityMetadata) {
                SRmmzHelpers.createEntityFromRmmzEvent(e._entityMetadata, e.eventId(), e.x, e.y);
            }
        });
        REGame.minimapData.refresh();
    }

    onFlushSequelSet(sequelSet: RESequelSet): void {
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
    
    onDialogOpend(context: REDialogContext): void {
        REVisual.manager?.openDialog(context);
    }
    
    onUpdateDialog(context: REDialogContext): void {
        const manager = REVisual.manager;
        if (manager) {
            assert(!manager._dialogNavigator.isEmpty());
            manager._dialogNavigator.update(context);
        }
    }

    onDialogClosed(context: REDialogContext): void {
        const manager = REVisual.manager;
        if (manager) {
            manager.closeDialog(context);
        }
    }
    
    onEntityEnteredMap(entity: LEntity): void {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);

        if (entity.prefabKey) {
            if (entity.inhabitsCurrentFloor) {
                // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
                // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            }
            else {
                // Prefab 検索
                const eventData = SRmmzHelpers.getPrefabEventData(entity.prefabKey);

                //  entity に対応する動的イベントを新たに生成する
                const event = $gameMap.spawnREEvent(eventData);
                entity.rmmzEventId = event.eventId();
            }
        }
        else {
            // Tile などは RMMZ のイベント化する必要はない
            return;
        }

        REVisual.entityVisualSet?.createVisual(entity);
    }

    onEntityLeavedMap(entity: LEntity): void {
        REVisual.entityVisualSet?.deleteVisual(entity);

        // RMMZ Event との関連付けを解除
        entity.inhabitsCurrentFloor = false;
        entity.rmmzEventId = 0;
    }

    private makePrefavNameFromKindId(kindId: number, index: number): string {
        return `${REData.entityKinds[kindId].prefabKind}:${index}`;
    }


}
