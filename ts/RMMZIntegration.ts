import { assert } from "./Common";
import { DBasics } from "./data/DBasics";
import { REData } from "./data/REData";
import { REDataManager } from "./data/REDataManager";
import { REGame } from "./objects/REGame";
import { TileKind } from "./objects/REGame_Block";
import { REGame_Entity } from "./objects/REGame_Entity";
import { RESequelSet } from "./objects/REGame_Sequel";
import { RMMZEventEntityMetadata } from "./rmmz/RMMZHelper";
import { REDialogContext } from "./system/REDialog";
import { REEntityFactory } from "./system/REEntityFactory";
import { REIntegration } from "./system/REIntegration";
import { REMapBuilder } from "./system/REMapBuilder";
import { REVisual } from "./visual/REVisual";

export class RMMZIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number, x: number, y:number, d: number): void {
        $gamePlayer.reserveTransfer(floorId, x, y, d, 0);
    }

    onLoadFixedMap(builder: REMapBuilder): void {
        if (!$dataMap) {
            throw new Error();
        }
        builder.reset($dataMap.width ?? 10, $dataMap.height ?? 10);

        for (let y = 0; y < builder.height(); y++) {
            for (let x = 0; x < builder.width(); x++) {
                if ($gameMap.checkPassage(x, y, 0xF)) {
                    builder.setTileKind(x, y, TileKind.Floor);
                }
                else {
                    builder.setTileKind(x, y, TileKind.HardWall);
                }
            }
        }

        // 固定マップ上のイベントを Entity として出現させる
        $gameMap.events().forEach((e: Game_Event) => {
            if (e && e._entityMetadata) {
                if (e._entityMetadata.entity) {
                    const entity = this.newEntity(e._entityMetadata);
                    entity.prefabKey = { kind: REData.getEntityKindsId(e._entityMetadata.entity), id: e._entityMetadata.id ?? 0 };
                    entity.rmmzEventId = e.eventId();
                    entity.inhabitsCurrentFloor = true;
                    REGame.world._transferEntity(entity, REGame.map.floorId(), e.x, e.y);
                    REGame.map.markAdhocEntity(entity);
                }
            }
        });
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
    
    onEntityEnteredMap(entity: REGame_Entity): void {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);
        
        console.log("onEntityEnteredMap", entity.prefabKey);

        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            if (entity.inhabitsCurrentFloor) {
                // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
                // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            }
            else {
                // Prefab 検索
                const prefabKey = `${REData.entityKinds[entity.prefabKey.kind].prefabKind}:${entity.prefabKey.id}`;
                const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabKey : false);
                if (index >= 0) {
                    //  entity に対応する動的イベントを新たに生成する
                    const eventData = databaseMap.events[index];
                    const event = $gameMap.spawnREEvent(eventData);
                    entity.rmmzEventId = event.eventId();
                    console.log("spawn", event);
                }
                else {
                    throw new Error(`${prefabKey} not found in REDatabase map.`);
                }
            }
        }
        else {
            // Tile などは RMMZ のイベント化する必要はない
            return;
        }

        REVisual.entityVisualSet?.createVisual(entity);
    }

    onEntityLeavedMap(entity: REGame_Entity): void {
        REVisual.entityVisualSet?.deleteVisual(entity);

        // RMMZ Event との関連付けを解除
        entity.inhabitsCurrentFloor = false;
        entity.rmmzEventId = 0;
    }

    private newEntity(data: RMMZEventEntityMetadata): REGame_Entity {
        switch (data.entity) {
            case "ExitPoint":
                return REEntityFactory.newExitPoint();
            case "Monster":
                return REEntityFactory.newMonster(data.id ?? 0);
            case "Food":
                return REEntityFactory.newItem(data.id ?? 0);
            default:
                throw new Error("Invalid entity name: " + data.entity);
        }
    }
}
