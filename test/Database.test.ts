import { TestEnv } from "./TestEnv";
import "./Extension";
import { MRData } from "ts/mr/data/MRData";

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
    // {
    //     const land = lands[3];
    //     expect(land.isWorldLand).toBeFalsy();
    //     expect(land.exitMapId).not.toBe(0);
    //     const exitMap = maps[land.exitMapId];
    //     expect(exitMap.landId).toBe(land.id);
    // }
});
