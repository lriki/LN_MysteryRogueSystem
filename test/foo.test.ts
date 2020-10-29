import { REDirectionChangeCommand, REMoveToAdjacentCommand } from "ts/commands/REDirectionChangeCommand";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REGame } from "ts/RE/REGame";
import { REGameManager } from "ts/RE/REGameManager";
import { REGame_UnitAttribute } from "ts/RE/REGame_Attribute";
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
        commandContext.postAction(REData.actions[REData.DirectionChangeActionId], actor1, undefined, new REDirectionChangeCommand(9));
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
    commandContext.postAction(REData.actions[REData.MoveToAdjacentActionId], actor1, undefined, new REMoveToAdjacentCommand(5, 6));
    dialogContext.closeDialog(true);

    // シミュレーション実行
    REGameManager.update();

    expect(actor1.x).toBe(5);
    expect(actor1.y).toBe(6);
});

test('basic again', () => {
    //expect(sum(1, 2)).toBe(3);
});
