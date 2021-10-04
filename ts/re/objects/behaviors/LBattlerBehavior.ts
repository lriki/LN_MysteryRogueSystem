import { DState, DStateId, DStateRestriction } from "ts/re/data/DState";
import { LandExitResult, REData } from "ts/re/data/REData";
import { REGame } from "../REGame";
import { LBehavior, LGenerateDropItemCause } from "ts/re/objects/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { RESystem } from "ts/re/system/RESystem";
import { DBasics } from "ts/re/data/DBasics";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { LParamSet } from "../LParam";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DActionId } from "ts/re/data/DAction";
import { UAction } from "ts/re/usecases/UAction";

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

    onAttached(self: LEntity): void {
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
    
    onQueryReactions(actions: DActionId[]): void {
        // 敵味方を問わず、話しかけることは可能。
        actions.push(DBasics.actions.talk);
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
    
    // Game_BattlerBase.prototype.recoverAll
    public recoverAll(): void {
        this.clearStates();
        this.paramSet().params().forEach(x => x?.clearDamage());
        //for (let paramId = 0; paramId < REData.parameters.length; paramId++) {

        //    this._actualParamDamges[paramId] = 0;
        //}
    };

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
    
    onStepEnd(context: SCommandContext): SCommandResponse {
        const entity = this.ownerEntity();
        if (entity.isDeathStateAffected()) {
            context.postSequel(entity, DBasics.sequels.CollapseSequel);
            
            if (entity.isUnique()) {
                if (entity == REGame.camera.focusedEntity()) {
                    context.postWait(entity, 100);
                    context.postWaitSequel();   // ゲームオーバー時の遷移で、"倒れた" メッセージの後に Wait が動くようにしたい
                    
                    UAction.postDropItems(context, entity, LGenerateDropItemCause.Dead);
                    context.postCall(() => {
                        entity.iterateBehaviorsReverse(b => {
                            b.onPermanentDeath(context, entity);
                            return true;
                        });
                    });

                    UTransfer.exitLand(context, entity, LandExitResult.Gameover);
                }
                else {
                    // 仲間等
                    throw new Error("Not implemented.");
                }
            }
            else {
                UAction.postDropItems(context, entity, LGenerateDropItemCause.Dead);
                context.postCall(() => {
                    entity.iterateBehaviorsReverse(b => {
                        b.onPermanentDeath(context, entity);
                        return true;
                    });
                })
                context.postDestroy(entity);
            }
        }
        
        return SCommandResponse.Pass;
    }



}

