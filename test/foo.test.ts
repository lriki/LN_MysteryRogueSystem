import { REDirectionChangeCommand } from "ts/commands/REDirectionChangeCommand";
import { REData } from "ts/data/REData";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";
import { REGame } from "ts/RE/REGame";
import { REGameManager } from "ts/RE/REGameManager";
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

    // マニュアル操作の Dialog が開かれている
    const dialogContext = REGame.scheduler._getDialogContext();
    expect((dialogContext.dialog() instanceof REManualActionDialog)).toBe(true);

    // 向き変更。行動を消費せず Dialog を閉じる
    const commandContext = REGame.scheduler.commandContext();
    commandContext.postAction(REData.actions[REData.DirectionChangeActionId], actor1, undefined, new REDirectionChangeCommand(9));
    dialogContext.closeDialog(false);
    
    // シミュレーション実行。行動の消費が無いので、
    REGameManager.update();
});

test('basic again', () => {
    //expect(sum(1, 2)).toBe(3);
});
