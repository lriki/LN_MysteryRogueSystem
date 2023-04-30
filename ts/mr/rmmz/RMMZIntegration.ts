import { assert } from "../Common";
import { LandExitResult, MRData } from "../data/MRData";
import { MRDataManager } from "../data/MRDataManager";
import { FMap } from "../floorgen/FMapData";
import { LEntity } from "../lively/LEntity";
import { SSequelSet } from "../system/SSequel";
import { SIntegration } from "../system/SIntegration";
import { MRView } from "../view/MRView";
import { SRmmzHelpers } from "ts/mr/system/SRmmzHelpers";
import { LMap } from "ts/mr/lively/LMap";
import { VMapEditor } from "./VMapEditor";
import { SDialogContext } from "ts/mr/system/SDialogContext";
import { SDialog } from "ts/mr/system/SDialog";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LBlock } from "ts/mr/lively/LBlock";
import { DEventId } from "ts/mr/data/predefineds/DBasicEvents";
import { MRLively } from "../lively/MRLively";
import { FloorRestartSequence } from "./FloorRestartSequence";
import { MRBasics } from "../data/MRBasics";
import { LActorBehavior } from "../lively/behaviors/LActorBehavior";
import { LEquipmentUserBehavior } from "../lively/behaviors/LEquipmentUserBehavior";
import { DEntitySpawner } from "../data/DSpawner";
import { LScriptContext } from "../lively/LScript";

export class RMMZIntegration extends SIntegration {

    onEventPublished(eventId: DEventId, args: any, handled: boolean): void {

    }

    onReserveTransferMap(mapId: number, x: number, y: number, d: number): void {
        $gamePlayer.reserveTransfer(mapId, x, y, d, 0);

        // マップ遷移後、同一マップへの遷移でも Game_Map.setup が実行されるようにする。Scene_Load の処理と同じ。
        $gamePlayer.requestMapReload();

        // 主に演出のため ExitMap への遷移時にプレイヤーの表示をOFFにする。
        // 対策しないと、ExitMap へ移動したときに一瞬プレイヤーが見えてしまう。
        if (MRData.maps[mapId].exitMap) {
            $gamePlayer.setTransparent(true);
        }

        // この後のコアスクリプト側の流れ
        // - Scene_Map.prototype.updateTransferPlayer() にて、新しい Scene_Map が作成され Scene 遷移する。
        // 
    }

    onEntityLocated(entity: LEntity): void {
        if (entity.entityId().equals(MRLively.mapView.focusedEntityId())) {
            MRView._playerPosRefreshNeed = true;
        }

        // NOTE: ここでは Visual と Entity の座標を同期するようなことはしない。
        //
        //       一部の Motion (例えば、DropMotion) では登場位置から現在位置に向かって
        //      移動するようなモーションを組むことがあるが、そのような場合は
        //      onEntityEnteredMap() 時点で設定された Visual の座標を登場位置として使い、
        //      Motion 発生時の Entity の座標へ向かって移動させたい。
        //
        //      ここで同期してしまうと、その登場位置が失われてしまう。

        // transferEntity 直後に Motion (例えば、DropMotion) を再生しようとすると、
        // StartPosition が locate 前のものになってしまうので、ここで visual の座標を同期する。
        // const visual = MRView.entityVisualSet?.findEntityVisualByEntity(entity);
        // if (visual) {
        //     visual.setX(entity.mx);
        //     visual.setY(entity.my);
        // }
    }

    onLocateRmmzEvent(eventId: number, x: number, y: number): void {
        const rmmzEvent = $gameMap.event(eventId);
        rmmzEvent.locate(0, 0);
    }

    onLoadFixedMapData(map: FMap): void {
        SRmmzHelpers.buildFixedMapData(map);
    }

    onLoadFixedMapEvents(): void {
        MRLively.mapView.currentMap.keeperCount = 0;

        // 固定マップ上のイベント情報から Entity を作成する
        $gameMap.events().forEach((e: Game_Event) => {
            const spawner = SRmmzHelpers.readEntityMetadata(e, $gameMap.mapId());
            if (e && spawner) {
                if (spawner.troopId > 0) {
                    SEntityFactory.spawnTroopAndMembers(MRLively.mapView.currentMap, MRData.troops[spawner.troopId], e.x, e.y,spawner.stateIds);
                    e.setTransparent(true);
                }
                else {
                    const entity = SRmmzHelpers.createEntityFromRmmzEvent(spawner, e.eventId(), e.x, e.y);
                    MRLively.mapView.currentMap.uniqueSpawners[entity.dataId] = spawner;
                    assert(entity.data.prefabId > 0);

                    if (entity.inhabitsCurrentFloor) {
                        SRmmzHelpers.linkEntityAndEvent(entity, e);
                    }
                    else {
                        e.setTransparent(true);
                    }

                    if (spawner.keeper) {
                        entity.keeper = true;
                        MRLively.mapView.currentMap.keeperCount++;
                    }
                }
            }
        });

        MRLively.mapView.currentMap.lastKeeperCount = MRLively.mapView.currentMap.keeperCount;
    }

    override onGetFixedMapUnqueSpawners(): DEntitySpawner[] {
        return SRmmzHelpers.getUnqueSpawners($gameMap);
    }

    override onMapSetupCompleted(map: LMap): void {
        // マップの初期化が完了したら、マップ上のイベントを非表示にする。
        for (const event of $gameMap.events()) {
            if (!event.isREEvent()) {
                event.setTransparent(true);
            }
        }
    }
    
    onUpdateBlock(block: LBlock): void {
        if (MRView.mapBuilder) {
            //const width = $dataMap.width;
            //const height = $dataMap.height;
            //$dataMap.data[(z * height + y) * width + x] = tileId;

            //REVisual.mapBuilder.setTileId
            //REVisual.mapBuilder.set
            MRView.mapBuilder.refreshBlock(block);
    
            if (MRView.spriteset) {
                MRView.spriteset._tilemap.refresh();
            }
        }
    }


    
    onRefreshGameMap(map: LMap): void {
        MRView.mapBuilder = new VMapEditor(map);
        MRView.mapBuilder.build();
        //const builder = new GameMapBuilder();
        //builder.build(map);
    }

    onFlushEffectResult(entity: LEntity): void {
        const visual = MRView.entityVisualSet?.findEntityVisualByEntity(entity);
        if (visual) {
            visual.showEffectResult();
        }
    }

    onFlushSequelSet(sequelSet: SSequelSet): void {
    }
    
    onCheckVisualSequelRunning(): boolean {
        if (FloorRestartSequence.isProcessing()) {
            return true;
        }
    
        if (SceneManager.isCurrentSceneBusy()) {
            // マップ遷移などのフェード中
            return true;
        }

        if (MRView.entityVisualSet)
            return MRView.entityVisualSet.visualRunning();
        else
            return false;
    }
    
    onOpenDialog(model: SDialog): void {
        MRView.dialogManager?.openDialog(model);
    }
    
    onUpdateDialog(context: SDialogContext): void {
        const manager = MRView.dialogManager;
        if (manager) {
            assert(!manager.dialogNavigator.isEmpty);
            manager.dialogNavigator.update(context);
        }
    }

    override onDialogClosed(context: SDialogContext, dialog: SDialog): void {
        const manager = MRView.dialogManager;
        if (manager) {
            manager.dialogNavigator.closeDialog(context, dialog);
        }
    }
    

    override onCurrentMapChanged(): void {

    }
    
    onEntityEnteredMap(entity: LEntity): void {
        if (MRView.entityVisualSet) {
            MRView.entityVisualSet.createVisual2(entity);
        }
        else {
            // フロア遷移直後は、初期配置処理時点ではまだ Visual(SpriteSet) の準備ができていないことがある。
            // この時点では Visual や Sprite は作られないが、VisualSet を new したときに、その時点の map 上の Entity を元に全部作られる。
            // これは RMMZ の仕様。Game_Map や Scene_Map の処理はデフォルトでもかなり複雑なので、
            // MRシステムの都合でさらに複雑にするのは避けたいところ。なので Visual 側から見ると少し歪かもしれないが、頑張って RMMZ に合わせる。
        }
    }

    onEntityLeavedMap(entity: LEntity): void {
        MRView.entityVisualSet?.reserveDeleteVisual(entity);

        // Entity と RMMZ-Event の関連付けを解除
        entity.inhabitsCurrentFloor = false;
        SRmmzHelpers.unlinkEntityAndEvent(entity);
        if (entity.keeper) {
            entity.keeper = false;
            MRLively.mapView.currentMap.keeperCount--;
        }
    }

    onEntityReEnterMap(entity: LEntity): void {
        // this.onEntityLeavedMap(entity);
        // this.onEntityEnteredMap(entity);
    }

    onSetLandExitResult(result: LandExitResult): void {
        $gameVariables.setValue(MRBasics.variables.landExitResultDetail, result);
        $gameVariables.setValue(MRBasics.variables.landExitResult, Math.floor(result / 100));
    }

    override onEquipmentChanged(entity: LEntity): void {
        const actor = entity.findEntityBehavior(LActorBehavior);
        const equipmentUser = entity.findEntityBehavior(LEquipmentUserBehavior);
        if (actor && equipmentUser) {
            const rmmzActor = $gameActors.actor(actor.rmmzActorId);
            assert(rmmzActor);
            
            const items = equipmentUser.equippedItemEntities();
            rmmzActor._equips = [];
            for (let i = 0; i < items.length; i++) {
                const itemData = items[i].data.item();
                rmmzActor._equips[i] = new Game_Item();
                if (itemData.rmmzWeaponId > 0) {
                    rmmzActor._equips[i].setEquip(true, itemData.rmmzWeaponId);
                }
                else {
                    rmmzActor._equips[i].setEquip(false, itemData.rmmzArmorId);
                }
            }
            rmmzActor.refresh();
        }
    }

    override onStartEventScript(script: LScriptContext): void {
        $gameSystem.getMREventScriptRunnerManager().start(script);
    }
}
