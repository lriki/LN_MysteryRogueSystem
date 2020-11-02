import { REGame } from "./RE/REGame";
import { TileKind } from "./RE/REGame_Block";
import { RESequelSet } from "./RE/REGame_Sequel";
import { RMMZHelper } from "./rmmz/RMMZHelper";
import { REDialogContext } from "./system/REDialog";
import { REEntityFactory } from "./system/REEntityFactory";
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
        $gameMap.events().forEach((e: Game_Event) => {
            if (e) {
                const metadata = RMMZHelper.readEntityMetadata(e);
                if (metadata.entity) {
                    const entity = REEntityFactory.newEntityFromName(metadata.entity);
                    entity.prefabKey = { kind: 0, id: e.eventId() };
                    REGame.world._transfarEntity(entity, REGame.map.floorId(), e.x, e.y);
                    REGame.map.markAdhocEntity(entity);
                }
            }
        });
    }
    onFlushSequelSet(sequelSet: RESequelSet): void {
    }
    
    onCheckVisualSequelRunning(): boolean {
        if (REVisual.entityVisualSet)
            return REVisual.entityVisualSet.visualRunning();
        else
            return false;
    }
    onDialogOpend(context: REDialogContext): REDialogVisual | undefined {
        if (REVisual.manager)
            return REVisual.manager.handleDialogOpend(context);
        else
            return undefined;
    }
    onDialogClosed(context: REDialogContext): void {
        if (REVisual.manager) {
            REVisual.manager.handleDialogClosed(context);
        }
    }
}