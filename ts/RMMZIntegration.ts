import { REIntegration } from "./system/REIntegration";
import { REMapBuilder } from "./system/REMapBuilder";

export class RMMZIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number): void {
        throw new Error("Method not implemented.");
    }
    onLoadFixedMap(builder: REMapBuilder): void {
        throw new Error("Method not implemented.");
    }
}