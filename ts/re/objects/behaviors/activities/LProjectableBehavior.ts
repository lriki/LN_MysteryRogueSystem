import { assert, RESerializable } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LEntity } from "ts/re/objects/LEntity";
import { REGame } from "ts/re/objects/REGame";
import { Helpers } from "ts/re/system/Helpers";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SEffectContext, SEffectIncidentType, SEffectSubject } from "ts/re/system/SEffectContext";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UMovement } from "ts/re/usecases/UMovement";
import { CollideActionArgs, CommandArgs, LBehavior, onCollideAction, onCollidePreReaction, onMoveAsProjectile, onThrowReaction } from "../LBehavior";
import { MovingMethod } from "ts/re/objects/LMap";
import { UAction } from "ts/re/usecases/UAction";
import { REData } from "ts/re/data/REData";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DEffectSet } from "ts/re/data/DEffect";
import { DBlockLayerKind } from "ts/re/data/DCommon";

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
@RESerializable
export class LProjectableBehavior extends LBehavior {
    
    blowDirection: number = 0;      // 吹き飛ばし方向
    blowMoveCount: number = 0;      // 吹き飛ばし移動数
    //blowMoveCountMax: number = 0;      // 吹き飛ばし移動数
    private _effectSet: DEffectSet | undefined;
    //private _effectSubject: LEntityId | undefined;

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LProjectableBehavior);
        b.blowDirection = this.blowDirection;
        b.blowMoveCount = this.blowMoveCount;
        return b
    }

    // こちらはアイテムが投げられたとき。
    public static startMoveAsProjectile(cctx: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, distance: number): void {
        const common = entity.findEntityBehavior(LProjectableBehavior);
        assert(common);

        // 普通のアイテムは吹き飛ばし扱いで移動開始
        common.blowDirection = dir;
        common.blowMoveCount = distance;
        //common.blowMoveCountMax = distance;
        
        //entity.dir = args.sender.dir;

        entity.addState(REData.getState("kSystemState_Projectile").id, false);
        
        cctx.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }
    
    // こちらは飛び道具効果のあるスキル（ブレスや魔法弾）
    public static startMoveAsEffectProjectile(cctx: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, length: number, effectSet: DEffectSet): void {
        const common = entity.findEntityBehavior(LProjectableBehavior);
        assert(common);

        common._effectSet = effectSet;
        common.blowDirection = dir;
        common.blowMoveCount = length;
        
        entity.addState(REData.getState("kSystemState_Projectile").id, false);
        
        cctx.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }


    private clearKnockback(): void {
        this.blowDirection = 0;
        this.blowMoveCount = 0;
    }


    
    onQueryReactions(actions: DActionId[]): void {
        actions.push(REBasics.actions.ThrowActionId);
    }

    // onActivity(self: LEntity, cctx: SCommandContext, activity: LActivity): SCommandResponse {
        
    //     if (activity.actionId() == REBasics.actions.collide) {
            
    //         if (this._effectSet) {
    //             // スキルや魔法弾

    //             const target = activity.objects2()[0];
    //             const subject = activity.subject();

    //             cctx.postDestroy(self);
    //             //this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Affect);
                
    //             const animationId = 1;  // TODO:

    //             const effectSubject = new SEffectorFact(subject, this._effectSet, SEffectIncidentType.IndirectAttack, this.blowDirection);
    //             const effectContext = new SEffectContext(effectSubject, cctx.random());
        
    //             cctx.postAnimation(target, animationId, true);
        
    //             // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
    //             cctx.postCall(() => {
    //                 effectContext.applyWithWorth(cctx, [target]);
    //             });
                
    //             return SCommandResponse.Handled;
    //         }
            
    //     }

    //     return SCommandResponse.Pass;
    // }

    
    // 投げられた
    [onThrowReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {

        const self = args.self;

        REGame.map.appearEntity(self, self.x, self.y, DBlockLayerKind.Projectile);


        LProjectableBehavior.startMoveAsProjectile(cctx, self, args.subject, args.sender.dir, 5);

        
        return SCommandResponse.Pass;
    }
    
    // Projectile として移動
    [onMoveAsProjectile](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        
        const common = self.findEntityBehavior(LProjectableBehavior);
        assert(common);
        assert(this.blowDirection != 0);
        

        //const args = (cmd.args() as REMoveToAdjacentArgs);
        const offset = Helpers.dirToTileOffset(this.blowDirection);
        const tx = self.x + offset.x;
        const ty = self.y + offset.y;


        self.dir = this.blowDirection;


        if (UMovement.moveEntity(cctx, self, tx, ty, MovingMethod.Projectile, DBlockLayerKind.Projectile)) {
            cctx.postSequel(self, REBasics.sequels.blowMoveSequel);
            
            common.blowMoveCount--;


            

            // 他 Unit との衝突判定
            const hitTarget = REGame.map.block(tx, ty).aliveEntity(DBlockLayerKind.Unit);
            if (hitTarget) {

                
                if (this._effectSet) {
                    // スキルや魔法弾
                    //
                    // v0.4.0 時点ではこの if の else 側から投げられる CollideActivity を LProjectableBehavior(self) の onActivity で受けて処理をしていた。
                    // しかしワナを実装するにあたり、Projectile が ItemBehavior も兼ねるケースが出てきた。
                    // そのままだと ItemBehavior.onActivity の Collide ハンドラに流れてしまい優先 Effect が適用できないので、
                    // 優先 Effect を持っている場合はここで直に処理してしまう。
                    //
                    // ちなみに矢の罠が出す Projectile を、木の矢アイテムではなくワナ専用の Entity を使う案もあったが、
                    // 次のような理由で木の矢アイテムを直接飛ばしている。
                    // - 外れて落下するときに新たに Entity を生成するのが若干煩雑だった
                    // - 矢弾をキャッチしてインベントリに加える(マゼルン系)実装で都合が悪い

                    const target = hitTarget;//activity.objects2()[0];
                    const subject = args.subject.entity();//activity.subject();

                    cctx.postDestroy(self);
                    //this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Affect);
                    
                    const animationId = 1;  // TODO:

                    const effectSubject = new SEffectorFact(subject, this._effectSet, SEffectIncidentType.IndirectAttack, this.blowDirection);
                    const effectContext = new SEffectContext(effectSubject, cctx.random());
            
                    cctx.postAnimation(target, animationId, true);
            
                    // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
                    cctx.postCall(() => {
                        effectContext.applyWithWorth(cctx, [target]);
                    });
                    
                    return SCommandResponse.Handled;
                }
                else {
                    cctx.postActivity(LActivity.makeCollide(self, hitTarget)
                        .withOtherSubject(args.subject.entity())
                        .withEffectDirection(common.blowDirection));
                }
                /*
                cctx.post(
                    hitTarget, self, args.subject, undefined, onCollidePreReaction,
                    () => {
                        const args2: CollideActionArgs = {
                            dir: common.blowDirection,
                        };
                        cctx.post(self, hitTarget, args.subject, args2, onCollideAction, () => {
                            return true;
                        });
                        return true;
                    });
                    */

                return SCommandResponse.Handled;
            }
        


        
            if (common.blowMoveCount <= 0) {
                this.endMoving(cctx ,self);
            }
            else {
                cctx.post(self, self, args.subject, undefined, onMoveAsProjectile);
            }
                
            return SCommandResponse.Handled;
        }
        else {
            this.endMoving(cctx ,self);
        }

        return SCommandResponse.Pass;
    }
    
    [onCollideAction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        throw new Error("deprecated.");
        /*
        if (this._effectSet) {
            const self = args.self;
            const target = args.sender;
            const subject = args.subject;

            cctx.postDestroy(self);
            //this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Affect);
            
            const animationId = 1;  // TODO:

            const effectSubject = new SEffectorFact(subject.entity(), this._effectSet, SEffectIncidentType.IndirectAttack, this.blowDirection);
            const effectContext = new SEffectContext(effectSubject, cctx.random());
    
            cctx.postAnimation(target, animationId, true);
    
            // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
            cctx.postCall(() => {
                effectContext.applyWithWorth(cctx, [target]);
            });
            
            return SCommandResponse.Handled;
        }
        else {

            return SCommandResponse.Pass;
        }
        */
    }

    private endMoving(cctx: SCommandContext, self: LEntity): void {
        this.clearKnockback();

        const entityData = self.data();

        /*
        矢ワナは効果のオーバーライドがあるので startMoveAsEffectProjectile で開始する。
        しかしこれで開始した場合、end 時に entity が消滅する。

        揮発性かどうかを属性として持たせたいが、次のどちらにするべきか？
        - Entity側に持たせる
        - Effect側に持たせる

        Entity側に持たせるのが無難かも。
        指定し忘れで魔法弾が地面に落ちてしまうようなことも無いだろう。
        */
        if (entityData.volatilityProjectile/*this._effectSet*/) {
            cctx.postDestroy(self);
        }
        else {
            // 表示変更用のステート解除
            self.removeState(REData.getState("kSystemState_Projectile").id);

            UAction.postFall(cctx, self);
    
            /*

            UAction.postStepOnGround(cctx, self);
    
            // TODO: 落下先に罠があるときは、postStepOnGround と postDropToGroundOrDestroy の間でここで罠の処理を行いたい。
            // 木の矢の罠の上にアイテムを落としたとき、矢の移動処理・攻撃判定が終わった後に、罠上に落ちたアイテムの drop の処理が行われる。
    
            cctx.postCall(() => {
                UAction.postDropOrDestroyOnCurrentPos(cctx, self, self.getHomeLayer());
            });
    
            // HomeLayer へ移動
            //SMovementCommon.locateEntity(self, self.x, self.y);
            //cctx.postSequel(self, RESystem.sequels.dropSequel, { movingDir: this.blowDirection });
            //this.clearKnockback();
            // TODO: 落下
            //SActionCommon.postStepOnGround(cctx, self);
            */
        }
        
    }
}

