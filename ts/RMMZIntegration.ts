import { assert } from "./Common";
import { DBasics } from "./data/DBasics";
import { REData } from "./data/REData";
import { REDataManager } from "./data/REDataManager";
import { REGame } from "./objects/REGame";
import { TileKind } from "./objects/REGame_Block";
import { REGame_Entity } from "./objects/REGame_Entity";
import { RESequelSet } from "./objects/REGame_Sequel";
import { RMMZEventEntityMetadata, RMMZHelper } from "./rmmz/RMMZHelper";
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
                const entity = this.newEntity(e._entityMetadata);
                entity.prefabKey = { kind: REData.getEntityKindsId(e._entityMetadata.prefabKind), id: e._entityMetadata.prefabIndex };
                entity.rmmzEventId = e.eventId();
                entity.inhabitsCurrentFloor = true;
                REGame.world._transferEntity(entity, REGame.map.floorId(), e.x, e.y);
                REGame.map.markAdhocEntity(entity);
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

        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            if (entity.inhabitsCurrentFloor) {
                // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
                // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            }
            else {
                // Prefab 検索
                const prefabKey = this.makePrefavNameFromKindId(entity.prefabKey.kind, entity.prefabKey.id);
                const eventData = this.getPrefabEventData(prefabKey);

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

    onEntityLeavedMap(entity: REGame_Entity): void {
        REVisual.entityVisualSet?.deleteVisual(entity);

        // RMMZ Event との関連付けを解除
        entity.inhabitsCurrentFloor = false;
        entity.rmmzEventId = 0;
    }

    private makePrefavNameFromKindId(kindId: number, index: number): string {
        return `${REData.entityKinds[kindId].prefabKind}:${index}`;
    }
    
    private makePrefavNameFromKindName(kind: string, index: number): string {
        return `${kind}:${index}`;
    }

    private getPrefabEventData(prefabName: string): IDataMapEvent {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);

        const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabName : false);
        if (index >= 0) {
            return databaseMap.events[index];
        }
        else {
            throw new Error(`${prefabName} not found in REDatabase map.`);
        }
    }

    private newEntity(data: RMMZEventEntityMetadata): REGame_Entity {
        const prefabEventData = this.getPrefabEventData(this.makePrefavNameFromKindName(data.prefabKind, data.prefabIndex));
        console.log(prefabEventData);
        const prefabData = RMMZHelper.readPrefabMetadata(prefabEventData);    // TODO: 毎回パースするとパフォーマンスに影響でそうなのでキャッシュしたいところ
        assert(prefabData);

        switch (data.prefabKind) {
            case "ExitPoint":
                return REEntityFactory.newExitPoint();
            case "Monster":
                return REEntityFactory.newMonster(prefabData.enemyId ?? 0);
            case "Grass":
            case "Food":
                return REEntityFactory.newItem(prefabData.itemId ?? 0);
            case "Trap":
                return REEntityFactory.newTrap(prefabData.itemId ?? 0);
            default:
                throw new Error("Invalid entity name: " + data.prefabKind);
        }
    }
}
