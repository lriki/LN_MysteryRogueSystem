
import { TestEnv } from "./TestEnv";
import "./Extension";
import "./../ts/re/objects/Extensions";
import { REGame } from "ts/re/objects/REGame";
import { SEntityFactory } from "ts/re/system/SEntityFactory";
import { RESystem } from "ts/re/system/RESystem";
import { REData } from "ts/re/data/REData";
import { DEntityCreateInfo } from "ts/re/data/DEntity";
import { REBasics } from "ts/re/data/REBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { UAction } from "ts/re/usecases/UAction";
import { SGameManager } from "ts/re/system/SGameManager";
import { TestJsonEx } from "./TestJsonEx";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Recorder.Basic1", async () => {
    TestEnv.newGame();
    REGame.recorder.setSavefileId(999);
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    await REGame.recorder.startRecording();

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(REData.getEntity("kEnemy_スライムA").id, [], "enemy1"));
    REGame.world._transferEntity(enemy1, floorId, 13, 10);  // 配置
    const initialHP1 = enemy1.actualParam(REBasics.params.hp);

    // 初期状態を Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());

    {
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // 右へ移動
        RESystem.dialogContext.postActivity(LActivity.makeDirectionChange(player1, 6));
        RESystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();

        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
        
        // 右へ攻撃
        RESystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, RESystem.skills.normalAttack, 6).withConsumeAction());
        RESystem.dialogContext.activeDialog().submit();
    
        RESystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    await REGame.recorder.stopRecording();

    const resultHP2 = enemy1.actualParam(REBasics.params.hp);

    //----------------------------------------------------------------------------------------------------

    // 初期状態を Load
    SGameManager.loadGame(TestJsonEx.parse(savedata1));

    // 同一IDの LEntity を取得してみる。それぞれ ID は一致するが、インスタンスは別物となっている。
    const player1_2 = REGame.world.entity(player1.entityId());
    const enemy1_2 = REGame.world.entity(enemy1.entityId());
    expect(player1.equals(player1_2)).toBeTruthy();
    expect(player1 == player1_2).toBeFalsy();
    
    RESystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const resultHP3 = enemy1_2.actualParam(REBasics.params.hp);
    expect(resultHP2).toBe(resultHP3);
});

