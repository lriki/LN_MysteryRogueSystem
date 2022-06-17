import { MRBasics } from "ts/re/data/MRBasics";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { MRData } from "ts/re/data/MRData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

test("abilities.enemy.ItemImitator", () => {
    TestEnv.newGame();

    // player1
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);
    const initialHP = player1.actualParam(MRBasics.params.hp);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [MRData.getState("kState_UTアイテム擬態").id], "enemy1"));
    enemy1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    // MiniMap の表示はアイテムになっている
    const minimap = RESystem.minimapData;
    minimap.update();
    expect(minimap.getData(11, 10, 1)).toBe(minimap.itemMarkerTileId());

    //----------------------------------------------------------------------------------------------------

    // Enemy の上に移動してみる
    RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
    RESystem.dialogContext.activeDialog().submit();

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // 移動は失敗している
    expect(player1.mx).toBe(10);
    
    const hp = player1.actualParam(MRBasics.params.hp);
    expect(hp < initialHP).toBe(true);  // ダメージを受けているはず
});

test("abilities.enemy.Issue1", () => {
    TestEnv.newGame();

    // player1
    const player1 = TestEnv.setupPlayer(TestEnv.FloorId_FlatMap50x50, 10, 10);

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [MRData.getState("kState_UTアイテム擬態").id], "enemy1"));
    REGame.world.transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 20, 10);

    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    
    //----------------------------------------------------------------------------------------------------

    // [待機]
    for (let i = 0; i < 10; i++) {
        RESystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        expect(enemy1.mx).toBe(20);
        expect(enemy1.my).toBe(10);
    }
});
