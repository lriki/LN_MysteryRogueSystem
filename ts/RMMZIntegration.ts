import { assert } from "./Common";
import { REData } from "./data/REData";
import { REDataManager } from "./data/REDataManager";
import { REGame } from "./RE/REGame";
import { TileKind } from "./RE/REGame_Block";
import { REGame_Entity } from "./RE/REGame_Entity";
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
                    entity.rmmzEventId = e.eventId();
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
    
    onEntityEnteredMap(entity: REGame_Entity): void {
        const databaseMap = REDataManager.databaseMap();
        assert(databaseMap);
        assert(databaseMap.events);
        
        //  entity に対応する動的イベントを新たに生成する
        if (entity.prefabKey.kind > 0 && entity.prefabKey.id > 0) {
            const prefabKey = `${REData.entityKinds[entity.prefabKey.kind].prefabKind}:${entity.prefabKey.id}`;
            const index = databaseMap.events.findIndex(x => (x) ? x.name == prefabKey : false);
            if (index >= 0) {
                const eventData = databaseMap.events[index];
                const event = $gameMap.spawnREEvent(eventData);
                entity.rmmzEventId = event.eventId();
            }
            else {
                throw new Error(`${prefabKey} not found in REDatabase map.`);
            }
        }
        else if (entity.prefabKey.kind == 0 && entity.prefabKey.id > 0) {
            // entity は、RMMZ のマップ上に初期配置されているイベントを元に作成された。
            // 固定マップの場合はここに入ってくるが、$gameMap.events の既存のインスタンスを参照しているため追加は不要。
        }
        else {
            // Tile などは RMMZ のイベント化する必要はない
            return;
        }

        REVisual.entityVisualSet?.createVisual(entity);
    }

    onEntityLeavedMap(entity: REGame_Entity): void {
        REVisual.entityVisualSet?.deleteVisual(entity);

        // TODO: イベントを消す
        throw new Error("Method not implemented.");
    }
}