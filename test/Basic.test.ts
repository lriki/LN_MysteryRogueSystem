// NOTE:
//   https://qiita.com/t-toyota/items/93cce73004b9f765cfcf

import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/system/dialogs/REManualDecisionDialog";
import { REGame } from "ts/objects/REGame";
import { SGameManager } from "ts/system/SGameManager";
import { LUnitAttribute } from "ts/objects/attributes/LUnitAttribute";
import { LEntity } from "ts/objects/LEntity";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { SEntityFactory } from "ts/system/SEntityFactory";
import { DBasics } from "ts/data/DBasics";
import { LEntityId } from "ts/objects/LObject";
import { LDirectionChangeActivity } from "ts/objects/activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { DialogSubmitMode } from "ts/system/SDialog";

//import "js/rmmz_objects.js"

//var aaa = require("./../js/rmmz_objects.js");
//(global as any).Game_Temp = aaa.Game_Temp;


/*
const fs = require("fs");
var ttttt = fs.readFileSync("./js/rmmz_objects.js").toString();
//eval(ttttt);

(window as any)["Game_Temp"] = function() {
    // New class name constructor code
};

const gt = Game_Temp;
const proto = Game_Temp.prototype;
(window as any)["Game_Temp"].prototype = Game_Temp.prototype;

(window as any)["Game_Temp"] = gt;
*/



//function Game_Temp() {
    //this.initialize(...arguments);
//}

//eval("function Game_Temp() { }");


//var ss = Game_Temp;

beforeAll(() => {
    TestEnv.setupDatabase();
});

afterAll(() => {
});

/*
class BattlerAttr extends REGame_Attribute {

}
class ActorAttr extends BattlerAttr {
    
}
*/

test("Basic1", () => {
    //const taa = aaa;
    //const t = Game_Temp;
    //const ac = new Game_Temp();
   // const tc = ac._destinationY;
   // ac._destinationX = 1000;

    // NewGame.
    SGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);

    // フロア移動。最初はどこでもないフロアにいるので、マップ遷移が要求される。
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 5, 5);

    // 【RMMZ で使うときはこのあたりで $dataMap をロードしたりする】

    // マップ遷移確定。実際にランダムマップ等が生成され、Entity が配置される。
    TestEnv.performFloorTransfer();

    // シミュレーション 1 回実行
    RESystem.scheduler.stepSimulation();
    
    const dialogContext = RESystem.dialogContext;
    
    // 方向転換してみる (ターン消費無し)
    {
        // マニュアル操作の Dialog が開かれている
        const dialog1 = dialogContext.activeDialog();
        expect((dialog1 instanceof REManualActionDialog)).toBe(true);
    
        // 向き変更。行動を消費せず Dialog を閉じる
        dialogContext.postActivity(LDirectionChangeActivity.make(actor1, 9));
        dialogContext.activeDialog().submit();
    
        // この時点では向きは変更されていない
        expect(actor1.dir != 9).toBe(true);
        
        // シミュレーション実行
        RESystem.scheduler.stepSimulation();
        
        // 行動の消費が無いので、再び ManualActionDialog が開かれる。
        // しかし一度閉じているので、違うインスタンスで開かれている。
        expect((dialogContext.activeDialog() instanceof REManualActionDialog)).toBe(true);
        expect((dialog1 != dialogContext.activeDialog())).toBe(true);
    
        // この時点では向きは変更されている
        expect(actor1.dir).toBe(9);
    
    }

    // 一歩下に移動してみる (ターン消費あり)
    {
        dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 2));
        dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
        // シミュレーション実行。実際に移動が行われる
        RESystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.x).toBe(5);
        expect(actor1.y).toBe(6);
    
        // 移動に伴い実行されるべきアニメーション情報も作られている
        expect(TestEnv.activeSequelSet.runs().length).toBe(1);
        expect(TestEnv.activeSequelSet.runs()[0].clips().length).toBe(1);
    }
});


test("Basic.TurnOrderTable", () => {
    //--------------------
    // 準備
    SGameManager.createGameObjects();

    // actor1 - x1 速
    const actor1 = REGame.world.entity(REGame.system.mainPlayerEntityId);
    actor1.findBehavior(LUnitBehavior)?.setSpeedLevel(1);
    REGame.world._transferEntity(actor1, TestEnv.FloorId_FlatMap50x50, 1, 5);

    // enemy1 - x1 速
    const enemy1 = SEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    enemy1.findBehavior(LUnitBehavior)?.setSpeedLevel(1);
    enemy1.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy1, TestEnv.FloorId_FlatMap50x50, 1, 6);

    // enemy2 - x1 速
    const enemy2 = SEntityFactory.newMonster(1);
    enemy2._name = "enemy2";
    enemy2.findBehavior(LUnitBehavior)?.setSpeedLevel(1);
    enemy2.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy2, TestEnv.FloorId_FlatMap50x50, 1, 7);

    // enemy3 - x2 速
    const enemy3 = SEntityFactory.newMonster(1);
    enemy3._name = "enemy3";
    enemy3.findBehavior(LUnitBehavior)?.setSpeedLevel(2);
    enemy3.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy3, TestEnv.FloorId_FlatMap50x50, 1, 8);

    // enemy4 - x2 速
    const enemy4 = SEntityFactory.newMonster(1);
    enemy4._name = "enemy4";
    enemy4.findBehavior(LUnitBehavior)?.setSpeedLevel(2);
    enemy4.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy4, TestEnv.FloorId_FlatMap50x50, 1, 9);

    // enemy5 - x3 速
    const enemy5 = SEntityFactory.newMonster(1);
    enemy5._name = "enemy5";
    enemy5.findBehavior(LUnitBehavior)?.setSpeedLevel(3);
    enemy5.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy5, TestEnv.FloorId_FlatMap50x50, 1, 10);

    // enemy6 - x3 速
    const enemy6 = SEntityFactory.newMonster(1);
    enemy6._name = "enemy6";
    enemy6.findBehavior(LUnitBehavior)?.setSpeedLevel(3);
    enemy6.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy6, TestEnv.FloorId_FlatMap50x50, 1, 11);

    // enemy7 - x0.5 速
    const enemy7 = SEntityFactory.newMonster(1);
    enemy7._name = "enemy7";
    enemy7.findBehavior(LUnitBehavior)?.setSpeedLevel(-1);
    enemy7.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy7, TestEnv.FloorId_FlatMap50x50, 1, 12);

    // enemy8 - x0.5 速
    const enemy8 = SEntityFactory.newMonster(1);
    enemy8._name = "enemy8";
    enemy8.findBehavior(LUnitBehavior)?.setSpeedLevel(-1);
    enemy8.addState(DBasics.states.debug_MoveRight);
    REGame.world._transferEntity(enemy8, TestEnv.FloorId_FlatMap50x50, 1, 13);

    TestEnv.performFloorTransfer();
    RESystem.scheduler.stepSimulation();

    //--------------------
    // 最初の行動予定順をチェック
    {
        const runs = REGame.scheduler.actionScheduleTable();
        expect(runs.length).toBe(3);    // map 上の Entity のうち最大速度はx3なので、Run は3つ。

        const run0 = runs[0].steps;
        expect(run0.length).toBe(5);
        expect(REGame.world.entity(run0[0].unit.entityId)).toEqual(actor1);  // 先頭は Player
        expect(run0[0].iterationCount).toEqual(1);
        expect(REGame.world.entity(run0[1].unit.entityId)).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run0[1].iterationCount).toEqual(2);
        expect(REGame.world.entity(run0[2].unit.entityId)).toEqual(enemy4);
        expect(run0[2].iterationCount).toEqual(2);
        expect(REGame.world.entity(run0[3].unit.entityId)).toEqual(enemy5);
        expect(run0[3].iterationCount).toEqual(3);
        expect(REGame.world.entity(run0[4].unit.entityId)).toEqual(enemy6);
        expect(run0[4].iterationCount).toEqual(3);

        const run1 = runs[1].steps;
        expect(run1.length).toBe(4);
        expect(REGame.world.entity(run1[0].unit.entityId)).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run1[0].iterationCount).toEqual(0);
        expect(REGame.world.entity(run1[1].unit.entityId)).toEqual(enemy4);
        expect(run1[1].iterationCount).toEqual(0);
        expect(REGame.world.entity(run1[2].unit.entityId)).toEqual(enemy5);
        expect(run1[2].iterationCount).toEqual(0);
        expect(REGame.world.entity(run1[3].unit.entityId)).toEqual(enemy6);
        expect(run1[3].iterationCount).toEqual(0);

        // 最後の Run には、x2速以上の余りと、x1速以下の Entity が積まれている
        const run2 = runs[2].steps;
        expect(run2.length).toBe(6);
        expect(REGame.world.entity(run2[0].unit.entityId)).toEqual(enemy5);  // x3 優先
        expect(run2[0].iterationCount).toEqual(0);
        expect(REGame.world.entity(run2[1].unit.entityId)).toEqual(enemy6);  // x3 優先
        expect(run2[1].iterationCount).toEqual(0);
        expect(REGame.world.entity(run2[2].unit.entityId)).toEqual(enemy1);  // x1
        expect(run2[2].iterationCount).toEqual(1);
        expect(REGame.world.entity(run2[3].unit.entityId)).toEqual(enemy2);  // x1
        expect(run2[3].iterationCount).toEqual(1);
        expect(REGame.world.entity(run2[4].unit.entityId)).toEqual(enemy7);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
        expect(run2[4].iterationCount).toEqual(1);
        expect(REGame.world.entity(run2[5].unit.entityId)).toEqual(enemy8);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
        expect(run2[5].iterationCount).toEqual(1);
    }

    const dialogContext = RESystem.dialogContext;
    
    //--------------------
    // 移動量から実際に行動した数を判断する
    {
        // player を右へ移動
        dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
        dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
        // AI行動決定
        RESystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.x).toBe(2);
        expect(enemy1.x).toBe(2);
        expect(enemy2.x).toBe(2);
        expect(enemy3.x).toBe(3);
        expect(enemy4.x).toBe(3);
        expect(enemy5.x).toBe(4);
        expect(enemy6.x).toBe(4);
        expect(enemy7.x).toBe(1);   // 鈍足状態 (になった直後のターン) は行動しない
        expect(enemy8.x).toBe(1);   // 鈍足状態 (になった直後のターン) は行動しない
    }

    //--------------------
    // 2ターン目
    {
        // player を右へ移動
        dialogContext.postActivity(LMoveAdjacentActivity.make(actor1, 6));
        dialogContext.activeDialog().submit(DialogSubmitMode.ConsumeAction);
    
        // AI行動決定
        RESystem.scheduler.stepSimulation();
    
        // 移動後座標チェック
        expect(actor1.x).toBe(3);
        expect(enemy1.x).toBe(3);
        expect(enemy2.x).toBe(3);
        expect(enemy3.x).toBe(5);
        expect(enemy4.x).toBe(5);
        expect(enemy5.x).toBe(7);
        expect(enemy6.x).toBe(7);
        expect(enemy7.x).toBe(2);
        expect(enemy8.x).toBe(2);
    }

});

/*
test("EntitySaveLoad", () => {
    let contentsString = "";

    // Save
    {
        const actor1 = new LEntity();

        // Entity Property
        actor1._setObjectId(new LEntityId(1, 111));
        actor1.x = 55;

        // Attributes
        const a1 = RESystem.createAttribute(RESystem.attributes.unit) as LUnitAttribute;
        a1.setSpeedLevel(2);
        actor1.addAttribute(a1);

        // Behaviors
        actor1.addBehavior(REUnitBehavior);

        const contents1 = actor1.makeSaveContents();
        contentsString = JSON.stringify(contents1);
    }

    // Load
    {
        const actor2 = new LEntity();
        const contents2 = JSON.parse(contentsString);
        actor2.extractSaveContents(contents2);
        
        // Entity Property
        expect(actor2.entityId().index2()).toBe(1);
        expect(actor2.entityId().key2()).toBe(111);
        expect(actor2.x).toBe(55);

        // Attributes
        const a1 = actor2.findBehavior(REUnitBehavior);
        expect(actor2.attrbutes.length).toBe(1);
        expect(a1).toBeDefined();
        expect(a1?.speedLevel()).toBe(2);

        // Behaviors
        expect(actor2.basicBehaviors().length).toBe(1);
        expect(actor2.basicBehaviors()[0]).toBeInstanceOf(REUnitBehavior);
    }
});

*/
