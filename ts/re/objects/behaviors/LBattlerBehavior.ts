import { DState, DStateId, DStateRestriction } from "ts/re/data/DState";
import { LandExitResult, REData } from "ts/re/data/REData";
import { REGame } from "../REGame";
import { LBehavior } from "ts/re/objects/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffectorFact } from "ts/re/system/SEffectContext";
import { RESystem } from "ts/re/system/RESystem";
import { DBasics } from "ts/re/data/DBasics";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { LParamSet } from "../LParam";

export class LBattlerBehavior extends LBehavior {

    constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        throw new Error();  // LBattlerBehavior 自体の clone は禁止
    }

    public paramSet(): LParamSet {
        return this.ownerEntity().params();
    }

    onAttached(): void {
        const params = this.paramSet();
        params.acquireParam(DBasics.params.hp);
        params.acquireParam(DBasics.params.mp);
        params.acquireParam(DBasics.params.atk);
        params.acquireParam(DBasics.params.def);
        params.acquireParam(DBasics.params.mat);
        params.acquireParam(DBasics.params.mdf);
        params.acquireParam(DBasics.params.agi);
        params.acquireParam(DBasics.params.luk);
        params.acquireParam(DBasics.params.tp);
        params.acquireParam(DBasics.params.fp);
    }

    /**
     * すべての状態をリセットする。
     * 
     * recoverAll() は buffs 等一部リセットされないものがあるが、このメソッドは全てリセットする。
     * 拠点へ戻ったときなどで完全リセットしたいときに使う。
     */
    public resetAllConditions(): void {
        this.paramSet().resetAllConditions();
        this.clearStates();
    }

    // Game_BattlerBase.prototype.clearStates
    private clearStates(): void {
        this.ownerEntity().removeAllStates();
    }


    // Game_BattlerBase.prototype.isGuard 
    public isGuard(): boolean {
        return false;
    };


    // Game_BattlerBase.prototype.isStateAffected
    isStateAffected(stateId: DStateId): boolean {
        const entity = this.ownerEntity();
        return entity.isStateAffected(stateId);
    }
    
    // Game_BattlerBase.prototype.isDeathStateAffected
    isDeathStateAffected(): boolean {
        return this.isStateAffected(DBasics.states.dead);
    }

    // Game_BattlerBase.prototype.states
    public states(): DState[] {
        return this.ownerEntity().states().map(s => REData.states[s.stateDataId()]);
    }

    // Game_BattlerBase.prototype.refresh
    // Game_Battler.prototype.refresh
    refresh() {



        //for (const stateId of this.stateResistSet()) {
        //    this.eraseState(stateId);
        //}

        //const hp = this.actualParam(RESystem.parameters.hp);

        //console.log("refresh--------");
        /*
        for (const param of REData.parameters) {
            const max = this.idealParam(param.id);
            //console.log("max", max);

            this._actualParamDamges[param.id] = this._actualParamDamges[param.id].clamp(0, max);//this.actualParam(param.id).clamp(0, max);
        }
        */

        // TODO: 全パラメータ
        //const mhp = this.idealParam(RESystem.parameters.hp);
        //const mmp = this.idealParam(RESystem.parameters.mp);
        //const mtp = this.idealParam(RESystem.parameters.tp);
        //this._actualParams[RESystem.parameters.hp] = this.actualParam(RESystem.parameters.hp).clamp(0, mhp);
        //this._actualParams[RESystem.parameters.mp] = this.actualParam(RESystem.parameters.mp).clamp(0, mmp);
        //this._actualParams[RESystem.parameters.tp] = this.actualParam(RESystem.parameters.tp).clamp(0, mtp);

    
        

        //context.postSequel(entity, RESystem.sequels.CollapseSequel);

        //context.postDestroy(entity);
    }
    
    // Game_BattlerBase.prototype.recoverAll
    public recoverAll(): void {
        this.clearStates();
        this.paramSet().params().forEach(x => x?.clearDamage());
        //for (let paramId = 0; paramId < REData.parameters.length; paramId++) {

        //    this._actualParamDamges[paramId] = 0;
        //}
        
        this.refresh();
    };

    // Game_BattlerBase.prototype.isDead
    public isDead(): boolean {
        return this.isDeathStateAffected();
    }
    
    // Game_BattlerBase.prototype.isAlive
    public isAlive(): boolean {
        return !this.isDeathStateAffected();
    }



    // Game_BattlerBase.prototype.restriction
    // 各種 restriction を集計し、制約が最も強いものを返す。
    public restriction(): DStateRestriction {
        const restrictions = this.states().map(state => state.restriction);
        return Math.max(0, ...restrictions);
    }
    
    // Game_BattlerBase.prototype.restriction
    public isRestricted(): boolean {
        return this.restriction() > 0;
    }

    // Game_Actor.prototype.attackAnimationId1
    public attackAnimationId(): number {
        return this.bareHandsAnimationId();
    }
    
    // Game_Actor.prototype.bareHandsAnimationId
    public bareHandsAnimationId(): number {
        return 1;
    }

    //------------------------------------------------------------

    
    gainExp(exp: number): void {
    }
    
    onCollectEffector(owner: LEntity, data: SEffectorFact): void {
    }
    
    onRefreshConditions(): void {
        this.refresh();
    }
    
    onStepEnd(context: SCommandContext): REResponse {
        const entity = this.ownerEntity();
        if (this.isDeathStateAffected()) {
            context.postSequel(entity, RESystem.sequels.CollapseSequel);
            
            if (entity.isUnique()) {
                if (entity == REGame.camera.focusedEntity()) {
                    context.postWait(entity, 100);
                    context.postWaitSequel();   // ゲームオーバー時の遷移で、"倒れた" メッセージの後に Wait が動くようにしたい
                    UTransfer.exitLand(context, entity, LandExitResult.Gameover);
                }
                else {
                    // 仲間等
                    throw new Error("Not implemented.");
                }
            }
            else {
    
                context.postDestroy(entity);
            }
        }
        
        return REResponse.Pass;
    }



}

