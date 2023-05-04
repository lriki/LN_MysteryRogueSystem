import { assert, MRSerializable } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { LEntity } from "ts/mr/lively/entity/LEntity";
import { MRLively } from "ts/mr/lively/MRLively";
import { Helpers } from "ts/mr/system/Helpers";
import { SCommandResponse, SEndProjectileMovingCause, SEndProjectileMovingCommand, SItemReactionCommand } from "ts/mr/system/SCommand";
import { SEffectContext, SEffectIncidentType, SEffectSubject } from "ts/mr/system/SEffectContext";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UMovement } from "ts/mr/utility/UMovement";
import { CommandArgs, LBehavior, onMoveAsProjectile, onThrowReaction } from "../LBehavior";
import { MovingMethod } from "ts/mr/lively/LMap";
import { UAction } from "ts/mr/utility/UAction";
import { MRData } from "ts/mr/data/MRData";
import { SEffectorFact } from "ts/mr/system/SEffectApplyer";
import { DEffectHitType } from "ts/mr/data/DEffect";
import { DBlockLayerKind, DEmittorId } from "ts/mr/data/DCommon";
import { SActionHitTest } from "ts/mr/system/SActionHitTest";
import { paramThrowingDistance } from "ts/mr/PluginParameters";
import { DEmittor } from "ts/mr/data/DEmittor";
import { LReaction } from "../../LCommon";
import { DEffectSuite } from "ts/mr/data/DEffectSuite";

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
@MRSerializable
export class LProjectileBehavior extends LBehavior {
    
    blowDirection: number = 0;      // 吹き飛ばし方向
    blowMoveCount: number = 0;      // 吹き飛ばし移動数
    //blowMoveCountMax: number = 0;      // 吹き飛ばし移動数
    private _effectSet: DEmittorId = 0;
    //private _effectSubject: LEntityId | undefined;
    private _penetration: boolean = false;

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LProjectileBehavior);
        b.blowDirection = this.blowDirection;
        b.blowMoveCount = this.blowMoveCount;
        return b;
    }

    // こちらはアイテムが投げられたとき。
    public static startMoveAsProjectile(cctx: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, distance: number): void {
        const common = entity.findEntityBehavior(LProjectileBehavior);
        assert(common);

        // 普通のアイテムは吹き飛ばし扱いで移動開始
        common.blowDirection = dir;
        common.blowMoveCount = distance;
        //common.blowMoveCountMax = distance;
        
        //entity.dir = args.sender.dir;

        common._penetration = entity.hasTrait(MRBasics.traits.PenetrationItem);
        if (!common._penetration) {
            common._penetration = subject.entity().hasTrait(MRBasics.traits.PenetrationThrower);
        }

        if (common._penetration) {
            common.blowMoveCount = Infinity;
        }

        entity.addState(MRData.getState("kState_System_Projectile").id, false);
        
        cctx.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }
    
    // こちらは飛び道具効果のあるスキル（ブレスや魔法弾）
    public static startMoveAsEffectProjectile(cctx: SCommandContext, entity: LEntity, subject: SEffectSubject, dir: number, length: number, effectSet: DEmittor): void {
        const common = entity.findEntityBehavior(LProjectileBehavior);
        assert(common);

        common._effectSet = effectSet.id;
        common.blowDirection = dir;
        common.blowMoveCount = length;
        
        entity.addState(MRData.getState("kState_System_Projectile").id, false);
        
        cctx.post(entity, entity, subject, undefined, onMoveAsProjectile);
    }


    private clearKnockback(): void {
        this.blowDirection = 0;
        this.blowMoveCount = 0;
    }

    private hitType(): DEffectHitType {
        if (this._effectSet) return this.effectSet.hitType();
        return DEffectHitType.Certain;
    }

    private get effectSet(): DEffectSuite {
        assert(this._effectSet);
        return MRData.emittors[this._effectSet].effectSuite;
    }

    
    onQueryReactions(self: LEntity, reactions: LReaction[]): void {
        reactions.push({ actionId: MRBasics.actions.ThrowActionId });
    }
    
    // 投げられた
    [onThrowReaction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {

        const self = args.self;

        MRLively.mapView.currentMap.appearEntity(self, self.mx, self.my, DBlockLayerKind.Projectile);


        LProjectileBehavior.startMoveAsProjectile(cctx, self, args.subject, args.sender.dir, paramThrowingDistance);

        
        return SCommandResponse.Pass;
    }
    
    // Projectile として移動
    [onMoveAsProjectile](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;
        
        const common = self.findEntityBehavior(LProjectileBehavior);
        assert(common);
        assert(this.blowDirection != 0);
        

        //const args = (cmd.args() as REMoveToAdjacentArgs);
        const offset = Helpers.dirToTileOffset(this.blowDirection);
        const tx = self.mx + offset.x;
        const ty = self.my + offset.y;


        self.dir = this.blowDirection;



        if (UMovement.moveEntity(cctx, self, tx, ty, this._penetration ? MovingMethod.Penetration : MovingMethod.Projectile, DBlockLayerKind.Projectile)) {
            cctx.postSequel(self, MRBasics.sequels.blowMoveSequel);
            
            common.blowMoveCount--;

            const subject = args.subject.entity();//activity.subject();

            if (this._penetration) {
                this.processEffectForPenetration(cctx, self, tx, ty, args.subject);
            }
            else {
                this.processEffectForNormal(cctx, self, tx, ty, args.subject);
            }

            
            return SCommandResponse.Handled;
        }
        else {
            // 移動できなかったら終了。
            // 遠投の場合もここに来る。
            this.endMoving(cctx ,self, SEndProjectileMovingCause.NoPassage);
        }

        return SCommandResponse.Pass;
    }
    
    // [onCollideAction](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
    //     throw new Error("deprecated.");
    //     /*
    //     if (this._effectSet) {
    //         const self = args.self;
    //         const target = args.sender;
    //         const subject = args.subject;

    //         cctx.postDestroy(self);
    //         //this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Affect);
            
    //         const animationId = 1;  // TODO:

    //         const effectSubject = new SEffectorFact(subject.entity(), this._effectSet, SEffectIncidentType.IndirectAttack, this.blowDirection);
    //         const effectContext = new SEffectContext(effectSubject, cctx.random());
    
    //         cctx.postAnimation(target, animationId, true);
    
    //         // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
    //         cctx.postCall(() => {
    //             effectContext.applyWithWorth(cctx, [target]);
    //         });
            
    //         return SCommandResponse.Handled;
    //     }
    //     else {

    //         return SCommandResponse.Pass;
    //     }
    //     */
    // }

    private processEffectForNormal(cctx: SCommandContext, self: LEntity, x: number, y: number, subject: SEffectSubject): void {

        // 他 Unit との衝突判定
        const hitTarget = MRLively.mapView.currentMap.block(x, y).aliveEntity(DBlockLayerKind.Unit);
        if (hitTarget) {
            if (hitTarget.hasTrait(MRBasics.traits.PhysicalProjectileReflector)) {
                // 跳ね返し
                this.blowDirection = UMovement.reverseDir(this.blowDirection);
                this.blowMoveCount++; // 水晶オブジェクトの下に落ちても困るので、移動数を+1
                cctx.postAnimation(hitTarget, 2, false);
            }
            else if (!SActionHitTest.testProjectle(subject.entity(), self, hitTarget, this.hitType(), cctx.random())) {
                // 当たらなかった
                this.endMoving(cctx, self, SEndProjectileMovingCause.Fall);
                return;
            }
            else if (this._effectSet) {
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

                cctx.postDestroy(self);
                //this.applyEffect(cctx, self, args.sender, args.subject, DEffectCause.Affect);
                

                const effectSubject = new SEffectorFact(subject.entity(), this.effectSet, SEffectIncidentType.IndirectAttack, this.blowDirection);
                const effectContext = new SEffectContext(effectSubject, cctx.random());
        
        
                // アニメーションを Wait してから効果を発動したいので、ここでは post が必要。
                cctx.postCall(() => {
                    effectContext.applyWithWorth(cctx, [target]);
                });
                
                return;
            }
            else {
                cctx.postCommandTask(new SItemReactionCommand(
                    MRBasics.actions.collide, self, hitTarget, [], subject.entity(), this.blowDirection));
                return;
            }
        }
    
        if (this.blowMoveCount <= 0) {
            this.endMoving(cctx, self, SEndProjectileMovingCause.Fall);
        }
        else {
            cctx.post(self, self, subject, undefined, onMoveAsProjectile);
        }
    }

    private processEffectForPenetration(cctx: SCommandContext, self: LEntity, x: number, y: number, subject: SEffectSubject): void {
        assert(this._penetration);

        // 他 Unit との衝突判定
        const hitTarget = MRLively.mapView.currentMap.block(x, y).aliveEntity(DBlockLayerKind.Unit);
        if (hitTarget) {
            if (!SActionHitTest.testProjectle(subject.entity(), self, hitTarget, this.hitType(), cctx.random())) {
                // 当たらなかった。貫通なので移動は続行する。
            }
            else if (this._effectSet) {
                throw new Error("Not implemented.");
            }
            else {
                cctx.postEmitEffect(self, MRBasics.actions.collide, subject.entity(), hitTarget, this.blowDirection);
            }
        }
    
        cctx.post(self, self, subject, undefined, onMoveAsProjectile);

        /*
        遠投状態の場合当たっても削除しないが、そもそも Projectile の削除はどちらで行うべき？
        ----------
        ItemBehavior 側の方が自然なことが多いかも？
        例えば回数制限のある "読む" を考えると、この消滅は Item 側で行うべき。
        
        今のところは 遠投くらいしか判断することが無いのでどちらでもよいのか？
        ひま投げ等関係なく、普通に投げられたとき、ぶつかっても消滅しないアイテムはあるか？
        → 原作では多分無い。

        ひま投げと絡めて考えると、PenetrationItem であっても、ひま投げされたときは貫通しない。(つまり、普通に消滅する)
        もし
        - ひま投げも collide を発動する。（これは自然）
        - 普通の投げで消滅する・しないを ItemBehavior 側でコントロールする。
        とした場合、 ItemBehavior はひま投げが原因かどうかを知らなければならない。これはどちらかというとよろしくない。

        一方、マゼルン系は、collide を受けた時、その Projectile が Penetration であるかは知れないとダメ。

        遠投ねだやしの動きは参考になりそう？
        遠投は基本的に、マップ端までにヒットした Uint を一度リストに覚えておき、
        遠投移動終了時に全部処理を行う。
        この時、このすべての Unit に対して、collide Activity を実行することになる。

        …でもそう考えると、これは Activity にするべきではないかもしれない。
        マゼルンは、Collide Activity をキャンセルすることでアイテムを飲み込む。
        遠投状態で Collide Activity を送ってしまうと、貫通したのに飲み込まれたりする。
        

        */
    }

    private endMoving(cctx: SCommandContext, self: LEntity, cause: SEndProjectileMovingCause): void {
        this.clearKnockback();

        const entityData = self.data;

        // 表示変更用のステート解除
        self.removeState(MRData.getState("kState_System_Projectile").id);

        cctx.postCommandTask(new SEndProjectileMovingCommand(self, cause))
        .then2(c => {
        
            /*
            矢ワナは効果のオーバーライドがあるので startMoveAsEffectProjectile で開始する。
            しかしこれで開始した場合、end 時に entity が消滅する。
    
            揮発性かどうかを属性として持たせたいが、次のどちらにするべきか？
            - Entity側に持たせる
            - Effect側に持たせる
    
            Entity側に持たせるのが無難かも。
            指定し忘れで魔法弾が地面に落ちてしまうようなことも無いだろう。
            */
            if (entityData.volatilityProjectile || this._penetration) {
                cctx.postDestroy(self);
            }
            else {
    
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
        })
        
    }
}

