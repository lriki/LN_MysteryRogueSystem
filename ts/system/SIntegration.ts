import { DEventId } from "ts/data/predefineds/DBasicEvents";
import { LandExitResult } from "ts/data/REData";
import { FMap } from "ts/floorgen/FMapData";
import { LBlock } from "ts/objects/LBlock";
import { LEntity } from "ts/objects/LEntity";
import { LMap } from "ts/objects/LMap";
import { REGame } from "ts/objects/REGame";
import { SSequelSet } from "ts/system/SSequel";
import { SDialog } from "./SDialog";
import { SDialogContext } from "./SDialogContext";

export abstract class SIntegration {
    public abstract onEventPublished(eventId: DEventId, args: any, handled: boolean): void;


    /**
     * REシステム内から、 RMMZ マップを移動する必要があるときに呼び出される。
     * (ゲームオーバー時に拠点フロアへ戻るときなど)
     */
    abstract onReserveTransferMap(mapId: number, x: number, y: number, d: number): void;

    abstract onLocateRmmzEvent(eventId: number, x: number, y: number): void;

    abstract onLoadFixedMapData(map: FMap): void;
    
    abstract onLoadFixedMapEvents(): void;

    abstract onUpdateBlock(block: LBlock): void;




    protected abstract onRefreshGameMap(map: LMap): void;

    protected abstract onFlushSequelSet(sequelSet: SSequelSet): void;

    protected abstract onCheckVisualSequelRunning(): boolean;
    
    /** Dialog が開かれたとき。 */
    protected abstract onOpenDialog(model: SDialog): void;

    protected abstract onUpdateDialog(context: SDialogContext): void;

    /** Dialog が閉じられたとき。 */
    protected abstract onDialogClosed(context: SDialogContext): void;

    /** Entity が Map 上に出現したとき。 */
    protected abstract onEntityEnteredMap(entity: LEntity): void;

    /** Entity が Map から離れたとき。 */
    protected abstract onEntityLeavedMap(entity: LEntity): void;

    protected abstract onEntityReEnterMap(entity: LEntity): void;

    abstract onSetLandExitResult(result: LandExitResult): void;


    //--------------------
    // Visual notifications

    public refreshGameMap(map: LMap): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onRefreshGameMap(map);
        }
    }

    public flushSequelSet(sequelSet: SSequelSet): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onFlushSequelSet(sequelSet);
        }
    }

    public checkVisualSequelRunning(): boolean {
        if (!REGame.recorder.isSilentPlayback()) {
            return this.onCheckVisualSequelRunning();
        }
        else {
            return false;
        }
    }
    
    public openDialog(model: SDialog): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onOpenDialog(model);
        }
    }

    public updateDialog(context: SDialogContext): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onUpdateDialog(context);
        }
    }

    public dialogClosed(context: SDialogContext): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onDialogClosed(context);
        }
    }

    public entityEnteredMap(entity: LEntity): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onEntityEnteredMap(entity);
        }
    }

    public entityLeavedMap(entity: LEntity): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onEntityLeavedMap(entity);
        }
    }

    public entityReEnterMap(entity: LEntity): void {
        if (!REGame.recorder.isSilentPlayback()) {
            this.onEntityReEnterMap(entity);
        }
    }
}
