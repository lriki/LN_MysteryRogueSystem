import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { RESystem } from "ts/mr/system/RESystem";
import { TestEnv } from "../TestEnv";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LFloorId } from "ts/mr/objects/LFloorId";
import { UName } from "ts/mr/usecases/UName";
import { LActionTokenType } from "ts/mr/objects/LActionToken";
import { SDetailsDialog } from "ts/mr/system/dialogs/SDetailsDialog";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Identify.Details", () => {
    TestEnv.newGame();

    const player1 = TestEnv.setupPlayer(LFloorId.makeByRmmzFixedMapName("Sandbox-識別"), 10, 10);
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_識別の巻物_A").id, [], "item1"));
    inventory.addEntity(item1);

    // 説明文は表示されないこと。
    const dlg = new SDetailsDialog(item1);
    expect(dlg.description.includes("識別されていません")).toBeTruthy();
});

