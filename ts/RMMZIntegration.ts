import { REGame } from "./RE/REGame";
import { TileKind } from "./RE/REGame_Block";
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
        if (!$dataMap) {
            throw new Error();
        }
        builder.reset($dataMap.width ?? 10, $dataMap.height ?? 10);

        for (let y = 0; y < builder.height(); y++) {
            for (let x = 0; x < builder.width(); x++) {
                if ($gameMap.checkPassage(x, y, 0xF)) {
                    builder.setTileKind(x, y, TileKind.Floor);
                }
                else {
                    builder.setTileKind(x, y, TileKind.HardWall);
                }
            }
        }

        // 固定マップ上のイベントを Entity として出現させる
        $dataMap.events?.forEach(x => {
            //REGame.world.spawnEntity()
        });
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