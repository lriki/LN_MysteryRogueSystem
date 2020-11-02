import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESequelSet } from "ts/RE/REGame_Sequel";
import { REDialogVisual } from "ts/visual/REDialogVisual";
import { REDialogContext } from "./REDialog";
import { REMapBuilder } from "./REMapBuilder";

export abstract class REIntegration {
    /**
     * フロアを移動するときに呼び出される。
     * @param floorId 
     */
    abstract onReserveTransferFloor(floorId: number): void;

    abstract onLoadFixedMap(builder: REMapBuilder): void;

    abstract onFlushSequelSet(sequelSet: RESequelSet): void;

    abstract onCheckVisualSequelRunning(): boolean;
    
    /** Dialog が開かれたとき。 */
    abstract onDialogOpend(context: REDialogContext): REDialogVisual | undefined;

    /** Dialog が閉じられたとき。 */
    abstract onDialogClosed(context: REDialogContext): void;

    /** Entity が Map 上に出現したとき。 */
    abstract onEntityEnteredMap(entity: REGame_Entity): void;

    /** Entity が Map から離れたとき。 */
    abstract onEntityLeavedMap(entity: REGame_Entity): void;
}
