import { DBasics } from "ts/re/data/DBasics";
import { DItemEffect } from "ts/re/data/DItemEffect";
import { LandExitResult, REData } from "ts/re/data/REData";
import { LBattlerBehavior } from "ts/re/objects/behaviors/LBattlerBehavior";
import { LEntity } from "ts/re/objects/LEntity";
import { Helpers } from "./Helpers";
import { LEffectResult, LParamEffectResult } from "../objects/LEffectResult";
import { DParameterId } from "ts/re/data/DParameter";
import { LEnemyBehavior } from "ts/re/objects/behaviors/LEnemyBehavior";
import { SCommandContext } from "./SCommandContext";
import { REGame } from "ts/re/objects/REGame";
import { DTraits } from "ts/re/data/DTraits";
import { DEffectHitType, DParameterEffectApplyType, DParameterQualifying, DOtherEffectQualifying, DEffect } from "ts/re/data/DEffect";
import { LProjectableBehavior } from "ts/re/objects/behaviors/activities/LProjectableBehavior";
import { USpawner } from "ts/re/usecases/USpawner";
import { RESystem } from "./RESystem";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { UIdentify } from "ts/re/usecases/UIdentify";
import { LRandom } from "ts/re/objects/LRandom";
import { DEntityKindId } from "ts/re/data/DEntityKind";
import { DStateId } from "ts/re/data/DState";
import { SEffectApplyer, SEffectorFact, SEffectQualifyings } from "./SEffectApplyer";


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

    public applyWithWorth(commandContext: SCommandContext, targets: LEntity[]): void {
        let deadCount = 0;
        let totalExp = 0;
        for (const target of targets) {
            const result = this.applyWithHitTest(commandContext, target);
            
            result.showResultMessages(commandContext, target);

            const battler = target.findEntityBehavior(LBattlerBehavior);
            if (battler) {  // apply() で changeInstance() することがあるので、getBehavior ではなく findBehavior でチェック
                if (battler.isDead()) {
                    deadCount++;
                    if (battler instanceof LEnemyBehavior) {
                        totalExp += battler.exp();
                    }
                }
            }
        }
        
        if (deadCount > 0) {
            const awarder = this._effectorFact.subjectBehavior();
            if (awarder) {
                awarder.gainExp(totalExp)
            }
        }
    }
    
    // Game_Action.prototype.apply
    private applyWithHitTest(commandContext: SCommandContext, target: LEntity): LEffectResult {
        const targetBattlerBehavior = target.findEntityBehavior(LBattlerBehavior);
        const result = target._effectResult;
        result.clear();

        if (targetBattlerBehavior) {

            result.used = this.testApply(targetBattlerBehavior);


            // 命中判定
            this.judgeHits(target, result);
            
            result.physical = this._effectorFact.isPhysical();

            if (result.isHit()) {
                this.applyCore(commandContext, target, result);
            }
            //this.updateLastTarget(target);
        }
        else {
            this.applyCore(commandContext, target, result);
        }


        const focusedEntity = REGame.camera.focusedEntity();
        const friendlySubject = focusedEntity ? Helpers.isFriend(this._effectorFact.subject(), focusedEntity) : false;
        if (friendlySubject) {  // subject は味方
            result.focusedFriendly = Helpers.isFriend(this._effectorFact.subject(), target);
        }
        else { // subject は味方以外 (敵・NPC)
            result.focusedFriendly = true;  // 敵 vs 敵のときは、味方用のメッセージを表示したい ("ダメージを受けた！")
        }

        // ダメージ試行時のステート解除判定 (かなしばりなど)
        // 実際にダメージが発生したかではなく、ダメージを与えようとしたか (回復ではないか) で判断する。
        {
            const removeStates: DStateId[] = [];
            for (const p of this._effectorFact.targetApplyer().parameterEffects()) {
                if (p && !p.isRecover()) {
                    target.iterateStates(s => {
                        if (s.checkRemoveAtDamageTesting(p.paramId)) {
                            removeStates.push(s.stateDataId());
                        }
                    });
                }
            }
            target.removeStates(removeStates);
        }

        return result;
    }

    private judgeHits(target: LEntity, result: LEffectResult): void {
        const subject = this._effectorFact.subject();

        if (subject) {
            if (this._effectorFact.incidentType() == SEffectIncidentType.DirectAttack) {
                if (subject.traits(DTraits.CertainDirectAttack).length > 0) {
                    // 直接攻撃必中
                    result.missed = false;
                    result.evaded = false;
                    return;
                }
            }
        }
        else {
            // 罠Entityなど。
        }

        const hitRate = this._effectorFact.hitRate() * 100;       // 攻撃側命中率
        const evaRate = this._effectorFact.evaRate(target) * 100; // 受け側回避率

        result.missed = result.used && this._rand.nextIntWithMax(100) >= hitRate;
        result.evaded = !result.missed && this._rand.nextIntWithMax(100) < evaRate;
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

    private applyCore(commandContext: SCommandContext, target: LEntity, result: LEffectResult): void {

        if (this._effectorFact.targetApplyer().hasParamDamage()) {
            const criRate = this._effectorFact.criRate(target) * 100;
            result.critical = (this._rand.nextIntWithMax(100) < criRate);
        }
        
        const applyer = new SEffectApplyer(this._effectorFact, this._rand);
        applyer.apply(commandContext, this._effectorFact.targetApplyer(), target);
        applyer.apply(commandContext, this._effectorFact.selfApplyer(), this._effectorFact.subject());
    }








    

}
