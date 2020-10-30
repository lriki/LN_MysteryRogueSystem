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

TestEnv.setupDatabase();

test('basic', () => {
    // NewGame.
    REGameManager.createGameObjects();

    // フロア移動。最初はどこでもないフロアにいるので、マップ遷移が要求される。
    const actor1 = REGame.world.entity(REGame.system._mainPlayerEntityId);
    REGame.world._transfarEntity(actor1, 1, 5, 5);

    // RMMZ で使うときはこのあたりで $dataMap をロードしたりする

    // マップ遷移確定。実際にランダムマップ等が生成され、Entity が配置される。
    REGameManager.performFloorTransfer();

    // シミュレーション 1 回実行
    REGameManager.update();
    
    const commandContext = REGame.scheduler.commandContext();
    const dialogContext = REGame.scheduler._getDialogContext();
    
    {
        // マニュアル操作の Dialog が開かれている
        const dialog1 = dialogContext.dialog();
        expect((dialog1 instanceof REManualActionDialog)).toBe(true);
    
        // 向き変更。行動を消費せず Dialog を閉じる
        const args1: REDirectionChangeArgs = { direction: 9 };
        commandContext.postAction(REData.actions[REData.DirectionChangeActionId], actor1, undefined, args1);
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

    // 移動
    const args2: REMoveToAdjacentArgs = { x: 5, y: 6 };
    commandContext.postAction(REData.actions[REData.MoveToAdjacentActionId], actor1, undefined, args2);
    dialogContext.closeDialog(true);

    // シミュレーション実行
    REGameManager.update();

    expect(actor1.x).toBe(5);
    expect(actor1.y).toBe(6);
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
