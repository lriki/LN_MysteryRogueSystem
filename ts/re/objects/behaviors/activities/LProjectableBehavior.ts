import { assert } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { BlockLayerKind } from "ts/re/objects/LBlockLayer";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { Helpers } from "ts/re/system/Helpers";
import { REResponse } from "ts/re/system/RECommand";
import { SEffectContext, SEffectIncidentType, SEffectSubject } from "ts/re/system/SEffectContext";
import { RESystem } from "ts/re/system/RESystem";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onCollidePreReaction, onMoveAsProjectile, onThrowReaction } from "../LBehavior";
import { MovingMethod } from "ts/re/objects/LMap";
import { UAction } from "ts/re/usecases/UAction";
import { DEffect } from "ts/re/data/DEffect";
import { REData } from "ts/re/data/REData";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";

/**
 * 投射可能であるか。従来の Throwable の拡張。
 * 
 * それは、
 * - 直線状に投げることができる。
 * - 吹き飛ばすことができる。
 * - 別の Unit に衝突することができる。
 * - 自然落下することができる。
 * - 壁に当たって落下することができる。
 */
export class LProjectableBehavior extends LBehavior {
    
    blowDirection: number = 0;      // 吹き飛ばし方向
    blowMoveCount: number = 0;      // 吹き飛ばし移動数
    //blowMoveCountMax: number = 0;      // 吹き飛ばし移動数
    private _effect: DEffect | undefined;
    //private _effectSubject: LEntityId | undefined;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LProjectableBehavior);
        b.blowDirection = this.blowDirection;
        b.blowMoveCount = this.blowMoveCount;
        return b
    }

    public static startMoveAsProjectile(context: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, distance: number): void {
        const common = entity.findEntityBehavior(LProjectableBehavior);
        assert(common);

        // 普通のアイテムは吹き飛ばし扱いで移動開始
        common.blowDirection = dir;
        common.blowMoveCount = distance;
        //common.blowMoveCountMax = distance;
        
        //entity.dir = args.sender.dir;

        entity.addState(REData.getStateFuzzy("kSystemState_Projectile").id, false);
        
        context.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }
    
    public static startMoveAsEffectProjectile(context: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, length: number, effect: DEffect): void {
        const common = entity.findEntityBehavior(LProjectableBehavior);
        assert(common);

        common._effect = effect;
        common.blowDirection = dir;
        common.blowMoveCount = length;
        
        entity.addState(REData.getStateFuzzy("kSystemState_Projectile").id, false);
        
        context.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }


    private clearKnockback(): void {
        this.blowDirection = 0;
        this.blowMoveCount = 0;
    }


    
    onQueryReactions(actions: DActionId[]): void {
        actions.push(DBasics.actions.ThrowActionId);
    }

    onActivity(self: LEntity, context: SCommandContext, activity: LActivity): REResponse {
        

        return REResponse.Pass;
    }

    
    // 投げられた
    [onThrowReaction](args: CommandArgs, context: SCommandContext): REResponse {

        const self = args.self;

        REGame.map.appearEntity(self, self.x, self.y, BlockLayerKind.Projectile);


        LProjectableBehavior.startMoveAsProjectile(context, self, args.subject, args.sender.dir, 5);

        
        return REResponse.Pass;
    }
    
    // Projectile として移動
    [onMoveAsProjectile](args: CommandArgs, context: SCommandContext): REResponse {
        const self = args.self;
        
        const common = self.findEntityBehavior(LProjectableBehavior);
        assert(common);
        assert(this.blowDirection != 0);
        

        //const args = (cmd.args() as REMoveToAdjacentArgs);
        const offset = Helpers.dirToTileOffset(this.blowDirection);
        const tx = self.x + offset.x;
        const ty = self.y + offset.y;

        self.dir = this.blowDirection;


        if (UMovement.moveEntity(self, tx, ty, MovingMethod.Projectile, BlockLayerKind.Projectile)) {
            context.postSequel(self, RESystem.sequels.blowMoveSequel);
            
            common.blowMoveCount--;


            

            // 他 Unit との衝突判定
            const hitTarget = REGame.map.block(tx, ty).aliveEntity(BlockLayerKind.Unit);
            if (hitTarget) {
                context.post(
                    hitTarget, self, args.subject, undefined, onCollidePreReaction,
                    () => {
                        const args2: CollideActionArgs = {
                            dir: common.blowDirection,
                        };
                        context.post(self, hitTarget, args.subject, args2, onCollideAction, () => {
                            return true;
                        });
                        return true;
                    });

                return REResponse.Succeeded;
            }
        


        
            if (common.blowMoveCount <= 0) {
                this.endMoving(context ,self);
            }
            else {
                context.post(self, self, args.subject, undefined, onMoveAsProjectile);
            }
                
            return REResponse.Succeeded;
        }
        else {
            this.endMoving(context ,self);
        }

        return REResponse.Pass;
    }
    
    [onCollideAction](args: CommandArgs, context: SCommandContext): REResponse {
        if (this._effect) {
            const self = args.self;
            const target = args.sender;
            const subject = args.subject;

            context.postDestroy(self);
            //this.applyEffect(context, self, args.sender, args.subject, DEffectCause.Affect);
            
            const animationId = 1;  // TODO:

            const effectSubject = new SEffectorFact(subject.entity(), this._effect, SEffectIncidentType.IndirectAttack, this.blowDirection);
            const effectContext = new SEffectContext(effectSubject, context.random());
    
            context.postAnimation(target, animationId, true);
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            context.postCall(() => {
                effectContext.applyWithWorth(context, [target]);
            });
            
            return REResponse.Succeeded;
        }
        else {

            return REResponse.Pass;
        }
    }

    private endMoving(context: SCommandContext, self: LEntity): void {
        this.clearKnockback();

        
        self.removeState(REData.getStateFuzzy("kSystemState_Projectile").id);

        UAction.postStepOnGround(context, self);

        // TODO: 落下先に罠があるときは、postStepOnGround と postDropToGroundOrDestroy の間でここで罠の処理を行いたい。
        // 木の矢の罠の上にアイテムを落としたとき、矢の移動処理・攻撃判定が終わった後に、罠上に落ちたアイテムの drop の処理が行われる。

        context.postCall(() => {
            UAction.postDropOrDestroy(context, self, self.getHomeLayer(), this.blowDirection);
        });

        // HomeLayer へ移動
        //SMovementCommon.locateEntity(self, self.x, self.y);
        //context.postSequel(self, RESystem.sequels.dropSequel, { movingDir: this.blowDirection });
        //this.clearKnockback();
        // TODO: 落下
        //SActionCommon.postStepOnGround(context, self);
    }
}
