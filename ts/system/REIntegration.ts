import { FMap } from "ts/floorgen/FMapData";
import { LEntity } from "ts/objects/LEntity";
import { RESequelSet } from "ts/objects/REGame_Sequel";
import { REDialogContext } from "./REDialog";

export abstract class REIntegration {
    /**
     * フロアを移動するときに呼び出される。
     * @param floorId 
     */
    abstract onReserveTransferFloor(floorId: number, x: number, y:number, d: number): void;

    abstract onLoadFixedMapData(map: FMap): void;
    
    abstract onLoadFixedMapEvents(): void;

    abstract onFlushSequelSet(sequelSet: RESequelSet): void;

    abstract onCheckVisualSequelRunning(): boolean;
    
    /** Dialog が開かれたとき。 */
    abstract onDialogOpend(context: REDialogContext): void;

    abstract onUpdateDialog(context: REDialogContext): void;

    /** Dialog が閉じられたとき。 */
    abstract onDialogClosed(context: REDialogContext): void;

    /** Entity が Map 上に出現したとき。 */
    abstract onEntityEnteredMap(entity: LEntity): void;

    /** Entity が Map から離れたとき。 */
    abstract onEntityLeavedMap(entity: LEntity): void;
}
