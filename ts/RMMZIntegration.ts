import { assert } from "./Common";
import { DBasics } from "./data/DBasics";
import { REData } from "./data/REData";
import { REDataManager } from "./data/REDataManager";
import { FBlockComponent, FMap } from "./floorgen/FMapData";
import { REGame } from "./objects/REGame";
import { TileKind } from "./objects/REGame_Block";
import { REGame_Entity } from "./objects/REGame_Entity";
import { RESequelSet } from "./objects/REGame_Sequel";
import { paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId } from "./PluginParameters";
import { RMMZEventEntityMetadata, RMMZHelper } from "./rmmz/RMMZHelper";
import { REDialogContext } from "./system/REDialog";
import { REEntityFactory } from "./system/REEntityFactory";
import { REIntegration } from "./system/REIntegration";
import { REVisual } from "./visual/REVisual";

export class RMMZIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number, x: number, y:number, d: number): void {
        $gamePlayer.reserveTransfer(floorId, x, y, d, 0);
    }

    onLoadFixedMapData(map: FMap): void {
        if (!$dataMap) {
            throw new Error();
        }
        const width = $dataMap.width ?? 10;
        const height = $dataMap.height ?? 10;
        map.reset(width, height);
        REGame.minimapData.reset(width, height);

        for (let y = 0; y < map.height(); y++) {
            for (let x = 0; x < map.width(); x++) {
                const block = map.block(x, y);

                if ($gameMap.checkPassage(x, y, 0xF)) {
                    block.setTileKind(TileKind.Floor);
                }
                else {
                    block.setTileKind(TileKind.HardWall);
                }

                const regionId = RMMZHelper.getRegionId(x, y);
                if (regionId == paramFixedMapRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                }
                else if (regionId == paramFixedMapPassagewayRegionId) {
                    block.setComponent(FBlockComponent.Passageway);
                }
            }
        }
    }

    onLoadFixedMapEvents(): void {
        // 固定マップ上のイベント情報から Entity を作成する
        $gameMap.events().forEach((e: Game_Event) => {
            if (e && e._entityMetadata) {
                const entity = this.newEntity(e._entityMetadata);
                entity.prefabKey = { kind: REData.getEntityKindsId(e._entityMetadata.prefabKind), id: e._entityMetadata.prefabIndex };
                entity.rmmzEventId = e.eventId();
                entity.inhabitsCurrentFloor = true;
                REGame.world._transferEntity(entity, REGame.map.floorId(), e.x, e.y);
                assert(entity.parentIsMap());

                // 初期 state 付与
                // TODO: 絶対に眠らないモンスターとかもいるので、Command にしたほうがいいかも。
                e._entityMetadata.states.forEach(stateKey => {
                    entity.addState(REData.states.findIndex(state => state.key == stateKey));
                });
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
            case "Weapon":
                return REEntityFactory.newEquipment((prefabData.weaponId ?? 0) + REData.weaponDataIdOffset);
            case "Shield":
            case "Ring":
                return REEntityFactory.newEquipment((prefabData.armorId ?? 0) + REData.armorDataIdOffset);
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
