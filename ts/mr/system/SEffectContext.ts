import { MRBasics } from "ts/mr/data/MRBasics";
import { DItemEffect } from "ts/mr/data/DItemEffect";
import { LandExitResult, MRData } from "ts/mr/data/MRData";
import { LBattlerBehavior } from "ts/mr/lively/behaviors/LBattlerBehavior";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { Helpers } from "./Helpers";
import { LEffectResult, LParamEffectResult } from "../lively/LEffectResult";
import { LEnemyBehavior } from "ts/mr/lively/behaviors/LEnemyBehavior";
import { SCommandContext } from "./SCommandContext";
import { MRLively } from "ts/mr/lively/MRLively";
import { LRandom } from "ts/mr/lively/LRandom";
import { DStateId } from "ts/mr/data/DState";
import { SEffect, SEffectApplyer, SEffectorFact } from "./SEffectApplyer";
import { onEffectResult } from "../lively/internal";
import { SCommandResponse } from "./SCommand";
import { LObject, LObjectType } from "../lively/LObject";
import { UEffect } from "../utility/UEffect";
import { UAction } from "../utility/UAction";
import { STask } from "./tasks/STask";
import { MRSystem } from "./MRSystem";


export enum SEffectIncidentType {
    /** 直接攻撃 (ヤリなど、隣接していない場合もあり得る) */
    DirectAttack,

    /** 間接攻撃 (矢など) */
    IndirectAttack,
}



export class SEffectSubject {
    private _entity: LEntity;

    constructor(entity: LEntity) {
        this._entity = entity;
    }

    public entity(): LEntity {
        return this._entity;
    }
}


/**
 * ダメージや状態異常、バフの適用など、パラメータ操作に関わる一連の処理を行う。
 * 
 * - インスタンスは1度のコマンドチェーンで複数個作られることもある。(3方向同時攻撃など)
 *   複数対象への攻撃中、途中でパラメータ変動を伴うフィードバックを受ける可能性もあるため、
 *   複数のダメージ適用でひとつのインスタンスを使いまわすのは禁止。
 *   また LLVM の Pass のように、関係者で REEffectContext を持ちまわって加工しながら Effect を積んでいく使い方になるが、
 *   状態異常をダメージに変換するようなエネミーを設計するときには Effector 側が積んだ Effect を変更することになる。
 *   そのためインスタンスは別にしないと、同時攻撃で他の攻撃対象に影響が出てしまうことがある。
 * - インスタンスは Command に乗せて持ち回り、コマンドチェーン内で必ず Apply する。外には出ない。(そうしないと Attr に保存するような事態になるので)
 * 
 * 戦闘不能について
 * ----------
 * ツクールの仕様にできるだけ寄せてみる。ツクールの仕様は…
 * - 戦闘不能ステートID は Game_Battler.deathStateId() で取得 (1)
 * - Game_Battler.refresh() で、HP が 0 であれば deathState が追加される。
 * - Game_BattlerBase.addNewState() で、で、deathState が追加されたら die() が呼ばれ HP 0 になる。
 * - Game_Battler.removeState() で、deathState が取り除かれたら revivie() が呼ばれ HP 1 になる。
 * - refresh() はダメージ適用や装備変更など様々なタイミングで呼び出される。
 *   - Game_Action.apply() > executeHpDamage() > Game_Battler.gainHp() > setHp() > refresh() 等。
 * 
 * 
 * 
 * [2020/11/11] 複数ターゲットへの攻撃をひとつの EffectContext にまとめるべき？
 * ----------
 * 分けた場合、1つの対象への処理が終わったすぐ後に、フィードバックの処理を始めることができる。
 * 例えば、3体まとめて攻撃するとき、1体目に攻撃したときに反撃をもらい倒れてしまったとき、後続を攻撃するか、といった具合。
 * …でもこのケースだと EffectContext の中で戦闘不能を判断できるか。やる・やらないは別として。
 * 
 * とにかく一度に複数対象へのダメージ適用を「中断」する可能性があるか？ということ。
 * そうかんがえると「ほとんど無い」
 * EffectContext 自体が複数対象へのダメージ適用をサポートしたとしても、
 * もしそのような中断がやりたければひとつずつインスタンス作って addTarget すればいいだけなので、まとめる方向で作ってよさそう。
 */
export class SEffectContext {

    private _effectorFact: SEffectorFact;
    private _rand: LRandom;

    // 経験値など、報酬に関わるフィードバックを得る人。
    // 基本は effectors と同じだが、反射や投げ返しを行ったときは経験値を得る人が変わるため、その対応のために必要となる。
    //private _awarder: LEntity[] = [];

    // 被適用側 (防御側) の関係者。AttackCommand を受け取ったときなど、ダメージ計算したい直前に構築する。
    // effectors と同じく、装備品なども含まれる。（サビなど修正値ダウンしたり、ひびが入ったり、燃えたりといった処理のため）
    //private _effectees: LEntity[] = [];

    
    //private _targetEntity: REGame_Entity;
    //private _targetBattlerBehavior: LBattlerBehavior;


    constructor(subject: SEffectorFact, rand: LRandom) {
        this._effectorFact = subject;
        this._rand = rand;
    }

    public effectorFact(): SEffectorFact {
        return this._effectorFact;
    }

    public applyWithWorth(cctx: SCommandContext, targets: LEntity[]): STask {

        const applies = UEffect.resolveApplyEffects(this._effectorFact.effects(), targets, cctx.random());

        for (const info of applies.targets) {
            for (const effect of info.actualEffects) {
                if (info.target.previewRejection(cctx, { kind: "Effect", effect: effect.data() })) {



                    this.applyWithHitTest(cctx, effect, info.target, info.mainTarget);
                }
            }


            
            // for (const [key, value] of info.targets.entries()) {
            //     const effects = this.selectEffects(value, cctx.random());
            //     for (const effect of effects) {
            //         if (key.previewRejection(cctx, { kind: "Effect", effect: effect.data() })) {
            //             this.applyWithHitTest(cctx, effect, key, info.mainTarget);
            //         }
            //     }
            //     //entries.push(`${key}:${value}`);
            // }

        }

        // //let deadCount = 0;
        // for (const target of targets) {
        //     const localTargets = new Map<LEntity, SEffect[]>();

        //     // まず SubComponent を含めた適用対象を取り出す
        //     for (const effect of this._effectorFact.effects()) {
        //         // Find sub-components
        //         const subComponentKey = effect.data().matchConditions.key;
        //         if (subComponentKey) {
        //             for (const subTarget of target.querySubEntities(subComponentKey)) {
        //                 const pair = localTargets.get(subTarget);
        //                 if (pair) {
        //                     pair.push(effect);
        //                 }
        //                 else {
        //                     localTargets.set(subTarget, [effect]);
        //                 }
        //             }
        //         }
        //         else {
        //             // Main Effect
        //             const pair = localTargets.get(target);
        //             if (pair) {
        //                 pair.push(effect);
        //             }
        //             else {
        //                 localTargets.set(target, [effect]);
        //             }
        //         }
        //     }

        //     for (const [key, value] of localTargets.entries()) {
        //         const effects = this.selectEffects(value, cctx.random());
        //         for (const effect of effects) {
        //             if (key.previewRejection(cctx, { kind: "Effect", effect: effect.data() })) {
        //                 this.applyWithHitTest(cctx, effect, key, target);
        //             }
        //         }
        //         //entries.push(`${key}:${value}`);
        //     }

        //     //this.applyEffectToTarget(cctx, subEffect.effect, subTarget);


        //     //const effect = this._effectorFact.selectEffect(target);


        //     // if (target.previewRejection(cctx, { kind: "Effect", effect: effect.data() })) {
        //     //     const targets = new Map<LEntity, SEffect[]>();
        //     //     targets.set(target, [effect]);

        //     //     // Main Effect
        //     //     this.applyEffectToTarget(cctx, effect, target);
        //     //     // Sub Effects
        //     //     for (const subEffect of this._effectorFact.subEffects()) {
        //     //         for (const subTarget of target.querySubEntities(subEffect.subTargetKey)) {
        //     //             this.applyEffectToTarget(cctx, subEffect.effect, subTarget);
        //     //         }
        //     //     }
        //     // }

        // }

        return cctx.postCall(() => {});
    }

    // public selectEffects(effectList: SEffect[], rand: LRandom): SEffect[] {
    //     const ratingMax = Math.max(...effectList.map(a => a.data().conditions.applyRating ?? 0));
    //     if (ratingMax > 0) {
    //         const effect = this.selectEffect(effectList.filter(x => !!x.data().conditions.applyRating), rand);
    //         return effect ? [effect] : [];
    //     }
    //     else {
    //         return effectList;
    //     }
    // };

    // public selectEffect(effectList: SEffect[], rand: LRandom): SEffect | undefined {
    //     const ratingMax = Math.max(...effectList.map(a => a.data().conditions.applyRating ?? 0));
    //     const ratingZero = ratingMax - 10;//- 3;
    //     const sum = effectList.reduce((r, a) => r + (a.data().conditions.applyRating ?? 0) - ratingZero, 0);
    //     if (sum > 0) {
    //         let value = rand.nextIntWithMax(sum);
    //         for (const action of effectList) {
    //             if (!action.data().conditions.applyRating) continue;

    //             value -= (action.data().conditions.applyRating ?? 0) - ratingZero;
    //             if (value < 0) {
    //                 return action;
    //             }
    //         }
    //     } else {
    //         return undefined;
    //     }
    // }

    // private applyEffectToTarget(cctx: SCommandContext, effect: SEffect, target: LEntity, animationTarget: LEntity): void {

    //     this.applyWithHitTest(cctx, effect, target, animationTarget);
        
    // }

    private findAnimationEntity(entity: LObject): LEntity | undefined {
        if (!entity.hasParent()) return undefined;
        const parent = entity.parentObject();
        if (parent.objectType() == LObjectType.Map && entity.objectType() == LObjectType.Entity) return entity as LEntity;
        return this.findAnimationEntity(parent);
    }
    
    // Game_Action.prototype.apply
    private applyWithHitTest(cctx: SCommandContext, effect: SEffect, target: LEntity, animationTarget: LEntity): STask {
        const targetBattlerBehavior = target.findEntityBehavior(LBattlerBehavior);
        const effectData =  effect.data();
        const result = target._effectResult;
        result.clear();
        result.sourceEffectId = effectData.effectId;

        if (effectData.effect.hasAnyValidEffect()) {
            result._revision++;
        }
        else {
            // この Effect を適用しても、データ的な効果はない。
            // そのようなときは "効かなかった" といったメッセージも表示しない。
        }

        
        // Animation
        // ワープなど、特殊効果の中から Motion が発動することもあるため、apply の前に post しておく。
        {
            let animationPosted = false;

            const effectData = effect.data();
            const behavior = this._effectorFact.subjectBehavior();
            const attackFlavorEffect = behavior ? behavior.attackAnimationId() : MRData.system.bareHandsFlavorEffect;
            const flavorEffect = (effectData.effect.flavorEffect === undefined) ? attackFlavorEffect : effectData.effect.flavorEffect;
            if (flavorEffect) {
                const animationTarget2 = this.findAnimationEntity(target);
                if (animationTarget2) {
                    cctx.displayFlavorEffect(animationTarget2, flavorEffect, { messageFormatArgs:[] });
                    animationPosted = true;
                }
            }

            const selfEffect = this._effectorFact.effectSet().succeededSelfEffect;
            if (selfEffect) {
                if (selfEffect.effect.flavorEffect) {
                    cctx.displayFlavorEffect(effect.subject(), selfEffect.effect.flavorEffect, { messageFormatArgs:[] });
                    animationPosted = true;
                }
            }
            
            if (animationPosted) {
                cctx.postWaitSequel();
            }
        }

        // 以下、アニメーションが終わった後に実行したい。
        return cctx.postCall(() => {


            if (targetBattlerBehavior) {

                result.used = this.testApply(targetBattlerBehavior);
    
    
                // 命中判定
                this.judgeHits(effect, target, result);
                
                result.physical = effect.isPhysical();
    
                if (result.isHit()) {
                    this.applyCore(cctx, effect, target, result);
                }
                //this.updateLastTarget(target);
            }
            else {
                this.applyCore(cctx, effect, target, result);
            }
    
    
            const focusedEntity = MRLively.mapView.focusedEntity();
            const friendlySubject = focusedEntity ? Helpers.isFriend(effect.subject(), focusedEntity) : false;
            if (friendlySubject) {  // subject は味方
                result.focusedFriendly = Helpers.isFriend(effect.subject(), target);
            }
            else { // subject は味方以外 (敵・NPC)
                result.focusedFriendly = true;  // 敵 vs 敵のときは、味方用のメッセージを表示したい ("ダメージを受けた！")
            }
    
            // ダメージ試行時のステート解除判定 (かなしばりなど)
            // 実際にダメージが発生したかではなく、ダメージを与えようとしたか (回復ではないか) で判断する。
            {
                const removeStates: DStateId[] = [];
                for (const p of effect.parameterEffects2()) {
                    if (p && !p.isRecover()) {
                        target.iterateStates(s => {
                            if (s.checkRemoveAtDamageTesting(p.paramId)) {
                                removeStates.push(s.stateDataId());
                            }
                            return true;
                        });
                    }
                }
                target.removeStates(removeStates);
            }
    
            {
                cctx.post(target, effect.subject(), new SEffectSubject(this._effectorFact.subject()), undefined, onEffectResult);
            }

            
            // ここで Flush している理由は次の通り。
            // 1. ダメージを個々に表示したい
            // 2. 表示の順序関係を守りたい
            //
            // 1については、連撃等何らかの理由で複数回受けたときに個別に表示する。
            // 経験値の場合はまとめて表示したいのでこことは異なる箇所で表示するが、これはそうではないケース。
            // 例えば「Aは合計でXXXのダメージを受けた」といったように後でまとめて表示する場合はこの処理はいらない。
            //
            // 2については、現状では経験値の表示処理など後でまとめて表示するとき、その順序関係は Entity 順になってしまうため。
            cctx.postEffectResult(target);

            if (target.isDeathStateAffected()) {
                //deadCount++;
                const battler = target.findEntityBehavior(LBattlerBehavior);
                if (battler instanceof LEnemyBehavior) {
                    this._effectorFact.subject()._reward.addExp(battler.exp());
                }
            }
        });
    }

    private judgeHits(effect: SEffect, target: LEntity, result: LEffectResult): void {
        const subject = this._effectorFact.subject();

        if (subject) {
            if (SEffectContext.judgeCertainHits(subject, effect, this._effectorFact.incidentType(), target, result)) {
                return;
            }
        }
        else {
            // 罠Entityなど。
        }

        const hitRate = effect.hitRate() * 100;       // 攻撃側命中率
        const evaRate = effect.evaRate(target) * 100; // 受け側回避率

        result.missed = result.used && this._rand.nextIntWithMax(100) >= hitRate;
        result.evaded = !result.missed && this._rand.nextIntWithMax(100) < evaRate;
    }

    private static judgeCertainHits(subject: LEntity, effect: SEffect, type: SEffectIncidentType, target: LEntity, result: LEffectResult): boolean {

        if (type == SEffectIncidentType.DirectAttack) {
            if (subject.traits(MRBasics.traits.CertainDirectAttack).length > 0) {
                // 直接攻撃必中
                result.missed = false;
                result.evaded = false;
                return true;
            }
        }
        else if (type == SEffectIncidentType.IndirectAttack) {
            const awful = (subject.traits(MRBasics.traits.AwfulPhysicalIndirectAttack).length > 0);
            const hit = (subject.traits(MRBasics.traits.CertainIndirectAttack).length > 0);
            const avoid = (target.traits(MRBasics.traits.DodgePhysicalIndirectAttack).length > 0);
            if (hit && avoid) {
                // 絶対命中と絶対回避がコンフリクトしている場合は通常の判定を行う
                return false;
            }
            else if (avoid) {
                // 間接攻撃回避
                result.missed = true;
                result.evaded = true;
                return true;
            }
            else if (hit) {
                // 間接攻撃 - 絶対命中 (へた投げより優先)
                result.missed = false;
                result.evaded = false;
                return true;
            }
            else if (awful) {
                // 間接攻撃命中なし(へた投げ)
                result.missed = true;
                result.evaded = true;
                return true;
            }
        }

        return false;
    }

    
    // Game_Action.prototype.testApply
    private testApply(target: LBattlerBehavior): boolean {
        // NOTE: コアスクリプトではバトル中かどうかで成否判定が変わったりするが、
        // 本システムでは常に戦闘中のようにふるまう。
        return this.testLifeAndDeath(target);
    }

    // Game_Action.prototype.testLifeAndDeath
    private testLifeAndDeath(targetBattlerBehavior: LBattlerBehavior): boolean {
        /*
        const itemScope = this._effectorFact.rmmzEffectScope()
        if (UAction.isForOpponent(itemScope) || UAction.isForAliveFriend(itemScope)) {
            return targetBattlerBehavior.isAlive();
        } else if (UAction.isForDeadFriend(itemScope)) {
            return targetBattlerBehavior.isDead();
        } else {
            return true;
        }
        */
        return true;
    }

    private applyCore(cctx: SCommandContext, effect: SEffect, target: LEntity, result: LEffectResult): void {

        // Override?
        {
            let result = SCommandResponse.Pass;
            target.iterateBehaviorsReverse(b => {
                result = b.onPreApplyEffect(target, cctx, effect);
                return result == SCommandResponse.Pass;
            });
            if (result != SCommandResponse.Pass) return; 
        }

        if (effect.hasParamDamage()) {
            const criRate = effect.criRate(target) * 100;
            result.critical = (this._rand.nextIntWithMax(100) < criRate);
        }
        
        const applyer = new SEffectApplyer(effect, this._rand);
        applyer.apply(cctx, effect, target);
        applyer.apply(cctx, this._effectorFact.selfModifier(), this._effectorFact.subject());
        if (target._effectResult.success) {
            const effect2 = this._effectorFact.succeededSelfModifier();
            if (effect2) {
                applyer.apply(cctx, effect2, this._effectorFact.subject());
            }
        }

        // 成否がなんであれ、何らかの効果を与えようという意思が働いたことを通知する
        UAction.postEffectSensed(cctx, target);
    }
}
