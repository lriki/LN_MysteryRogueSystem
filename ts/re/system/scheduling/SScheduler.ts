import { assert, Log, tr2 } from "../../Common";
import { REGame } from "../../objects/REGame";
import { RESystem } from "../RESystem";
import { UAction } from "../../usecases/UAction";
import { REData } from "ts/re/data/REData";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { UName } from "ts/re/usecases/UName";
import { LScheduler2, LSchedulerPhase } from "ts/re/objects/LScheduler";
import { REBasics } from "../../data/REBasics";
import { SStepPhase } from "../SCommon";
import { SStepScheduler2 } from "./SStepScheduler";
import { SCommandResponse } from "../RECommand";
import { LGenerateDropItemCause } from "../../objects/internal";
import { SChainAfterScheduler } from "./SChainAfterScheduler";




export class SScheduler {
    private _data: LScheduler2;
    private _stepScheduler: SStepScheduler2;
    private _chainAfterScheduler: SChainAfterScheduler;
    private _brace: boolean;
    private _occupy: boolean;

    public constructor() {
        this._data = REGame.scheduler;
        this._stepScheduler = new SStepScheduler2(this);
        this._chainAfterScheduler = new SChainAfterScheduler();
        this._brace = false;
        this._occupy = false;
    }

    public reset(): void {
        this._data = REGame.scheduler;
        this._data.chedulerPhase = LSchedulerPhase.RoundStarting;
        this._stepScheduler.start();
        this._chainAfterScheduler.reset();
        this._brace = false;
        this._occupy = false;
    }

    public data(): LScheduler2 {
        return this._data;
    }

    public stepSimulation(): void {
        const dialogContext = RESystem.dialogContext;
        const commandContext = RESystem.commandContext;

        while (true) {
            // フレーム待ち
            //if (REGame.scheduler.updateWaiting()) {
             //   break;
            //}

            // Sequel 終了待ち
            if (RESystem.integration.checkVisualSequelRunning()) {
                // Sequel 実行中
                break;
            }

            if (REGame.camera.isFloorTransfering()) {
                // マップ遷移中。
                // postTransferFloor() の実行によって遷移が発生した場合は一度実行ループを抜けておかないと、
                // 遷移が実際に行われる前に次のコマンド実行に進んでしまう。
                break;
            }

            if (this._brace) {
                this._brace = false;
                break;
            }

            /*
            if (RESystem.commandContext.visualAnimationWaiting()) {
                if (RESystem.integration.onCheckVisualSequelRunning()) {
                    // Sequel 実行中
                    break;
                }
                else {
                    // Sequel 終了
                    RESystem.commandContext.clearVisualAnimationWaiting();
                }
            }
            */

            // 現在のコマンドリストの実行は終了しているが、Visual 側がアニメーション中であれば完了を待ってから次の Unit の行動を始めたい
            if (!commandContext.isRunning() && RESystem.integration.checkVisualSequelRunning()) {
                break;
            }


            // Dialog 表示中でも update を抜けた時に詰まれているコマンドは実行されるようにしたい。
            // 向き変更なども Activity 化しておかないと、行動履歴が付けづらい。
            // そのため Dialog の update 前に Command 実行しておく。
            if (commandContext.isRunning()) {
                commandContext._processCommand();

                if (!commandContext.isRunning()) {
                    // _processCommand() の後で isRunning が落ちていたら、
                    // 実行中コマンドリストの実行が完了した。
                    this.onCommandChainConsumed();
                }

                RESystem.sequelContext.attemptFlush(false);
                continue;
            }
            

            let continue_cc = true;
            if (dialogContext._hasDialogModel()) {
                dialogContext._update();

                if (dialogContext._hasDialogModel()) {
                    // Dialog 表示中は後続コマンドを実行しない
                    break;
                }
                else {
                    // update() で Dialog が Close された。
                    // すぐに post されたコマンドの実行を始める。
                    // こうしておかないと、移動 Sequel 開始までに 1Frame 空いてしまうため、一瞬遅延してみえてしまう。

                    const entity = dialogContext.causeEntity();
                    if (entity) {
                        entity.immediatelyAfterAdjacentMoving = false;
                    }
                    continue_cc = false;
                }
            }
            
            if (continue_cc)
            {
                // 実行予約が溜まっているなら submit して実行開始する。
                // ※もともと callDecisionPhase() と後に毎回直接呼んでいたのだが、
                //   onTurnEnd() などもサポートしはじめて呼び出し忘れが多くなった。
                //   そもそもいつ呼び出すべきなのか分かりづらいので、submit の呼び出しは一元化する。
                //if (!commandContext.isRecordingListEmpty()) {
                //    commandContext._submit(); // swap
                //}
                assert(commandContext.isRecordingListEmpty());


                
                REGame.world._removeDestroyedObjects();
    
                this.stepSimulationInternal();
            }
        }

        this._occupy = false;
    }
    
    private stepSimulationInternal(): void {
        switch (this._data.chedulerPhase) {
            case LSchedulerPhase.RoundStarting:
                this.update_RoundStarting();
                break;
            case LSchedulerPhase.Processing:
                this.update_ProcessPhase();
                break;
            case LSchedulerPhase.RoundEnding:
                this.update_RoundEnding();
                break;
            default:
                throw new Error("Unreachable.");
        }
    }

    private update_RoundStarting(): void {
        // 敵の生成など
        RESystem.mapManager.updateRound();

        this._data.buildSchedulingUnits();
        this._data.dealActionTokens();
        this._data.chedulerPhase = LSchedulerPhase.Processing
        this._occupy = true;
        this._stepScheduler.start();
    }
    
    private update_ProcessPhase(): void {
        if (!this._stepScheduler.process()) {
            this._data.chedulerPhase = LSchedulerPhase.RoundEnding;
        }
    }

    private update_RoundEnding(): void {

        //if (RESystem.sequelContext.isEmptySequelSet()) {
        if (this._occupy) {
            // RoundStart からここまで、一度もシミュレーションループから抜けなかった場合は一度制御を返すようにする。
            // こうしておかないとゲームがハングする。
            // マップにいるすべての Entity が状態異常等で行動不能な場合にこのケースが発生する。

            // マップ侵入後、方向キーを押しっぱなしにしておくと、Player の Move モーションが再生されず進行方向にワープしたように見えてしまう問題の対策。
            // 普通であれば ManualDialog が表示されている間はシミュレーションループは回らないので stepSimulation() から制御が返るが、
            // 押しっぱなしの場合 Dialog 表示→ キー入力判定 → 移動処理 → postSequel() が一気に行われる。
            // そのため RoundStarting → RoundEnding まで一度も制御を返さず来てしまうため、brace = true となり、1フレームだけ Idle Sequel を再生する猶予ができてしまった。
            if (RESystem.sequelContext.isEmptySequelSet()) {
                this._brace = true;
            }
        }
        else {
            // ターン終了時に Sequel が残っていればすべて掃き出す
            RESystem.sequelContext.flushSequelSet(false);
        }

        this._data.chedulerPhase = LSchedulerPhase.RoundStarting
    }

    // 遅延予約済みのコマンドすべて実行し終え、次のフェーズに進もうとしている状態。
    // ここで新たにコマンドを post すると、フェーズは進まず新たなコマンドチェーンを開始できる。
    private onCommandChainConsumed(): void {
        if (!this._chainAfterScheduler.isEnd()) {
            this._chainAfterScheduler.process(RESystem.commandContext);
            
            // SChainAfterScheduler 最後の Phase で詰まれたコマンドに対して繰り返し SChainAfterScheduler を回したいこともあるので、
            // 一連の処理が終わったら直ちにリセットしておく。
            // ※以前は process に入ってからリセットしていたが、それだと process に入る前に連続 post されたときに処理ができなくなる。
            if (this._chainAfterScheduler.isEnd()) {
                this._chainAfterScheduler.reset();
            }
        }
    }

    // // 本来あるべき状態と齟齬がある Entity を、定常状態へ矯正する。
    // private stabilizeSituation(): void {
    //     // NOTE: この中からは、必要な時だけ post してよい。
    //     // 不要であるにもかかわらず毎回 post してしまうと、Phase の処理に回らなくなるので注意。
    //     const cctx = RESystem.commandContext;

    //     {
    //         for (const entity of REGame.map.entities()) {
    //             const block = REGame.map.block(entity.x, entity.y);
    //             const currentLayer = block.findEntityLayerKind(entity);
    //             assert(currentLayer);
    //             const homeLayer = entity.getHomeLayer();
    //             if (currentLayer != homeLayer) {
    //                 UAction.postDropOrDestroyOnCurrentPos(cctx, entity, homeLayer);
    //             }
    //         }
    //     }
        
    //     for (const entity of REGame.map.entities()) {
    //         entity.iterateBehaviorsReverse(b => {
    //             b.onStabilizeSituation(entity, cctx);
    //             return true;
    //         });
    //     }

    //     // 戦闘不能の確定処理
    //     for (const entity of REGame.map.entities()) {
    //         if (entity.isDeathStateAffected()) {
    //             let result = SCommandResponse.Pass;
    //             entity.iterateBehaviorsReverse(b => {
    //                 result = b.onPermanentDeath(entity, RESystem.commandContext);
    //                 return result == SCommandResponse.Pass;
    //             });

    //             if (result == SCommandResponse.Pass) {
    //                 cctx.postSequel(entity, REBasics.sequels.CollapseSequel);
    //                 UAction.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
    //                 cctx.postDestroy(entity);
    //             }
    //         }
    //     }



    //     /*
    //     爆発の腕輪・ワープの腕輪実装メモ
    //     ----------
    //     装備順序による効果発生順の依存は避けたいところだが…まずはそれで。
    //     発動タイミングは stabilizeSituation… というよりは、UpdateState と同じタイミング。
    //     足踏みでも発生するので、条件も同じ。

    //     */
    // }
}











