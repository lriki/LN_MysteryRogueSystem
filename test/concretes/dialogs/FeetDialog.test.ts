import { DBlockLayerKind } from "ts/mr/data/DCommon";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRData } from "ts/mr/data/MRData";
import { LActivity } from "ts/mr/objects/activities/LActivity";
import { LInventoryBehavior } from "ts/mr/objects/behaviors/LInventoryBehavior";
import { REGame } from "ts/mr/objects/REGame";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { RESystem } from "ts/mr/system/RESystem";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
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

test("concretes.dialogs.FeetDialog.Trap", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_地雷_A").id, [], "trap1"));
    REGame.world.transferEntity(trap1, floorId, 10, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const dialog = new SFeetDialog(player1, trap1);
    RESystem.dialogContext.activeDialog().openSubDialog(dialog);

    const commands = dialog.makeActionList();
    expect(commands.length).toBe(1);
    expect(commands[0].actionId).toBe(MRBasics.actions.trample);   // [踏む]
});


