import { DState, DStateId, DStateRestriction } from "ts/re/data/DState";
import { LandExitResult, REData } from "ts/re/data/REData";
import { REGame } from "../REGame";
import { LBehavior, LGenerateDropItemCause } from "ts/re/objects/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { RESystem } from "ts/re/system/RESystem";
import { REBasics } from "ts/re/data/REBasics";
import { UTransfer } from "ts/re/usecases/UTransfer";
import { LParamSet } from "../LParam";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DActionId } from "ts/re/data/DAction";
import { UAction } from "ts/re/usecases/UAction";
import { SStepPhase } from "ts/re/system/SCommon";

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
        params.acquireParam(REBasics.params.hp);
        params.acquireParam(REBasics.params.mp);
        params.acquireParam(REBasics.params.atk);
        params.acquireParam(REBasics.params.def);
        params.acquireParam(REBasics.params.mat);
        params.acquireParam(REBasics.params.mdf);
        params.acquireParam(REBasics.params.agi);
        params.acquireParam(REBasics.params.luk);
        params.acquireParam(REBasics.params.tp);
        params.acquireParam(REBasics.params.fp);
        params.acquireParam(REBasics.params.pow);
    }
    
    onQueryReactions(actions: DActionId[]): void {
        // 敵味方を問わず、話しかけることは可能。
        actions.push(REBasics.actions.talk);
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

    public changeLevel(value: number, keepExpWhenDown: boolean): void {
        throw new Error("Unreachable.");
    }

    public level(): number {
        throw new Error("Unreachable.");
    }
    
    gainExp(exp: number): void {
    }
    
    onCollectEffector(owner: LEntity, data: SEffectorFact): void {
    }
    
    onStabilizeSituation(self: LEntity, cctx: SCommandContext): SCommandResponse {
        const entity = this.ownerEntity();
        if (entity.isDeathStateAffected()) {
            cctx.postSequel(entity, REBasics.sequels.CollapseSequel);
            
            if (entity.isUnique()) {
                if (entity == REGame.camera.focusedEntity()) {
                    cctx.postWait(entity, 100);
                    cctx.postWaitSequel();   // ゲームオーバー時の遷移で、"倒れた" メッセージの後に Wait が動くようにしたい
                    
                    UAction.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
                    cctx.postCall(() => {
                        entity.iterateBehaviorsReverse(b => {
                            b.onPermanentDeath(cctx, entity);
                            return true;
                        });
                    });

                    UTransfer.exitLand(cctx, entity, LandExitResult.Gameover);
                }
                else {
                    // 仲間等
                    throw new Error("Not implemented.");
                }
            }
            else {
                UAction.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
                cctx.postCall(() => {
                    entity.iterateBehaviorsReverse(b => {
                        b.onPermanentDeath(cctx, entity);
                        return true;
                    });
                })
                cctx.postDestroy(entity);
            }
            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }



}

