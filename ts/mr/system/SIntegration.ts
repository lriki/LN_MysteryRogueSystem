import { DEventId } from "ts/mr/data/predefineds/DBasicEvents";
import { LandExitResult } from "ts/mr/data/MRData";
import { FMap } from "ts/mr/floorgen/FMapData";
import { LBlock } from "ts/mr/lively/LBlock";
import { LEntity } from "ts/mr/lively/LEntity";
import { LMap } from "ts/mr/lively/LMap";
import { MRLively } from "ts/mr/lively/MRLively";
import { SSequelSet } from "ts/mr/system/SSequel";
import { LObjectType } from "../lively/LObject";
import { MRSystem } from "./MRSystem";
import { SDialog } from "./SDialog";
import { SDialogContext } from "./SDialogContext";
import { assert } from "../Common";
import { DRmmzUniqueSpawnerAnnotation } from "../data/importers/DAnnotationReader";
import { DUniqueSpawner } from "../data/DSpawner";

export abstract class SIntegration {
    public abstract onEventPublished(eventId: DEventId, args: any, handled: boolean): void;


    /**
     * REシステム内から、 RMMZ マップを移動する必要があるときに呼び出される。
     * (ゲームオーバー時に拠点フロアへ戻るときなど)
     */
    abstract onReserveTransferMap(mapId: number, x: number, y: number, d: number): void;

    /**
     * 
     */
    abstract onEntityLocated(entity: LEntity): void;

    abstract onLocateRmmzEvent(eventId: number, x: number, y: number): void;

    //--------------------------------------------------------------------------
    // Map building

    abstract onLoadFixedMapData(map: FMap): void;
    
    abstract onLoadFixedMapEvents(): void;

    abstract onGetFixedMapUnqueSpawners(): DUniqueSpawner[];

    abstract onMapSetupCompleted(map: LMap): void;

    abstract onUpdateBlock(block: LBlock): void;
    
    //--------------------------------------------------------------------------





    protected abstract onRefreshGameMap(map: LMap): void;

    protected abstract onFlushEffectResult(entity: LEntity): void;

    protected abstract onFlushSequelSet(sequelSet: SSequelSet): void;

    protected abstract onCheckVisualSequelRunning(): boolean;
    
    /** Dialog が開かれたとき。 */
    protected abstract onOpenDialog(model: SDialog): void;

    protected abstract onUpdateDialog(context: SDialogContext): void;

    /** Dialog が閉じられたとき。 */
    protected abstract onDialogClosed(context: SDialogContext, dialog: SDialog): void;

    /** MapView の current が切り替わった後 */
    protected abstract onCurrentMapChanged(): void;

    /** Entity が Map 上に出現したとき。 */
    protected abstract onEntityEnteredMap(entity: LEntity): void;

    /** Entity が Map から離れたとき。 */
    protected abstract onEntityLeavedMap(entity: LEntity): void;

    protected abstract onEntityReEnterMap(entity: LEntity): void;

    abstract onSetLandExitResult(result: LandExitResult): void;

    abstract onEquipmentChanged(entity: LEntity): void;


    //--------------------
    // Visual notifications

    public refreshGameMap(map: LMap): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onRefreshGameMap(map);
        }
    }

    public flushEffectResultOneEntity(entity: LEntity): void {
        if (entity._effectResult.hasResult()) {
            this.onFlushEffectResult(entity);
            entity._effectResult.showResultMessages(MRSystem.commandContext, entity);
            entity._effectResult.clear();
        }
    }

    public flushEffectResult(): void {
        for (const obj of MRLively.world.objects()) {
            if (obj && obj.objectType() == LObjectType.Entity) {
                const entity = obj as LEntity;
                this.flushEffectResultOneEntity(entity);
            }
        }
    }

    public flushSequelSet(sequelSet: SSequelSet): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onFlushSequelSet(sequelSet);
        }
    }

    public checkVisualSequelRunning(): boolean {
        if (!MRLively.recorder.isSilentPlayback()) {
            return this.onCheckVisualSequelRunning();
        }
        else {
            return false;
        }
    }
    
    public openDialog(model: SDialog): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onOpenDialog(model);
        }
    }

    public updateDialog(context: SDialogContext): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onUpdateDialog(context);
        }
    }

    public dialogClosed(context: SDialogContext, dialog: SDialog): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onDialogClosed(context, dialog);
        }
    }

    public raiseCurrentMapChanged(): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onCurrentMapChanged();
        }
    }

    public entityEnteredMap(entity: LEntity): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            if (!entity.floorId.equals(MRLively.mapView.currentFloorId)) return;
            this.onEntityEnteredMap(entity);
        }
    }

    public entityLeavedMap(entity: LEntity): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            this.onEntityLeavedMap(entity);
        }
    }

    public entityReEnterMap(entity: LEntity): void {
        if (!MRLively.recorder.isSilentPlayback()) {
            if (!entity.floorId.equals(MRLively.mapView.currentFloorId)) return;
            this.onEntityReEnterMap(entity);
        }
    }
}
