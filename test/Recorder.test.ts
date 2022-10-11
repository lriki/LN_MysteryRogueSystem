
import { TestEnv } from "./TestEnv";
import "./Extension";
import "../ts/mr/lively/Extensions";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { MRData } from "ts/mr/data/MRData";
import { DEntityCreateInfo } from "ts/mr/data/DEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { SGameManager } from "ts/mr/system/SGameManager";
import { TestJsonEx } from "./TestJsonEx";

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

test("Recorder.Basic1", async () => {
    TestEnv.newGame();
    MRLively.recorder.setSavefileId(999);
    const floorId = TestEnv.FloorId_FlatMap50x50;

    // Player
    const player1 = TestEnv.setupPlayer(floorId, 10, 10);
    player1.addState(TestEnv.StateId_CertainDirectAttack);   // 攻撃必中にする
    await MRLively.recorder.startRecording();

    // enemy1
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライム_A").id, [], "enemy1"));
    MRLively.world.transferEntity(enemy1, floorId, 13, 10);  // 配置
    const initialHP1 = enemy1.actualParam(MRBasics.params.hp);

    // 初期状態を Save
    const savedata1 = TestJsonEx.stringify(SGameManager.makeSaveContentsCore());

    {
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

        // 右へ移動
        MRSystem.dialogContext.postActivity(LActivity.makeDirectionChange(player1, 6));
        MRSystem.dialogContext.postActivity(LActivity.makeMoveToAdjacent(player1, 6).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();

        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
        
        // 右へ攻撃
        MRSystem.dialogContext.postActivity(LActivity.makePerformSkill(player1, MRData.system.skills.normalAttack, 6).withConsumeAction());
        MRSystem.dialogContext.activeDialog().submit();
    
        MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------
    }

    await MRLively.recorder.stopRecording();

    const resultHP2 = enemy1.actualParam(MRBasics.params.hp);

    //----------------------------------------------------------------------------------------------------

    // 初期状態を Load
    SGameManager.loadGame(TestJsonEx.parse(savedata1), true);

    // 同一IDの LEntity を取得してみる。それぞれ ID は一致するが、インスタンスは別物となっている。
    const player1_2 = MRLively.world.entity(player1.entityId());
    const enemy1_2 = MRLively.world.entity(enemy1.entityId());
    expect(player1.equals(player1_2)).toBeTruthy();
    expect(player1 == player1_2).toBeFalsy();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    const resultHP3 = enemy1_2.actualParam(MRBasics.params.hp);
    expect(resultHP2).toBe(resultHP3);
});

