import { DBasics } from "ts/re/data/DBasics";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { TestEnv } from "../../TestEnv";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { LActivity } from "ts/re/objects/activities/LActivity";

beforeAll(() => {
    TestEnv.setupDatabase();
});

//const Indices = [2, 3, 6, 9, 8, 7, 4, 1];
const Indices = [8, 7, 4, 1, 2, 3, 6, 9];

function dddd(dx: number, dy: number): number {
    // Y-Down なので、イメージ的には ↓方向が 0(=1=Math.PI*2). 反時計回りが+
    let r = Math.atan2(dx, dy);

    
    r = (r + Math.PI) / (Math.PI*2.0);  // 1週を 0~1 にする。+PIしているので、↑が 0 になる。
    r += 1.0 / 16.0;
    let index = 0;
    if (0.0 < r && r < 1.0) index = Math.floor(r * 8);
    //r = (r / (Math.PI*2.0)) * 2.0;   // 1週を 0~1 にする 0.5 しているので、↑が 0 になる。
    return Indices[index];
}

test("concretes.states.からぶり", () => {

    const ds = [
        dddd(-1, 1),
        dddd(0, 1),
        dddd(1, 1),
        dddd(-1, 0),
        dddd(1, 0),
        dddd(-1, -1),
        dddd(0, -1),
        dddd(1, -1),

        
        dddd(-1, 10),
        dddd(1, 10),
    ];

    TestEnv.newGame();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 10, 10);
    TestEnv.performFloorTransfer();
    actor1.addState(REData.getStateFuzzy("kState_UTからぶり").id);
    const actorHP1 = actor1.actualParam(DBasics.params.hp);
    
    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライム").id, [REData.getStateFuzzy("kState_UTからぶり").id], "enemy1"));
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 11, 10);
    const enemyHP1 = enemy1.actualParam(DBasics.params.hp);

    // 10 ターン分 シミュレーション実行
    RESystem.scheduler.stepSimulation();
    for (let i = 0; i < 10; i++) {
        // Player は右を向いて攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(actor1, RESystem.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();
    }

    // 互いに HP 減少は無い
    expect(actor1.actualParam(DBasics.params.hp)).toBe(actorHP1);
    expect(enemy1.actualParam(DBasics.params.hp)).toBe(enemyHP1);

    // 攻撃自体は互いに行われている
    const a = TestEnv.integration.skillEmittedCount;
    expect(TestEnv.integration.skillEmittedCount).toBe(20);
});

