import { MRLively } from "ts/mr/lively/MRLively";
import { MRSystem } from "./MRSystem";


/**
 * ターン制御や Sequel の再生を伴わずに Command だけ実行する Scheduler。
 * 
 * stepSimulation() 実行時に、Command が溜まっているばあは即時すべて実行する。
 * 
 * RMMZ 側の制御に置かれたセーフティエリアマップ (拠点マップ) から、
 * プラグインコマンドなどを通して Entity へ Command を送るときに使う。
 * - アイテムの増減
 * - ステータスの増減
 * ...等。
 */
export class SImmediatelyCommandExecuteScheduler {
    public stepSimulation(): void {
        const dialogContext = MRSystem.dialogContext;
        const commandContext = MRSystem.commandContext;

        while (true) {



            
            if (commandContext.isRunning) {
                commandContext._processCommand();
                MRSystem.sequelContext.attemptFlush(false);
                return;
            }
            else {
                // 実行予約が溜まっているなら submit して実行開始する。
                // ※もともと callDecisionPhase() と後に毎回直接呼んでいたのだが、
                //   onTurnEnd() などもサポートしはじめて呼び出し忘れが多くなった。
                //   そもそもいつ呼び出すべきなのか分かりづらいので、submit の呼び出しは一元化する。
                if (!commandContext.isRecordingListEmpty) {
                    commandContext._submit(); // swap
                }
            }

            if (dialogContext._hasDialogModel()) {
                dialogContext._update();
                if (dialogContext._hasDialogModel()) {
                    return;
                }
            }

            if (commandContext.isRunning) {
                // コマンド実行中。まだフェーズを進ませない
            }
            else {
                MRLively.world._removeDestroyedObjects();
            }

            if (commandContext.isEmpty) {
                break;
            }
        }
    }
}
