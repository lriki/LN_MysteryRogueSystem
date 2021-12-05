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
import { DEffect, DParameterQualifying } from "../data/DEffect";
import { REGame } from "./REGame";
import { REBasics } from "../data/REBasics";
import { DEntityId } from "../data/DEntity";

// Game_ActionResult.hpDamage, mpDamage, tpDamage
@RESerializable
export class LParamEffectResult {
    paramId: DParameterId;
    damage: number = 0;    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。
    drain: boolean = false;
    qualifying: DParameterQualifying;
    //priorotyMessage: DParameterQualifying | undefined;

    public constructor(paramId: DParameterId, qualifying: DParameterQualifying) {
        this.paramId = paramId;
        this.qualifying = qualifying;
    }
}

/**
 * 一度の Effect の適用結果。Visual で表示したいコンテンツのソースデータとなる。
 * メッセージに限らず、ポップアップやイメージ表情差分表示など、様々な Visual 表現に必要なすべてのデータを含む。
 */
@RESerializable
export class LEffectResult {
    sourceEffect: DEffect | undefined;  // TODO: ID 使った方がいいだろう

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

    instanceChangedFrom: DEntityId | undefined;

    /*
    [2021/11/21]
    ----------
    まだ EffectResult 表示タイミングは体系化できているわけではないが、おおよそ見えてきた。
    少なくとも CommandChain の終了時に、そのターンで起きたことをまとめて Flush したい。
    経験値をまとめて表示するタイミングがこれに該当するが、これ以外の細かいメッセージも、もし出し忘れがあれば全部ここで出したい。
    そうすると、ターン開始時に open、ターン終了(CommandChain の終了時)に close(flush) でいいだろう。
    なおここでいう close はコマンドチェーンの Epilogue よりも後。本当に完全に終わった時なので注意。
    ワナ師状態で地雷の連鎖爆発が発生して経験値を得たときに備える。
    */
    _revision: number = 0;
    _commitedRevision: number = 0;
    _dirty: boolean = false;

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
        this.instanceChangedFrom = undefined;
        this._dirty = false;
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
            this._dirty = true;
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
        this._dirty = true;
    }
    
    // Game_ActionResult.prototype.isBuffAdded
    public isBuffAdded(paramId: DParameterId): boolean {
        return this.addedBuffs.includes(paramId);
    }

    // Game_ActionResult.prototype.pushAddedBuff
    public pushAddedBuff(paramId: DParameterId): void{
        if (!this.isBuffAdded(paramId)) {
            this.addedBuffs.push(paramId);
            this._dirty = true;
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
            this._dirty = true;
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
            this._dirty = true;
        }
    }

    // Game_ActionResult.prototype.addedStateObjects
    addedStateObjects(): DState[] {
        return this.addedStates.map(id => REData.states[id]);
    }

    // Game_Action.prototype.makeSuccess
    public makeSuccess(): void {
        this.success = true;
        this._dirty = true;
    }

    private shouldShowMessage(): boolean {
        if (this._revision != this._commitedRevision) return true;
        //if (this._dirty) return true;[
        
        return false;


        //return (this._dirty || this._revision != this._commitedRevision);
    }

    private refreshRevision(): void {
        this._commitedRevision = this._revision;
        if (this._revision > 10000) {
            this._revision = 0;
            this._commitedRevision = 0;
        }
        this._dirty = false;
    }

    // Window_BattleLog.prototype.displayActionResults
    public showResultMessages(cctx: SCommandContext, entity: LEntity): void {
        // if (this._revision != this._commitedRevision) {
        // }
        // else {
        //     return;
        // }

        if (this.shouldShowMessage()) {
            this.refreshRevision();
            
            const targetName = UName.makeUnitName(entity);

            if (this.instanceChangedFrom) {
                cctx.postMessage(tr2("%1は%2に変化した。").format(REData.entities[this.instanceChangedFrom].makeDisplayName(0), targetName));
            }
            
            if (this.missed) {
                cctx.postMessage(tr2("TEST: 外れた。"));
            }
            else {
                for (const param of this.paramEffects2) {
                    cctx.postMessage(this.makeParamDamageText(targetName, param));
                }
            }

            const isActor = this.focusedFriendly;

            // Game_Actor.prototype.showAddedStates
            {
                for (const stateId of this.addedStates) {
                    const state = REData.states[stateId];
                    const stateText = isActor ? state.message1 : state.message2;
                    if (stateText) {
                        cctx.postMessage(stateText.format(targetName));
                    }
                }
            }
            // Game_Actor.prototype.showRemovedStates
            {
                for (const stateId of this.removedStates) {
                    const state = REData.states[stateId];
                    if (state.message4) {
                        cctx.postMessage(state.message4.format(targetName));
                    }
                }
            }
            // Window_BattleLog.prototype.displayChangedBuffs
            {
                for (const paramId of this.addedBuffs) {
                    const text = DTextManager.buffAdd.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
                for (const paramId of this.addedDebuffs) {
                    const text = DTextManager.debuffAdd.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
                for (const paramId of this.removedBuffs) {
                    const text = DTextManager.buffRemove.format(targetName, DTextManager.param(REData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
            }

            
            if (!this.success) {
                cctx.postMessage(DTextManager.actionFailure.format(targetName));
            }

            // 経験値
            {
                const targetName = LEntityDescription.makeDisplayText(UName.makeUnitName(entity), DescriptionHighlightLevel.UnitName);

                if (this.gainedExp > 0) {
                    const text = DTextManager.obtainExp.format(this.gainedExp, DTextManager.exp);
                    cctx.postMessage(text);
                }
                

                // Game_Actor.prototype.displayLevelUp
                if (this.levelup || this.leveldown) {
                    const battler = entity.getEntityBehavior(LBattlerBehavior);
                    if (battler instanceof LActorBehavior) {
                        if (this.levelup) {
                            const text = DTextManager.levelUp.format(targetName, DTextManager.level, battler.level());
                            cctx.postMessage(text);
                            SSoundManager.playLevelUp();
                        }
                        if (this.leveldown) {
                            const text = tr2("%1は%2が下がった！").format(targetName, DTextManager.level);
                            cctx.postMessage(text);
                            SSoundManager.playLevelUp();
                        }
                    }
                    else {
                        throw new Error("NotImplemented.");
                    }
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
            if (paramResult.paramId == REBasics.params.hp) {
                fmt = isActor ? DTextManager.actorNoDamage : DTextManager.enemyNoDamage;
                return fmt.format(entityName);
            }
            else {
                return tr2("%1の%2は下がらなかった。").format(entityName, paramData.displayName);
            }
        }
    }

    private makeDamageOrLossMessage(paramResult: LParamEffectResult, entityName: string, param: REData_Parameter, isSubjectivity: boolean): string {
        const damage = paramResult.damage;
        if (isSubjectivity) {
            if (paramResult.qualifying && paramResult.qualifying.alliesSideLossMessage) {
                return paramResult.qualifying.alliesSideLossMessage.format(entityName, param.displayName, damage);
            }
            else if (param.selfLossMessage) {
                return param.selfLossMessage.format(entityName, param.displayName, damage);
            }
            else {
                return DTextManager.actorDamage.format(entityName, damage);
            }
        }
        else {
            if (paramResult.qualifying && paramResult.qualifying.opponentLossMessage) {
                return paramResult.qualifying.opponentLossMessage.format(entityName, param.displayName, damage);
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
            if (paramResult.qualifying && paramResult.qualifying.alliesSideGainMessage) {
                return paramResult.qualifying.alliesSideGainMessage.format(entityName, param.displayName, -damage);
            }
            else if (param.selfGainMessage) {
                return param.selfGainMessage.format(entityName, param.displayName, -damage);
            }
            else {
                return DTextManager.actorRecovery.format(entityName, param.displayName, -damage);
            }
        }
        else {
            if (paramResult.qualifying && paramResult.qualifying.opponentGainMessage) {
                return paramResult.qualifying.opponentGainMessage.format(entityName, param.displayName, -damage);
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

