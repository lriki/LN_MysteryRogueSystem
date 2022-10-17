import { MRLively } from "ts/mr/lively/MRLively";
import { TestEnv } from "./TestEnv";
import "./Extension";
import { MRSystem } from "ts/mr/system/MRSystem";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { assert } from "ts/mr/Common";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRData } from "ts/mr/data/MRData";
import { LFloorId } from "ts/mr/lively/LFloorId";
import { SEventExecutionDialog } from "ts/mr/system/dialogs/SEventExecutionDialog";
import { LItemBehavior } from "ts/mr/lively/behaviors/LItemBehavior";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("Database.Land", () => {
    TestEnv.newGame();
    const lands = MRData.lands;
    const maps = MRData.maps;

    // Id=1 は Vanilla.
    const land1 = lands[1];
    expect(land1.isVanillaLand).toBeTruthy();

    // // Id=2 は World.
    // const land2 = lands[2];
    // expect(land2.isWorldLand).toBeTruthy();

    // ExitMap はその親 Land に属する。
    {
        const land = lands[3];
        expect(land.isWorldLand).toBeFalsy();
        expect(land.exitMapId).not.toBe(0);
        const exitMap = maps[land.exitMapId];
        expect(exitMap.landId).toBe(land.id);
    }
});
