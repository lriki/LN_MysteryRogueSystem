import { DBlockLayerKind } from "ts/re/data/DCommon";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { MRBasics } from "ts/re/data/MRBasics";
import { MRData } from "ts/re/data/MRData";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/re/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/re/objects/REGame";
import { SFeetDialog } from "ts/re/system/dialogs/SFeetDialog";
import { RESystem } from "ts/re/system/RESystem";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { TestEnv } from "../../TestEnv";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("concretes.dialogs.FeetDialog.test", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const item1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ゴブリンのこん棒_A").id, [], "item1"));
    REGame.world.transferEntity(item1, floorId, 10, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const dialog = new SFeetDialog(player1, item1);
    RESystem.dialogContext.activeDialog().openSubDialog(dialog);

    const commands = dialog.makeActionList();
    expect(commands.length).toBe(2);
    expect(commands[0].actionId).toBe(MRBasics.actions.PickActionId);   // [拾う]
    expect(commands[1].actionId).toBe(MRBasics.actions.ThrowActionId);  // [投げる]

    //----------------------------------------------------------------------------------------------------

    // Command 経由で [拾う]
    commands[0].execute();
    
    // execute の結果 submit され、Dialog はすべてクローズされる
    expect(RESystem.dialogContext.dialogs().length).toBe(0);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    const inventory = player1.getEntityBehavior(LInventoryBehavior);

    // item1 は Map 上から外れている
    const block = REGame.map.block(10, 10);
    expect(block.layer(DBlockLayerKind.Ground).isContains(item1)).toBe(false);

    // item1 がインベントリに追加されている
    expect(inventory.items.length).toBe(1);
    expect(inventory.items[0]).toBe(item1);
});

test("concretes.dialogs.FeetDialog.ExitPoint", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const exitPoint1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_ExitPoint_A").id, [], "exitPoint1"));
    REGame.world.transferEntity(exitPoint1, floorId, 10, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const dialog = new SFeetDialog(player1, exitPoint1);
    RESystem.dialogContext.activeDialog().openSubDialog(dialog);

    const commands = dialog.makeActionList();
    expect(commands.length).toBe(1);
    expect(commands[0].actionId).toBe(MRBasics.actions.ForwardFloorActionId);   // [進む]
});

