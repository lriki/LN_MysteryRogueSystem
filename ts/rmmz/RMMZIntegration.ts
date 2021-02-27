import { assert } from "../Common";
import { DBasics } from "../data/DBasics";
import { REData } from "../data/REData";
import { REDataManager } from "../data/REDataManager";
import { FBlockComponent, FMap } from "../floorgen/FMapData";
import { REGame } from "../objects/REGame";
import { TileKind } from "../objects/REGame_Block";
import { REGame_Entity } from "../objects/REGame_Entity";
import { RESequelSet } from "../objects/REGame_Sequel";
import { paramFixedMapMonsterHouseRoomRegionId, paramFixedMapPassagewayRegionId, paramFixedMapRoomRegionId } from "../PluginParameters";
import { RMMZEventEntityMetadata, RMMZHelper } from "./RMMZHelper";
import { REDialogContext } from "../system/REDialog";
import { REEntityFactory } from "../system/REEntityFactory";
import { REIntegration } from "../system/REIntegration";
import { REVisual } from "../visual/REVisual";
import { SBehaviorFactory } from "ts/system/SBehaviorFactory";

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
                else if (regionId == paramFixedMapMonsterHouseRoomRegionId) {
                    block.setComponent(FBlockComponent.Room);
                    block.setMonsterHouseTypeId(DBasics.monsterHouses.fixed);
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
                entity.prefabKey = e._entityMetadata.prefab;
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

        if (entity.prefabKey) {
            if (entity.inhabitsCurrentFloor) {
                // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
                // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
            }
            else {
                // Prefab 検索
                const eventData = this.getPrefabEventData(entity.prefabKey);

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
        const prefabEventData = this.getPrefabEventData(data.prefab);
        const prefabData = RMMZHelper.readPrefabMetadata(prefabEventData);    // TODO: 毎回パースするとパフォーマンスに影響でそうなのでキャッシュしたいところ
        assert(prefabData);

        if (RMMZHelper.isExitPointPrefab(data)) {
            return REEntityFactory.newExitPoint();
        }

        if (prefabData.item) {
            const data = REData.items.find(x => x.entity.key == prefabData.item);
            if (data) {
                let entity;
                if (data.entity.kind == "Weapon")
                    entity = REEntityFactory.newEquipment(data.id);
                else if (data.entity.kind == "Shield")
                    entity = REEntityFactory.newEquipment(data.id);
                else if (data.entity.kind == "Trap")
                    entity = REEntityFactory.newTrap(data.id);
                else
                    entity = REEntityFactory.newItem(data.id);
                
                SBehaviorFactory.attachBehaviors(entity, data.entity.behaviors);
                return entity;
            }
            else
                throw new Error("Invalid item key: " + prefabData.item);
        }

        if (prefabData.enemy) {
            const data = REData.monsters.find(x => x.key == prefabData.enemy);
            if (data)
                return REEntityFactory.newMonster(data.id);
            else
                throw new Error("Invalid enemy key: " + prefabData.enemy);
        }

        throw new Error("Invalid prefab data key: " + prefabEventData.name);

        /*
        switch (data.prefabKind) {
            case "":
                return REEntityFactory.newEquipment((prefabData.weaponId ?? 0) + REData.weaponDataIdOffset);
            case "":
            case "Ring":
                return REEntityFactory.newEquipment((prefabData.armorId ?? 0) + REData.armorDataIdOffset);
            case 
                
            default:
                throw new Error("Invalid entity name: " + data.prefabKind);
        }
        */
    }
}
