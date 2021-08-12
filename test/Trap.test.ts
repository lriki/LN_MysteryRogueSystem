import { assert } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { SGameManager } from "ts/system/SGameManager";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { DialogSubmitMode } from "ts/system/SDialog";
import { REData } from "ts/data/REData";
import { DEntityCreateInfo } from "ts/data/DEntity";
import { LActivity } from "ts/objects/activities/LActivity";
import { LTrapBehavior } from "ts/objects/behaviors/LTrapBehavior";
import { DBasics } from "ts/data/DBasics";
import { TileShape } from "ts/objects/LBlock";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Trap.Basic", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap));
    trap1._name = "trap1";
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    // TODO: 罠state:必ず発動

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // player を右へ移動
    const dialogContext = RESystem.dialogContext;
    dialogContext.postActivity(LActivity.makeMoveToAdjacent(actor1, 6));
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(actor1.states()[0].stateDataId()).toBe(TestEnv.StateId_Sleep);   // 睡眠状態
});

test("Trap.Enemy", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // trap1 生成&配置
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap));
    trap1._name = "trap1";
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    // TODO: 罠state:必ず発動

    // enemy1
    const enemy1 = SEntityFactory.newMonster(REData.enemyEntity(1));
    enemy1._name = "enemy1";
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 12, 10);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 足踏み
    const dialogContext = RESystem.dialogContext;
    dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    expect(enemy1.states().length).toBe(0); // Enemy は罠にはかからないこと
});

test("Trap.Attack", () => {
    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();

    // trap1
    const trap1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap1"));
    REGame.world._transferEntity(trap1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10); // 罠の上に配置
    const hp1 = enemy1.actualParam(DBasics.params.hp);

    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------
    
    // 右を向いて攻撃
    actor1.dir = 6;
    RESystem.dialogContext.commandContext().postPerformSkill(actor1, RESystem.skills.normalAttack, undefined);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // Enemy がダメージを受けていることを確認
    const hp2 = enemy1.actualParam(DBasics.params.hp);
    expect(hp2 < hp1).toBe(true);

    // 敵に効果がある状態では、罠は露出しない
    const behavior1 = trap1.getBehavior(LTrapBehavior);
    expect(behavior1.exposed()).toBe(false);

    //--------------------

    // Enemy をどける
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 15, 10); // 罠の上に配置

    // 右を向いて攻撃
    actor1.dir = 6;
    RESystem.dialogContext.commandContext().postPerformSkill(actor1, RESystem.skills.normalAttack, undefined);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 露出している
    const behavior2 = trap1.getBehavior(LTrapBehavior);
    expect(behavior2.exposed()).toBe(true);

    //--------------------
    // 壁あり斜め攻撃では露出しない

    // Player の右下に罠を作る
    const trap2 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(TestEnv.EntityId_SleepTrap, [], "trap2"));
    REGame.world._transferEntity(trap2, TestEnv.FloorId_FlatMap50x50, 11, 11);

    // Player の下に壁を作る
    REGame.map.block(10, 11)._tileShape = TileShape.Wall;

    // 右下を向いて攻撃
    actor1.dir = 3;
    RESystem.dialogContext.commandContext().postPerformSkill(actor1, RESystem.skills.normalAttack, undefined);
    RESystem.dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
    RESystem.scheduler.stepSimulation(); // Advance Simulation --------------------------------------------------

    // 露出しない
    const behavior3 = trap2.getBehavior(LTrapBehavior);
    expect(behavior3.exposed()).toBe(false);
});

