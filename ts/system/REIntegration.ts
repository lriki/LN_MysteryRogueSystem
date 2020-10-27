import { REMapBuilder } from "./REMapBuilder";

export abstract class REIntegration {
    /**
     * フロアを移動するときに呼び出される。
     * @param floorId 
     */
    abstract onReserveTransferFloor(floorId: number): void;

    abstract onLoadFixedMap(builder: REMapBuilder): void;
}
