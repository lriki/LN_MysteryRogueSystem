import { RESequelSet } from "./RE/REGame_Sequel";
import { REDialogContext } from "./system/REDialog";
import { REIntegration } from "./system/REIntegration";
import { REMapBuilder } from "./system/REMapBuilder";
import { REDialogVisual } from "./visual/REDialogVisual";
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
    onDialogOpend(context: REDialogContext): REDialogVisual | undefined {
        return REVisual.manager.handleDialogOpend(context);
    }
    onDialogClosed(context: REDialogContext): void {
        REVisual.manager.handleDialogClosed(context);
    }
}