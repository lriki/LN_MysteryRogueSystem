import { LActivity } from "../lively/activities/LActivity";
import { LEntity } from "../lively/entity/LEntity";
import { SCommandResponse } from "./SCommand";
import { HandleActivityCommand, SCommandContext, SHandleCommandResult } from "./SCommandContext";
import { STask } from "./tasks/STask";

/**
 * Activity の 3Way-Handshake
 */

export class SActivityContext {

    /*
    Activity の処理は大きく次の処理に分かれる。
    - onActivity に直接通知を投げるもの (postActivity)
    - onActivity の中から、通知先を解決し、本処理へ投げるもの (postHandleActivity) ← こっちが 3Way-Handshake
    なぜこうしたかというと、↑に書いてある通り、通知先をマップなどの状況によって変える必要が出てきたため。
    処理がまるっきり別のコマンド(メソッド)にわかれることになるため、それらの関連性を表現するため、SActivityContext を作ることにした。
    */

    private _activity: LActivity;
    _thenFunc: (() => void) | undefined;
    _catchFunc: (() => void) | undefined;

    public constructor(activity: LActivity) {
        this._activity = activity;
    }

    public activity(): LActivity {
        return this._activity;
    }

    /** 一連の処理が成功したとき */
    public then(func: () => void): this {
        this._thenFunc = func;
        return this;
    }

    /** リジェクトされた/ハンドリングされなかったとき */
    public catch(func: () => void): this {
        this._catchFunc = func;
        return this;
    }

    /**
     * onActivity の中から呼び出すこと。
     */
     public postHandleActivity(cctx: SCommandContext, objectum: LEntity): HandleActivityCommand {
        const command = new HandleActivityCommand();
        const m1 = () => {

            // 相手側前処理
            //   ここで any を使っているのは、TS2367 の対策のため。2021/9/29次点では Open の問題で、今のところ逃げ道がないみたい。
            //   https://github.com/microsoft/TypeScript/issues/9998
            let result1: any = SCommandResponse.Pass;
            objectum.iterateBehaviorsReverse(b => {
                result1 = b.onActivityPreReaction(objectum, cctx, this._activity);
                if (result1 != SCommandResponse.Pass) { // TODO: ここ Succeeded のほうがいいかも
                    return false;
                }
                else {
                    return true;
                }
            });

            // 相手側で reject されてなければ本処理
            if (result1 != SCommandResponse.Canceled) {
                const then = command._thenFunc;
                //if (then) {
                const m2 = () => {
                    const result2 = then ? then() : SHandleCommandResult.Resolved;
                    if (result2 == SHandleCommandResult.Resolved) {
                        // 本処理も成功したので相手側の後処理を行う
                        objectum.iterateBehaviorsReverse(b => {
                            b.onActivityReaction(objectum, cctx, this._activity);
                            return true;
                        });

                        if (this._thenFunc) this._thenFunc();
                    }
                    else {
                        // 本処理失敗
                        if (this._catchFunc) this._catchFunc();
                    }
                    return SCommandResponse.Pass;
                };
                cctx.postTask2(new STask("HandleActivity.2", m2));
                //}
            }
            else {
                // 相手側の前処理ではじかれた
                if (command._catchFunc) command._catchFunc();
                if (this._catchFunc) this._catchFunc();
            }

            return SCommandResponse.Pass;
        };
        cctx.postTask2(new STask("HandleActivity", m1));
        return command;
    }

    
}

