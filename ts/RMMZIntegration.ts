import { RESequelSet } from "./RE/REGame_Sequel";
import { REIntegration } from "./system/REIntegration";
import { REMapBuilder } from "./system/REMapBuilder";
import { REVisual } from "./visual/REVisual";

export class RMMZIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number): void {
        throw new Error("Method not implemented.");
    }
    onLoadFixedMap(builder: REMapBuilder): void {
        throw new Error("Method not implemented.");
    }
    onFlushSequelSet(sequelSet: RESequelSet): void {
    }
    
    onCheckVisualSequelRunning(): boolean {
        return REVisual.manager.visualRunning();
    }
}