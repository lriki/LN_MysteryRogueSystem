import { assert, MRSerializable, tr2 } from "ts/mr/Common";
import { DState, DStateId } from "ts/mr/data/DState";
import { MRData } from "ts/mr/data/MRData";
import { DescriptionHighlightColor, LEntityDescription } from "ts/mr/lively/LIdentifyer";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { SCommandContext } from "../system/SCommandContext";
import { DParameterFlavorEffect, DParamMessageValueSource, DValueAddition } from "ts/mr/data/DParameter";
import { SSoundManager } from "ts/mr/system/SSoundManager";
import { UName } from "ts/mr/utility/UName";
import { DTextManager } from "../data/DTextManager";
import { DEffect, DParameterQualifying, DValuePoint } from "../data/DEffect";
import { MRBasics } from "../data/MRBasics";
import { DEntityId } from "../data/DEntity";
import { DEffectId, DParameterId } from "../data/DCommon";
import { DFactionType as DFactionType } from "../data/DFaction";
import { DFlavorEffect } from "../data/DFlavorEffect";

// Game_ActionResult.hpDamage, mpDamage, tpDamage
@MRSerializable
export class LParamEffectResult {
    paramId: DParameterId;
    damage: number = 0;    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。
    oldValue: number = 0;
    newValue: number = 0;
    drain: boolean = false;
    applyTarget: DValuePoint;

    parameterDamageEffect: DParameterQualifying | undefined;
    //qualifying: DParameterQualifying;
    //priorotyMessage: DParameterQualifying | undefined;

    public constructor(paramId: DParameterId) {
        this.paramId = paramId;
        this.applyTarget = DValuePoint.Actual
    }

    public paramDisplayName(): string {
        const data = MRData.parameters[this.paramId];
        if (this.applyTarget == DValuePoint.Growth) {
            return data.displayNameMaximum;
        }
        else {
            return data.displayName;
        }
    }

    public getValue(entity: LEntity, recover: boolean): number {
        const paramData = MRData.parameters[this.paramId];
        if (paramData.messageValueSource == DParamMessageValueSource.Relative) {
            if (recover)
                return -this.damage;
            else
                return this.damage;
        }
        else if (paramData.messageValueSource == DParamMessageValueSource.Absolute) {
            return entity.getActualParam(this.paramId);
        }
        else {
            throw new Error("Unreachable.");
        }
    }
}

/**
 * 一度の Effect の適用結果。Visual で表示したいコンテンツのソースデータとなる。
 * メッセージに限らず、ポップアップやイメージ表情差分表示など、様々な Visual 表現に必要なすべてのデータを含む。
 */
@MRSerializable
export class LEffectResult {
    sourceEffectId: DEffectId | undefined;  // TODO: ID 使った方がいいだろう

    // 意味のある効果適用ができたかどうか。
    // 確率計算の前に、現状知りえる情報内で明らかに適用できるかどうかを判定する。
    // 例えば HP Full の時に回復アイテムを使ったときは false になったりする。
    // false の場合「しかし、なにもおこらなかった」を表示したりする。
    used: boolean = false;

    // 攻撃側の命中判定結果。true の場合命中。used == true の場合参照できる。
    missed: boolean = false;

    // 防御側の回避判定結果。true の場合命中。used == true の場合参照できる。
    evaded: boolean = false;

    // 物理攻撃であるか。回避判定に eva を使うか、mev を使うかきめたり、クリティカルの発生有無を決めるのに使う。
    // Game_Action.prototype.isPhysical 参照。
    physical: boolean = false;

    //drain: boolean = false;

    // Game_Action.prototype.itemCri
    critical: boolean = false;

    // 効果適用の成否。false の場合、 "%1には効かなかった！"
    // used, missed, evaded の判定後、実際に防御側のパラメータを変動させたかどうか。
    success: boolean = false;

    // HP に関係する効果であったか。文字の色を変えたりする
    hpAffected = false;

    paramEffects2: LParamEffectResult[] = [];
    //parameterDamags: number[] = [];    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。

    addedStates: DStateId[] = [];
    removedStates: DStateId[] = [];

    addedBuffs: DParameterId[] = [];
    addedDebuffs: DParameterId[] = [];
    removedBuffs: DParameterId[] = [];

    // 効果を受けたのは、Camera がフォーカスしている勢力に属する者であるか
    /** @deprecated */
    focusedFriendly: boolean = true;
    public get looksFactionType(): DFactionType {    // 効果を与えてきた者は、自身からみてどのような勢力に属するか。
        return this.focusedFriendly ? DFactionType.Friendly : DFactionType.Hostile; // TODO: Natural
    }

    /** @deprecated */
    levelup: boolean = false;
    /** @deprecated */
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

    public clearParamEffects(): void {
        this.paramEffects2 = [];
    }

    public hasResult(): boolean {
        return true;
    }

    public get sourceEffect(): DEffect {
        assert(this.sourceEffectId);
        return MRData.effects[this.sourceEffectId];
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
        return this.addedStates.map(id => MRData.states[id]);
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
                cctx.postMessage(tr2("%1は%2に変化した。").format(MRData.entities[this.instanceChangedFrom].makeDisplayName(0), targetName));
            }
            
            if (this.missed) {
                // Window_BattleLog.prototype.displayMiss
                cctx.postMessage(DTextManager.enemyNoHit.format(targetName));
                if (this.physical) {
                    SSoundManager.playMiss();
                }
            }
            else {
                for (const param of this.paramEffects2) {
                    this.displayParameterFlavorEffect(cctx, entity, targetName, param);
                    //cctx.postMessage(this.makeParamDamageText(entity, targetName, param));
                }
            }

            const isActor = this.focusedFriendly;

            // Game_Actor.prototype.showAddedStates
            {
                for (const stateId of this.addedStates) {
                    const state = MRData.states[stateId];
                    const stateText = isActor ? state.message1 : state.message2;
                    if (stateText) {
                        cctx.postMessage(stateText.format(targetName));
                    }
                }
            }
            // Game_Actor.prototype.showRemovedStates
            {
                for (const stateId of this.removedStates) {
                    const state = MRData.states[stateId];
                    if (state.message4) {
                        cctx.postMessage(state.message4.format(targetName));
                    }
                }
            }
            // Window_BattleLog.prototype.displayChangedBuffs
            {
                for (const paramId of this.addedBuffs) {
                    const text = DTextManager.buffAdd.format(targetName, DTextManager.param(MRData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
                for (const paramId of this.addedDebuffs) {
                    const text = DTextManager.debuffAdd.format(targetName, DTextManager.param(MRData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
                for (const paramId of this.removedBuffs) {
                    const text = DTextManager.buffRemove.format(targetName, DTextManager.param(MRData.parameters[paramId].battlerParamId));
                    cctx.postMessage(text);
                }
            }

            
            if (this.isHit() && !this.success) {    // 条件は Window_BattleLog.prototype.displayFailure と同じ
                cctx.postMessage(DTextManager.actionFailure.format(targetName));
            }

            // 経験値
            {
                const targetName = LEntityDescription.makeDisplayText(UName.makeUnitName(entity), DescriptionHighlightColor.UnitName);

                if (this.gainedExp > 0) {
                    const text = DTextManager.obtainExp.format(this.gainedExp, DTextManager.exp);
                    cctx.postMessage(text);
                }
                

                // Game_Actor.prototype.displayLevelUp
                if (this.levelup || this.leveldown) {
                    if (this.levelup) {
                        const text = DTextManager.levelUp.format(targetName, DTextManager.level, entity.getActualParam(MRBasics.params.level));
                        cctx.postMessage(text);
                        SSoundManager.playLevelUp();
                    }
                    if (this.leveldown) {
                        const text = tr2("%1は%2が下がった！").format(targetName, DTextManager.level);
                        cctx.postMessage(text);
                        SSoundManager.playLevelUp();
                    }
                }
            }
        }
    }

    private displayParameterFlavorEffect(cctx: SCommandContext, entity: LEntity, entityDisplayName: string, paramResult: LParamEffectResult) {
        const param = MRData.parameters[paramResult.paramId];
        
        // 条件に一致する flavorEffect を探す。
        // 見つからなかったら Neature にフォールバック
        
        let flavorEffect: DFlavorEffect | undefined = undefined;
        if (paramResult.parameterDamageEffect) {
            flavorEffect = this.selectParameterFlavorEffect(entity, paramResult, paramResult.parameterDamageEffect.getParameterFlavorEffectByLooksFaction(this.looksFactionType));
            if (!flavorEffect && this.looksFactionType != DFactionType.Neutral) {
                flavorEffect = this.selectParameterFlavorEffect(entity, paramResult, paramResult.parameterDamageEffect.getParameterFlavorEffectByLooksFaction(DFactionType.Neutral));
            }
        }
        if (!flavorEffect) {
            flavorEffect = this.selectParameterFlavorEffect(entity, paramResult, param.getParameterFlavorEffectByLooksFaction(this.looksFactionType));
        }
        if (!flavorEffect && this.looksFactionType != DFactionType.Neutral) {
            flavorEffect = this.selectParameterFlavorEffect(entity, paramResult, param.getParameterFlavorEffectByLooksFaction(DFactionType.Neutral));
        }

        
        let messageArgs: unknown[] = [];
        if (flavorEffect && flavorEffect.text.length > 0) {
            const paramName = paramResult.paramDisplayName();
            const relValue = Math.abs(paramResult.damage);
            const newValue = entity.getActualParam(paramResult.paramId);
            const oldValue = newValue - paramResult.damage;
            messageArgs = [
                entityDisplayName,
                paramName,
                param.makeDisplayValue(relValue),
                param.makeDisplayValue(oldValue),
                param.makeDisplayValue(newValue),
            ];
        }

        cctx.displayFlavorEffect(entity, flavorEffect, { messageFormatArgs: messageArgs })

        // if (!flavorEffect) {
        //     return; // 再生するものは無かった
        // }
        
        // // Message 再生
        // if (flavorEffect.text) {
        //     const paramName = paramResult.paramDisplayName();
        //     const relValue = Math.abs(paramResult.damage);
        //     const newValue = entity.actualParam(paramResult.paramId);
        //     const oldValue = newValue - paramResult.damage;
        //     const text = flavorEffect.text.format(
        //         entityDisplayName,
        //         paramName,
        //         param.makeDisplayValue(relValue),
        //         param.makeDisplayValue(oldValue),
        //         param.makeDisplayValue(newValue));
        //     cctx.postMessage(text);
        // }

        // // 効果音 再生
        // if (flavorEffect.sound) {
        //     SSoundManager.playSe(flavorEffect.sound);
        // }
        
        // // アニメーション 再生
        // if (flavorEffect.rmmzAnimationId > 0) {
        //     cctx.postAnimation(entity, flavorEffect.rmmzAnimationId, false);    // 基本的に Log や Motion と並行再生したいので、 wait=false.
        // }

        // // Motion 再生
        // if (flavorEffect.motionId > 0) {
        //     cctx.postSequel(entity, flavorEffect.motionId);
        // }
    }

    private selectParameterFlavorEffect(entity: LEntity, paramResult: LParamEffectResult, effects: (DParameterFlavorEffect | undefined)[]): DFlavorEffect | undefined {
        for (let i = effects.length - 1; i >= 0; i--) {
            const effect = effects[i];
            if (effect) {
                if (this.meetsConditionParameterFlavorEffect(entity, paramResult, effect)) {
                    return effect.flavorEffect;
                }
            }
        }
        return undefined;
    }

    private meetsConditionParameterFlavorEffect(entity: LEntity, paramResult: LParamEffectResult, effect: DParameterFlavorEffect): boolean {
        if (effect.point != paramResult.applyTarget) {
            return false;
        }
        if (paramResult.damage > 0 && effect.addition != DValueAddition.Loss) {
            return false;
        }
        if (paramResult.damage < 0 && effect.addition != DValueAddition.Gain) {
            return false;
        }
        if (paramResult.damage == 0 && effect.addition != DValueAddition.None) {
            return false;
        }
        if (effect.conditionFormula) {
            const param = MRData.parameters[paramResult.paramId];
            const value = paramResult.newValue;
            const old = paramResult.oldValue;
            const min = entity.params.getActualMin(entity, param.id);
            const max = entity.getParamActualMax(param.id);
            const r = eval(effect.conditionFormula);
            if (!r) {
                return false;
            }
        }
        return true;
    }







}

