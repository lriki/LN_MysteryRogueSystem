import { assert, RESerializable, tr } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { REData } from "ts/re/data/REData";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffectContext, SEffectIncidentType } from "ts/re/system/SEffectContext";
import { RESystem } from "ts/re/system/RESystem";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DEventId, SkillEmittedArgs } from "ts/re/data/predefineds/DBasicEvents";
import { LEventResult } from "../LEventServer";
import { UMovement } from "ts/re/usecases/UMovement";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DEffectCause, DEmittor } from "ts/re/data/DEmittor";
import { SEmittorPerformer } from "ts/re/system/SEmittorPerformer";
import { LActivity } from "../activities/LActivity";
import { DCounterAction } from "ts/re/data/DEntity";
import { paramExposedTrapTriggerRate, paramHiddenTrapTriggerRate } from "ts/re/PluginParameters";


/**
 * 
 * [2021/5/26]
 * ----------
 * - 全ての Unit は罠にかかる可能性を持っている。
 * - 仲間 Unit は TrapThrough Trait を持たせて、一切かからないようにしてみる。仲間システム作ったら。
 * - Trap は中立勢力にする。今のところ敵対でも問題ないかもしれないけど、多分中立の方が自然。
 *   - 条件によってはモンスターに対して効果発動することもあるし
 *   - 範囲攻撃巻物の対象外にしやすいし
 *   - ミニマップ表示やりやすいし
 * - Trap は罠にかけたい勢力を持っている (デフォルトは Player)
 * - 罠にかけたい勢力側に TrapMaster がいたら、その敵対勢力を罠にかけるようにする。
 * - 両方の勢力に TrapMaster がいたら、何もしない。
 * 
 * [2021/11/14] 罠の発動確率
 * ----------
 * 原作だと、見えない状態と見えている状態で踏んだ時で確率が変わる。
 * またダンジョンによっても変わる。(逃げコンセプトダンジョンなど)
 * 罠によっても変わる？
 * 強化バネやワープポイント、ポイントスイッチは罠に見えるが罠ではない。どちらかというと階段に近いオブジェクト。
 * 
 */
@RESerializable
export class LTrapBehavior extends LBehavior {
    /*
    効果は Trap を performer とした Emittor として発動する
    ----------
    踏んだ人が必ず Trap の上にいるとは限らない。
    代表的なものだと、ワナ作動の巻物。
    */


    private _exposed: boolean = false;
    private _recharging: boolean = false;

    constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LTrapBehavior);
        b._exposed = this._exposed;
        return b
    }

    /**
     * 露出しているかどうか。
     * 罠が踏まれたり、空振りや魔法弾の通過で発見された状態で、勢力に関わらず可視である。
     */
    public exposed(): boolean {
        return this._exposed;
    }

    public setExposed(value: boolean): void {
        this._exposed = value;
    }

    
    onQueryReactions(actions: DActionId[]): void {
        actions.mutableRemove(x => x == REBasics.actions.PickActionId);
    }

    onAttached(self: LEntity): void {
        assert(this.ownerEntity().findEntityBehavior(LItemBehavior));
        REGame.eventServer.subscribe(REBasics.events.skillEmitted, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(REBasics.events.skillEmitted, this);
    }

    onEvent(cctx: SCommandContext, eventId: DEventId, args: any): LEventResult {
        if (eventId == REBasics.events.skillEmitted) {
            const entity = this.ownerEntity();
            const e = args as SkillEmittedArgs;
            if (this.checkValidTarget(e.performer) &&           // 攻撃者はこの罠にかかることができる？
                e.skillId == RESystem.skills.normalAttack &&    // 通常攻撃？
                e.targets.length == 0 &&                        // 攻撃対象がない？（明示的な空振り）
                !UMovement.checkDiagonalWallCornerCrossing(e.performer, e.performer.dir) &&  // 壁角チェック
                UMovement.getFrontBlock(e.performer).containsEntity(entity)) {     // 目の前にこの罠がある？
                // 空振りによる発見
                this._exposed = true;
            }
        }
        return LEventResult.Pass;
    }
    
    private checkValidTarget(entity: LEntity): boolean {
        return entity.getOutwardFactionId() === REData.system.trapTargetFactionId;
    }

    private triggerRate(): number {
        if (this.exposed())
            return paramExposedTrapTriggerRate;
        else
            return paramHiddenTrapTriggerRate;
    }
    
    [onWalkedOnTopReaction](e: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = this.ownerEntity();
        const target = e.sender;

        // この罠にかかることができる？
        if (!this.checkValidTarget(target)) return SCommandResponse.Pass;

        // 発動の成否にかかわらず、露出
        this.setExposed(true);

        cctx.postMessage(tr("{0} を踏んだ！", self.getDisplayName().name));

        const hit = target.hasTrait(REBasics.traits.DrawInTrap) || cctx.random().nextIntWithMax(100) < this.triggerRate();

        if (hit) {
            this.performTrapEffect(self, cctx, target.dir);
        }
        else {
            cctx.postMessage(tr("しかし罠にはかからなかった。"));
        }
        
        return SCommandResponse.Handled;
    }

    onActivityReaction(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        // [踏まれた]
        if (activity.actionId() == REBasics.actions.trample) {
            this.performTrapEffect(self, cctx, activity.actor().dir);
        }
        else if (activity.actionId() == REBasics.actions.FallActionId) {
            this.performTrapEffect(self, cctx, activity.actor().dir);
        }
        return SCommandResponse.Pass;
    }


    private performTrapEffect(self: LEntity, cctx: SCommandContext, actorDir: number): void {
        if (this._recharging) return;

        //const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        //const itemData = trapItem.itemData();
        const emittors = self.data().emittorSet.emittors(DEffectCause.Affect);
        assert(emittors.length == 1);   // TODO: とりあえず

        const emittor = emittors[0];

        if (emittor) {

            
            if (1) {

                SEmittorPerformer.makeWithEmitor(self, self, emittor)
                .setDffectDirection(UMovement.getRightDir(actorDir))
                .setProjectilePriorityEffectSet(emittor.effectSet)
                .performe(cctx);
    
            }
            // else {



            //     const subject = new SEffectorFact(e.self, emittor.effectSet, SEffectIncidentType.IndirectAttack, target.dir);
            //     const effectContext = new SEffectContext(subject, cctx.random());
    
            //     //console.log(result);
    
    
            //     cctx.postAnimation(e.sender, 35, true);
    
            //     // TODO: ここでラムダ式も post して apply したい。
    
            //     cctx.postCall(() => {
            //         effectContext.applyWithWorth(cctx, [target]);
            //     });
    
            // }


            //cctx.postMessage(tr("しかし ワナには かからなかった。"));
        }


        this._recharging = true;
        this._exposed = true;

    }
    
    onStepEnd(cctx: SCommandContext): SCommandResponse {
        this._recharging = false;
        return SCommandResponse.Pass;
    }

    /*
    [2021/10/31] カウンターアタックについて
    ----------
    特定の効果を受けたら、スキルorEffectを発動する仕組み。

    通常の行動順ルーチンにおける「反撃」ではないため注意。

    EffectContextの中から即時発動するのは避けたほうがいいかも？
    例えば攻撃ヒット後、移動する効果（ヒットアンドアウェイスキルなど？）の拡張を考えると、
    Target側はまず「予約」しておき、効果適用処理が一通り終わった後に発動するのがいいだろう。
    （３方向同時攻撃などを考えると、本当に完全に終わった時が望ましい）

    */
   //_required = false;
    onEffectPerformed(self: LEntity, cctx: SCommandContext, emittor: DEmittor): SCommandResponse {

        // if (!this._recharging) {
        //     this._required = true;
        //     // for (const param of self._effectResult.paramEffects) {
                
        //     // }
        // }

        return SCommandResponse.Pass; 
    }
    
    onCounterAction(self: LEntity, cctx: SCommandContext, data: DCounterAction): SCommandResponse {
        if (!this._recharging) {
            this.performTrapEffect(self, cctx, 0);
        }
        return SCommandResponse.Handled;
    }

    // onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {

    //     // 反撃相当の処理は Scheduler の特定のタイミングではなく、コマンドチェーンが完了した時に行う。
    //     // こうしないと、例えば地雷が連続で誘爆していくとき、1ステップ内で繰り返し performTrapEffect() を呼び出せない。
    //     if (this._required) {
    //         this._required = false;
    //     }

    //     return SCommandResponse.Pass;
    // }

    // onAfterStep(self: LEntity, cctx: SCommandContext): SCommandResponse {

    //     if (this._required) {
    //         this._required = false;
    //         this.performTrapEffect(self, cctx, 0);
    //     }

    //     return SCommandResponse.Pass;
    // }
}

