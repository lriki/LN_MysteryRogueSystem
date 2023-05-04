import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { LInventoryBehavior } from "ts/mr/lively/entity/LInventoryBehavior";
import { SItemListDialog, SItemListDialogSourceAction } from "ts/mr/system/dialogs/SItemListDialog";
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

    const dialog = new SItemListDialog(player1, inventory1, SItemListDialogSourceAction.Default);
    dialog.focusEntity(item1);
    const actionList = dialog.makeActionList();
    expect(actionList.length).toBe(0);
});

