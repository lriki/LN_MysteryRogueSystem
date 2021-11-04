import { assert, RESerializable, tr2 } from "ts/re/Common";
import { DState, DStateId } from "ts/re/data/DState";
import { REData } from "ts/re/data/REData";
import { DescriptionHighlightLevel, LEntityDescription } from "ts/re/objects/LIdentifyer";
import { LEntity } from "ts/re/objects/LEntity";
import { SCommandContext } from "../system/SCommandContext";
import { DParameterId, REData_Parameter } from "ts/re/data/DParameter";
import { LBattlerBehavior } from "./behaviors/LBattlerBehavior";
import { LActorBehavior } from "./behaviors/LActorBehavior";
import { SSoundManager } from "ts/re/system/SSoundManager";
import { UName } from "ts/re/usecases/UName";
import { DTextManager } from "../data/DTextManager";
import { DParameterQualifying } from "../data/DEffect";

// Game_ActionResult.hpDamage, mpDamage, tpDamage
@RESerializable
export class LParamEffectResult {
    paramId: DParameterId;
    damage: number = 0;    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。
    drain: boolean = false;
    priorotyMessage: DParameterQualifying | undefined;

    public constructor(paramId: DParameterId) {
        this.paramId = paramId;
    }
}

/**
 * 一度の Effect の適用結果。Visual で表示したいコンテンツのソースデータとなる。
 * メッセージに限らず、ポップアップやイメージ表情差分表示など、様々な Visual 表現に必要なすべてのデータを含む。
 */
@RESerializable
export class LEffectResult {

    // 意味のある効果適用ができたかどうか。
    // 確率計算の前に、現状知りえる情報内で明らかに適用できるかどうかを判定する。
    // 例えば HP Full の時に回復アイテムを使ったときは false になったりする。
    // false の場合「しかし、なにもおこらなかった」を表示したりする。
    used: boolean = false;  // TODO: NotImplemented

    // 攻撃側の命中判定結果。true の場合命中。used == true の場合参照できる。
    missed: boolean = false;  // TODO: NotImplemented

    // 防御側の回避判定結果。true の場合命中。used == true の場合参照できる。
    evaded: boolean = false;  // TODO: NotImplemented

    // 物理攻撃であるか。回避判定に eva を使うか、mev を使うかきめたり、クリティカルの発生有無を決めるのに使う。
    // Game_Action.prototype.isPhysical 参照。
    physical: boolean = false;  // TODO: NotImplemented

    //drain: boolean = false;  // TODO: NotImplemented

    // Game_Action.prototype.itemCri
    critical: boolean = false;  // TODO: NotImplemented

    // 効果適用の成否。false の場合、 "%1には効かなかった！"
    // used, missed, evaded の判定後、実際に防御側のパラメータを変動させたかどうか。
    success: boolean = false;

    // HP に関係する効果であったか。文字の色を変えたりする
    hpAffected = false;  // TODO: NotImplemented

    paramEffects2: LParamEffectResult[] = [];
    //parameterDamags: number[] = [];    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。

    addedStates: DStateId[] = [];
    removedStates: DStateId[] = [];

    addedBuffs: DParameterId[] = [];
    addedDebuffs: DParameterId[] = [];
    removedBuffs: DParameterId[] = [];

    // 効果を受けたのは、Camera がフォーカスしている勢力に属する者であるか
    focusedFriendly: boolean = true;

    levelup: boolean = false;
    leveldown: boolean = false;

    gainedExp: number = 0;

    // Game_ActionResult.prototype.isHit
    isHit(): boolean {
        return this.used && !this.missed && !this.evaded;
    }

    clear(): void {
        this.used = false;
        this.missed = false;
        this.evaded = false;
        this.physical = false;
        this.critical = false;
        this.success = false;
        this.hpAffected = false;
        this.paramEffects2 = [];
        this.addedStates = [];
        this.removedStates = [];
        this.addedBuffs = [];
        this.addedDebuffs = [];
        this.removedBuffs = [];
        this.focusedFriendly = true;
        this.levelup = false;
        this.leveldown = false;
        this.gainedExp = 0;
    }

    public hasResult(): boolean {
        return true;
    }

    // Game_ActionResult.prototype.isStateAdded
    isStateAdded(stateId: DStateId): boolean {
        return this.addedStates.includes(stateId);
    };

    // Game_ActionResult.prototype.pushAddedState
    pushAddedState(stateId: DStateId): void {
        if (!this.isStateAdded(stateId)) {
            this.addedStates.push(stateId);
        }
    }

    // Game_ActionResult.prototype.isStateRemoved
    isStateRemoved(stateId: DStateId): boolean {
        return this.removedStates.includes(stateId);
    }
    
    // Game_ActionResult.prototype.pushRemovedState
    pushRemovedState(stateId: DStateId): void {
        if (!this.isStateRemoved(stateId)) {
            this.removedStates.push(stateId);
        }
    }
    
    // Game_ActionResult.prototype.isBuffAdded
    public isBuffAdded(paramId: DParameterId): boolean {
        return this.addedBuffs.includes(paramId);
    }

    // Game_ActionResult.prototype.pushAddedBuff
    public pushAddedBuff(paramId: DParameterId): void{
        if (!this.isBuffAdded(paramId)) {
            this.addedBuffs.push(paramId);
        }
    }

    // Game_ActionResult.prototype.isDebuffAdded 
    public isDebuffAdded(paramId: DParameterId): boolean {
        return this.addedDebuffs.includes(paramId);
    }
    
    // Game_ActionResult.prototype.pushAddedDebuff
    public pushAddedDebuff(paramId: DParameterId): void {
        if (!this.isDebuffAdded(paramId)) {
            this.addedDebuffs.push(paramId);
        }
    }
    
    // Game_ActionResult.prototype.isBuffRemoved
    public isBuffRemoved(paramId: DParameterId): boolean{
        return this.removedBuffs.includes(paramId);
    }
    
    // Game_ActionResult.prototype.pushRemovedBuff
    public pushRemovedBuff(paramId: DParameterId): void {
        if (!this.isBuffRemoved(paramId)) {
            this.removedBuffs.push(paramId);
        }
    }

    // Game_ActionResult.prototype.addedStateObjects
    addedStateObjects(): DState[] {
        return this.addedStates.map(id => REData.states[id]);
    }

    // Game_Action.prototype.makeSuccess
    public makeSuccess(): void {
        this.success = true;
    }

    // Window_BattleLog.prototype.displayActionResults
    public showResultMessages(context: SCommandContext, entity: LEntity): void {

        const targetName = UName.makeUnitName(entity);
        
        if (this.missed) {
            context.postMessage(tr2("TEST: 外れた。"));
        }
        else {
            for (const param of this.paramEffects2) {
                context.postMessage(this.makeParamDamageText(targetName, param));
            }
        }

        const isActor = this.focusedFriendly;

        // Game_Actor.prototype.showAddedStates
        {
            for (const stateId of this.addedStates) {
                const state = REData.states[stateId];
                const stateText = isActor ? state.message1 : state.message2;
                if (stateText) {
                    context.postMessage(stateText.format(targetName));
                }
            }
        }
        // Game_Actor.prototype.showRemovedStates
        {
            for (const stateId of this.removedStates) {
                const state = REData.states[stateId];
                if (state.message4) {
                    context.postMessage(state.message4.format(targetName));
                }
            }
        }
        // Window_BattleLog.prototype.displayChangedBuffs
        {
            for (const paramId of this.addedBuffs) {
                const text = DTextManager.buffAdd.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                context.postMessage(text);
            }
            for (const paramId of this.addedDebuffs) {
                const text = DTextManager.debuffAdd.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                context.postMessage(text);
            }
            for (const paramId of this.removedBuffs) {
                const text = DTextManager.buffRemove.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                context.postMessage(text);
            }
        }

        
        //if (!this.success) {
        //    const m = "%1には効かなかった！";
        //    context.postMessage(m.format(targetName));
        //}

        // 経験値
        {
            const targetName = LEntityDescription.makeDisplayText(UName.makeUnitName(entity), DescriptionHighlightLevel.UnitName);

            if (this.gainedExp > 0) {
                const text = DTextManager.obtainExp.format(this.gainedExp, DTextManager.exp);
                context.postMessage(text);
            }
            

            // Game_Actor.prototype.displayLevelUp
            if (this.levelup || this.leveldown) {
                const battler = entity.getEntityBehavior(LBattlerBehavior);
                if (battler instanceof LActorBehavior) {
                    if (this.levelup) {
                        const text = DTextManager.levelUp.format(targetName, DTextManager.level, battler.level());
                        context.postMessage(text);
                        SSoundManager.playLevelUp();
                    }
                    if (this.leveldown) {
                        const text = tr2("%1は%2が下がった！").format(targetName, DTextManager.level);
                        context.postMessage(text);
                        SSoundManager.playLevelUp();
                    }
                }
                else {
                    throw new Error("NotImplemented.");
                }
            }
        }
    }

    // Window_BattleLog.prototype.makeHpDamageText
    private makeParamDamageText(entityName: string, paramResult: LParamEffectResult): string {
        const paramData = REData.parameters[paramResult.paramId];
        const damage = paramResult.damage;
        const isActor = this.focusedFriendly;
        let fmt;
        if (damage > 0 && paramResult.drain) {
            fmt = isActor ? DTextManager.actorDrain : DTextManager.enemyDrain;
            return fmt.format(entityName, paramData.displayName, damage);
        } else if (damage > 0) {
            return this.makeDamageOrLossMessage(paramResult, entityName, paramData, isActor);
        } else if (damage < 0) {
            return this.makeRecoveryOrGainMessage(paramResult, entityName, paramData, isActor);
        } else {
            fmt = isActor ? DTextManager.actorNoDamage : DTextManager.enemyNoDamage;
            return fmt.format(entityName);
        }
    }

    private makeDamageOrLossMessage(paramResult: LParamEffectResult, entityName: string, param: REData_Parameter, isSubjectivity: boolean): string {
        const damage = paramResult.damage;
        if (isSubjectivity) {
            if (paramResult.priorotyMessage && paramResult.priorotyMessage.alliesSideLossMessage) {
                return paramResult.priorotyMessage.alliesSideLossMessage.format(entityName, param.displayName, damage);
            }
            else if (param.selfLossMessage) {
                return param.selfLossMessage.format(entityName, param.displayName, damage);
            }
            else {
                return DTextManager.actorDamage.format(entityName, damage);
            }
        }
        else {
            if (paramResult.priorotyMessage && paramResult.priorotyMessage.opponentLossMessage) {
                return paramResult.priorotyMessage.opponentLossMessage.format(entityName, param.displayName, damage);
            }
            else if (param.targetLossMessage) {
                return param.targetLossMessage.format(entityName, param.displayName, damage);
            }
            else {
                return DTextManager.enemyDamage.format(entityName, damage);
            }
        }
    }

    private makeRecoveryOrGainMessage(paramResult: LParamEffectResult, entityName: string, param: REData_Parameter, isSubjectivity: boolean): string {
        const damage = paramResult.damage;
        if (isSubjectivity) {
            if (paramResult.priorotyMessage && paramResult.priorotyMessage.alliesSideGainMessage) {
                return paramResult.priorotyMessage.alliesSideGainMessage.format(entityName, param.displayName, -damage);
            }
            else if (param.selfGainMessage) {
                return param.selfGainMessage.format(entityName, param.displayName, -damage);
            }
            else {
                return DTextManager.actorRecovery.format(entityName, param.displayName, -damage);
            }
        }
        else {
            if (paramResult.priorotyMessage && paramResult.priorotyMessage.opponentGainMessage) {
                return paramResult.priorotyMessage.opponentGainMessage.format(entityName, param.displayName, -damage);
            }
            else if (param.targetGainMessage) {
                return param.targetGainMessage.format(entityName, param.displayName, -damage);
            }
            else {
                return DTextManager.enemyRecovery.format(entityName, param.displayName, -damage);
            }
        }
    }
}

