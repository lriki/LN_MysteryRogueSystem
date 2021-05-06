import { FMap } from "ts/floorgen/FMapData";
import { LEntity } from "ts/objects/LEntity";
import { LMap } from "ts/objects/LMap";
import { RESequelSet } from "ts/objects/REGame_Sequel";
import { SDialogContext } from "./SDialogContext";

export abstract class REIntegration {
    /**
     * REシステム内から、 RMMZ マップを移動する必要があるときに呼び出される。
     * (ゲームオーバー時に拠点フロアへ戻るときなど)
     */
    abstract onReserveTransferMap(mapId: number, x: number, y:number, d: number): void;

    abstract onLoadFixedMapData(map: FMap): void;
    
    abstract onLoadFixedMapEvents(): void;

    abstract onRefreshGameMap(map: LMap, initialMap: FMap): void;

    abstract onFlushSequelSet(sequelSet: RESequelSet): void;

    abstract onCheckVisualSequelRunning(): boolean;
    
    /** Dialog が開かれたとき。 */
    abstract onDialogOpend(context: SDialogContext): void;

    abstract onUpdateDialog(context: SDialogContext): void;

    /** Dialog が閉じられたとき。 */
    abstract onDialogClosed(context: SDialogContext): void;

    /** Entity が Map 上に出現したとき。 */
    abstract onEntityEnteredMap(entity: LEntity): void;

    /** Entity が Map から離れたとき。 */
    abstract onEntityLeavedMap(entity: LEntity): void;
}
