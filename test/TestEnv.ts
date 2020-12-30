import { DBasics } from "ts/data/DBasics";
import { REData, REFloorMapKind } from "ts/data/REData";
import { REDataManager } from "ts/data/REDataManager";
import { FMap } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { REGame_Entity } from "ts/objects/REGame_Entity";
import { RESequelSet } from "ts/objects/REGame_Sequel";
import { LDebugMoveRightState } from "ts/objects/states/DebugMoveRightState";
import { LStateBehavior } from "ts/objects/states/LStateBehavior";
import { REDialogContext } from "ts/system/REDialog";
import { REIntegration } from "ts/system/REIntegration";

declare global {
    interface Number {
        clamp(min: number, max: number): number;
    }
}

Number.prototype.clamp = function(min: number, max: number): number{
    const num = (this as Number).valueOf();
    return Math.min(Math.max(num, min), max);
};

export class TestEnv {
    static activeSequelSet: RESequelSet;

    static setupDatabase() {
        REData.reset();
        REDataManager.setupCommonData();

        // Lands
        REData.addLand({
            id: -1,
            rmmzMapId: 1,
            eventTableMapId: 0,
            itemTableMapId: 0,
            enemyTableMapId: 0,
            trapTableMapId: 0,
            exitEMMZMapId: 1001,
            floorIds: [],
        });
        REData.addLand({
            id: -1,
            rmmzMapId: 2,
            eventTableMapId: 0,
            itemTableMapId: 0,
            enemyTableMapId: 0,
            trapTableMapId: 0,
            exitEMMZMapId: 1002,
            floorIds: [],
        });
        REData.addLand({
            id: -1,
            rmmzMapId: 3,
            eventTableMapId: 0,
            itemTableMapId: 0,
            enemyTableMapId: 0,
            trapTableMapId: 0,
            exitEMMZMapId: 1003,
            floorIds: [],
        });

        // Floors
        REData.addFloor(4, 1, REFloorMapKind.FixedMap);
        REData.addFloor(5, 1, REFloorMapKind.FixedMap);
        REData.addFloor(6, 1, REFloorMapKind.FixedMap);

        // States
        {
            DBasics.states = {
                dead: REData.addState("Dead", () => new LStateBehavior()),
                nap: 0,
                debug_MoveRight: REData.addState("debug_MoveRight", () => new LDebugMoveRightState()),
            };
        }

        // Skills
        {
            const id = REData.addSkill("NormalAttack");
        }

        // Items
        {
            const id = REData.addItem("薬草");

        }

        // Unique Entitise
        REData.addActor("Unique1");

        // Enemies
        REData.addMonster("Enemy1");
        REData.addMonster("Enemy2");
        REData.addMonster("Enemy3");
        
        REGame.integration = new TestEnvIntegration();
    }
}

export class TestEnvIntegration extends REIntegration {
    onReserveTransferFloor(floorId: number): void {
        // TestEnv では全部動的生成するのでファイルロードは不要
    }

    onLoadFixedMapData(map: FMap): void {
        if (map.floorId() == 1) {
            // 50x50 の空マップ
            map.reset(50, 50);
        }
        else {
            throw new Error("Method not implemented.");
        }
    }

    onLoadFixedMapEvents(): void {
    }

    onFlushSequelSet(sequelSet: RESequelSet): void {
        TestEnv.activeSequelSet = sequelSet;
    }
    onCheckVisualSequelRunning(): boolean {
        return false;
    }
    onDialogOpend(context: REDialogContext): void {
    }
    onDialogClosed(context: REDialogContext): void {
    }
    onUpdateDialog(context: REDialogContext): void {
    }
    onEntityEnteredMap(entity: REGame_Entity): void {
    }
    onEntityLeavedMap(entity: REGame_Entity): void {
    }
}
