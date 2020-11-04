// NOTE:
//   https://qiita.com/t-toyota/items/93cce73004b9f765cfcf

import { REUnitBehavior } from "ts/behaviors/REUnitBehavior";
import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REGame } from "ts/RE/REGame";
import { REGameManager } from "ts/system/REGameManager";
import { REGame_UnitAttribute } from "ts/RE/REGame_Attribute";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RESystem } from "ts/system/RESystem";
import { TestEnv } from "./TestEnv";
import { REEntityFactory } from "ts/system/REEntityFactory";

TestEnv.setupDatabase();

test('basic', () => {
    // NewGame.
    REGameManager.createGameObjects();

    // Player
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);

    // フロア移動。最初はどこでもないフロアにいるので、マップ遷移が要求される。
    REGame.world._transfarEntity(actor1, 1, 5, 5);

    // 【RMMZ で使うときはこのあたりで $dataMap をロードしたりする】

    // マップ遷移確定。実際にランダムマップ等が生成され、Entity が配置される。
    REGameManager.performFloorTransfer();

    // シミュレーション 1 回実行
    REGameManager.update();
    
    const commandContext = REGame.scheduler.commandContext();
    const dialogContext = REGame.scheduler._getDialogContext();
    
    // 方向転換してみる (ターン消費無し)
    {
        // マニュアル操作の Dialog が開かれている
        const dialog1 = dialogContext.dialog();
        expect((dialog1 instanceof REManualActionDialog)).toBe(true);
    
        // 向き変更。行動を消費せず Dialog を閉じる
        const args1: REDirectionChangeArgs = { direction: 9 };
        commandContext.postAction(REData.DirectionChangeActionId, actor1, undefined, args1);
        dialogContext.closeDialog(false);
    
        // この時点では向きは変更されていない
        expect(actor1.dir != 9).toBe(true);
        
        // シミュレーション実行
        REGameManager.update();
        
        // 行動の消費が無いので、再び ManualActionDialog が開かれる。
        // しかし一度閉じているので、違うインスタンスで開かれている。
        expect((dialogContext.dialog() instanceof REManualActionDialog)).toBe(true);
        expect((dialog1 != dialogContext.dialog())).toBe(true);
    
        // この時点では向きは変更されている
        expect(actor1.dir).toBe(9);
    
    }

    // 一歩下に移動してみる (ターン消費あり)
    {
        const args2: REMoveToAdjacentArgs = { direction: 2 };
        commandContext.postAction(REData.MoveToAdjacentActionId, actor1, undefined, args2);
        dialogContext.closeDialog(true);
    
        // シミュレーション実行。実際に移動が行われる
        REGameManager.update();
    
        // 移動後座標チェック
        expect(actor1.x).toBe(5);
        expect(actor1.y).toBe(6);
    
        // 移動に伴い実行されるべきアニメーション情報も作られている
        expect(TestEnv.activeSequelSet.runs().length).toBe(1);
        expect(TestEnv.activeSequelSet.runs()[0].clips().length).toBe(1);
    }
});

test('EntitySaveLoad', () => {
    let contentsString = "";

    // Save
    {
        const actor1 = new REGame_Entity();

        // Entity Property
        actor1._id = 1;
        actor1.x = 55;

        // Attributes
        const a1 = RESystem.createAttribute(RESystem.attributes.unit) as REGame_UnitAttribute;
        a1.setSpeedLevel(2);
        actor1.addAttribute(a1);

        // Behaviors
        const b1 = RESystem.createBehavior(RESystem.behaviors.unit) as REUnitBehavior;
        actor1.addBehavior(b1);

        const contents1 = actor1.makeSaveContents();
        contentsString = JSON.stringify(contents1);
    }

    // Load
    {
        const actor2 = new REGame_Entity();
        const contents2 = JSON.parse(contentsString);
        actor2.extractSaveContents(contents2);
        
        // Entity Property
        expect(actor2.id()).toBe(1);
        expect(actor2.x).toBe(55);

        // Attributes
        const a1 = actor2.findAttribute(REGame_UnitAttribute);
        expect(actor2.attrbutes.length).toBe(1);
        expect(a1).toBeDefined();
        expect(a1?.speedLevel()).toBe(2);

        // Behaviors
        expect(actor2.behaviors().length).toBe(1);
        expect(actor2.behaviors()[0]).toBeInstanceOf(REUnitBehavior);
    }
});



test('TurnOrderTable', () => {
    //--------------------
    // 準備
    REGameManager.createGameObjects();

    // actor1 - x1 速
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);
    actor1._name = "actor1";
    actor1.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(1);
    REGame.world._transfarEntity(actor1, 1, 1, 1);

    // enemy1 - x1 速
    const enemy1 = REEntityFactory.newMonster(1);
    enemy1._name = "enemy1";
    enemy1.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(1);
    REGame.world._transfarEntity(enemy1, 1, 1, 2);

    // enemy2 - x1 速
    const enemy2 = REEntityFactory.newMonster(1);
    enemy2._name = "enemy2";
    enemy2.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(1);
    REGame.world._transfarEntity(enemy2, 1, 1, 3);

    // enemy3 - x2 速
    const enemy3 = REEntityFactory.newMonster(1);
    enemy3._name = "enemy3";
    enemy3.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(2);
    REGame.world._transfarEntity(enemy3, 1, 1, 4);

    // enemy4 - x2 速
    const enemy4 = REEntityFactory.newMonster(1);
    enemy4._name = "enemy4";
    enemy4.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(2);
    REGame.world._transfarEntity(enemy4, 1, 1, 5);

    // enemy5 - x3 速
    const enemy5 = REEntityFactory.newMonster(1);
    enemy5._name = "enemy5";
    enemy5.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(3);
    REGame.world._transfarEntity(enemy5, 1, 1, 6);

    // enemy6 - x3 速
    const enemy6 = REEntityFactory.newMonster(1);
    enemy6._name = "enemy6";
    enemy6.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(3);
    REGame.world._transfarEntity(enemy6, 1, 1, 7);

    // enemy7 - x0.5 速
    const enemy7 = REEntityFactory.newMonster(1);
    enemy7._name = "enemy7";
    enemy7.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(-1);
    REGame.world._transfarEntity(enemy7, 1, 1, 8);

    // enemy8 - x0.5 速
    const enemy8 = REEntityFactory.newMonster(1);
    enemy8._name = "enemy8";
    enemy8.findAttribute(REGame_UnitAttribute)?.setSpeedLevel(-1);
    REGame.world._transfarEntity(enemy8, 1, 1, 9);

    REGameManager.performFloorTransfer();
    REGameManager.update();

    //--------------------
    // 最初の行動予定順をチェック
    {
        const runs = REGame.scheduler.actionScheduleTable();
        expect(runs.length).toBe(3);    // map 上の Entity のうち最大速度はx3なので、Run は3つ。

        const run0 = runs[0].steps;
        expect(run0.length).toBe(5);
        expect(run0[0].unit.unit).toEqual(actor1);  // 先頭は Player
        expect(run0[1].unit.unit).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run0[2].unit.unit).toEqual(enemy4);
        expect(run0[3].unit.unit).toEqual(enemy5);
        expect(run0[4].unit.unit).toEqual(enemy6);

        const run1 = runs[1].steps;
        expect(run1.length).toBe(4);
        expect(run1[0].unit.unit).toEqual(enemy3);  // 以降、x2速以上の Enemy が積まれている
        expect(run1[1].unit.unit).toEqual(enemy4);
        expect(run1[2].unit.unit).toEqual(enemy5);
        expect(run1[3].unit.unit).toEqual(enemy6);

        // 最後の Run には、x2速以上の余りと、x1速以下の Entity が積まれている
        const run2 = runs[2].steps;
        expect(run2.length).toBe(6);
        expect(run2[0].unit.unit).toEqual(enemy5);  // x3 優先
        expect(run2[1].unit.unit).toEqual(enemy6);  // x3 優先
        expect(run2[2].unit.unit).toEqual(enemy1);  // x1
        expect(run2[3].unit.unit).toEqual(enemy2);  // x1
        expect(run2[4].unit.unit).toEqual(enemy7);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
        expect(run2[5].unit.unit).toEqual(enemy8);  // x0.5 鈍足でも x1 と同じく、行動予定は積む
    }

    const commandContext = REGame.scheduler.commandContext();
    const dialogContext = REGame.scheduler._getDialogContext();
    
    //--------------------
    // 移動量から実際に行動した数を判断する
    {
        // player を右へ移動
        commandContext.postAction(REData.MoveToAdjacentActionId, actor1, undefined, { direction: 6 });
        dialogContext.closeDialog(true);

        console.log("-------------------------------------");
    
        // AI行動決定
        REGameManager.update();
    
        // 移動後座標チェック
        expect(actor1.x).toBe(2);
        expect(enemy1.x).toBe(2);
        expect(enemy2.x).toBe(2);
        expect(enemy3.x).toBe(3);
        expect(enemy4.x).toBe(3);
        expect(enemy5.x).toBe(4);
        expect(enemy6.x).toBe(4);
        expect(enemy7.x).toBe(2);
        expect(enemy8.x).toBe(2);
    }
/*
    //--------------------
    // 2ターン目。x0.5速の Entity は移動しない
    {
        // player を右へ移動
        commandContext.postAction(REData.MoveToAdjacentActionId, actor1, undefined, { direction: 6 });
        dialogContext.closeDialog(true);
    
        // AI行動決定
        REGameManager.update();
    
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
*/
});
