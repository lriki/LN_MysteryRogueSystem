import { LInventoryBehavior } from "ts/mr/lively/behaviors/LInventoryBehavior";
import { MRLively } from "ts/mr/lively/MRLively";
import { SEntityFactory } from "ts/mr/system/SEntityFactory";
import { MRSystem } from "ts/mr/system/MRSystem";
import { TestEnv } from "./../TestEnv";
import { DEntityCreateInfo } from "ts/mr/data/DSpawner";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { MRDataExtension } from "ts/mr/data/MRDataExtension";
import { MRGameExtension } from "ts/mr/lively/MRGameExtension";
import { MRSystemExtension } from "ts/mr/system/MRSystemExtension";
import { MRData } from "ts/mr/data/MRData";
import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { LEntity } from "ts/mr/lively/LEntity";
import { DEntity } from "ts/mr/data/DEntity";
import { LEnemyBehavior } from "ts/mr/lively/behaviors/LEnemyBehavior";


export class TestDataExtension extends MRDataExtension {
    override onDatabaseLoaded(): void {
        const san = MRData.addParams("kParameter_SAN", "SAN");
    }
}

export class TestLivelyExtension extends MRGameExtension {

}

export class TestSystemExtension extends MRSystemExtension {
    onNewEntity(entity: LEntity, data: DEntity): void {
        if (entity.findEntityBehavior(LEnemyBehavior)) {
            entity.addBehavior(Test_LSaboteurBehavior);
        }
    }
}



class Test_LSaboteurBehavior extends LBehavior {
    public clone(newOwner: LEntity): LBehavior { throw new Error("Method not implemented."); }


}


/*
[2023/2/10] AI 拡張メモ
----------
直近では、周囲の状況を判断して、特定のスキルを発動するようにしたい。
一番簡単なのは onDecisionPhase() の AIMinor で判断することなのだが、
実際に行動を行うのは AIMajor なので、ちゃんと CharacterAI の仕組みに則る必要がある。

他の制約として、混乱や目つぶし状態では、このスキル判断処理はうごかない、というのも必要。

DesiredAction
行動決定の方法は考え中だが、行動決定した後の処理はほとんど確定的。
いまはその行動決定後の処理も各 Dataminator に任せてしまっているが、これは共通化しておきたい。
そうすると、行動決定の処理からの Output は、DesiredAction という形で「移動したい」「スキルを使いたい」などといった単位で出力するのがいいだろう。

### 状態を持ちたいか？
持ちたい。
- 同率優先度の攻撃対象が要る場合、前ターンのターゲットを維持したい。
- 数ターンに１度ランダム移動する場合のカウンタ。

でもクラスを分けるっていうのはなんか怖いんだよな…。
例えば Major には制約がかかるけど、 Minor にはかからない時、Entity が持っているデフォルトの行動を採用したいとき。
(稀にランダム移動する Enemy に行動制約がかかったとき)
確実なのは、DesiredAction だけ決定するクラスを作って、それのリストをチェーンする感じがよいか。

ある意味 onDecisionPhase() がその役割だけど、それをちゃんと使った方が良い？
→ onDecisionPhase() はこれ自体が行動決定するというより、行動決定する別のモジュールに処理をタイミングを委譲するという役割。
  Player(ManualMovment) なら Dialog に流すし、AI なら Dataminator、状態異常でマニュアル操作できなければ Behavior 側でなにがしする、とか。
  Dataminator は引き続き独立させた方が良いだろう。

*/


beforeAll(() => {
    MRData.ext = new TestDataExtension();
    MRLively.ext = new TestLivelyExtension();
    MRSystem.ext = new TestSystemExtension();
    TestEnv.setupDatabase();
});

test("extension.Extension.Basic", () => {
    const paramSAN = MRData.getParameter("kParameter_SAN");
    expect(paramSAN).not.toBeUndefined();
});

test("extension.Extension.AI", () => {
    TestEnv.newGame();
    const floorId = TestEnv.FloorId_FlatMap50x50;

    const player1 = TestEnv.setupPlayer(floorId, 10, 10, 6);
    
    const enemy1 = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity("kEntity_スライムA").id, [], "enemy1"));
    TestEnv.transferEntity(enemy1, floorId, 11, 10);

    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    //----------------------------------------------------------------------------------------------------
    
    // [待機]
    MRSystem.dialogContext.postActivity(LActivity.make(player1).withConsumeAction());
    MRSystem.dialogContext.activeDialog().submit();
    
    MRSystem.scheduler.stepSimulation();    // Advance Simulation ----------

    // const hp = enemy1.getActualParam(MRBasics.params.hp);
    // expect(hp < initialHP).toBeTruthy();      // ダメージを受けているはず


});
