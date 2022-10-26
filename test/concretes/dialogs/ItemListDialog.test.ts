import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { SItemListDialog } from "ts/mr/system/dialogs/SItemListDialog";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

// Safety Map では ItemDialog からアクションリストは生成されないこと
test("concretes.dialogs.ItemListDialog.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_DefaultNormalMap;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    const inventory1 = player1.getEntityBehavior(LInventoryBehavior);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_薬草A").id, [], "item1"));
    inventory1.addEntity(item1);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const dialog = new SItemListDialog(player1, inventory1);
    const actionList = dialog.makeActionList(item1);
    expect(actionList.length).toBe(0);
});

