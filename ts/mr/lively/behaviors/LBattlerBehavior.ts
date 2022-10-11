import { LandExitResult } from "ts/mr/data/MRData";
import { MRLively } from "../MRLively";
import { LBehavior, LGenerateDropItemCause } from "ts/mr/lively/behaviors/LBehavior";
import { LEntity } from "../LEntity";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UTransfer } from "ts/mr/utility/UTransfer";
import { LParamSet } from "../LParam";
import { SEffectorFact } from "ts/mr/system/SEffectApplyer";
import { UAction } from "ts/mr/utility/UAction";
import { MRSerializable } from "ts/mr/Common";
import { LReaction } from "../LCommon";

@MRSerializable
export class LBattlerBehavior extends LBehavior {

    /*
    [2021/12/14] レベルと経験値はパラメータ扱いしたほうがよい？
    ----------
    パラメータ扱いしておくと、レベルダウンや経験値取得の効果をパラメータダメージとして指定できるようになる。
    レベル吸収とかも。

    バフああんまりつけたくないかも？
    一時的にレベルアップ・レベルダウンといった効果は確かに原作でもあるが…。
    でも本当にそれらを実装するとなったら、バフ扱いの方が都合がよい。

    Enemy,Actor というくくりにするよりは、
    "経験値でレベルアップするBehavior", "経験値関係なくレベルアップするBehavior" に分ける方が自然かも。
    そう考えると、Levelのバフは欲しいかもだけどExpのバフはさすがにいらないかも？
    いやでも経験値ダメージはありえるか…。

    */

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
        params.acquireParam(MRBasics.params.hp);
        params.acquireParam(MRBasics.params.mp);
        params.acquireParam(MRBasics.params.atk);
        params.acquireParam(MRBasics.params.def);
        params.acquireParam(MRBasics.params.mat);
        params.acquireParam(MRBasics.params.mdf);
        params.acquireParam(MRBasics.params.agi);
        params.acquireParam(MRBasics.params.luk);
        params.acquireParam(MRBasics.params.tp);
        params.acquireParam(MRBasics.params.fp);
        params.acquireParam(MRBasics.params.pow);
    }
    
    onQueryReactions(self: LEntity, reactions: LReaction[]): void {
        // 敵味方を問わず、話しかけることは可能。
        reactions.push({ actionId: MRBasics.actions.talk });
    }


    // Game_BattlerBase.prototype.isGuard 
    public isGuard(): boolean {
        return false;
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

    onCollectEffector(owner: LEntity, data: SEffectorFact): void {
    }
    
    onPermanentDeath(self: LEntity, cctx: SCommandContext): SCommandResponse {
        const entity = this.ownerEntity();
        if (entity.isUnique()) {
            if (entity == MRLively.camera.focusedEntity()) {
                cctx.postSequel(entity, MRBasics.sequels.CollapseSequel);
                cctx.postWait(entity, 100);
                cctx.postWaitSequel();   // ゲームオーバー時の遷移で、"倒れた" メッセージの後に Wait が動くようにしたい
                
                UAction.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
                UTransfer.exitLand(cctx, entity, LandExitResult.Gameover);
            }
            else {
                // 仲間等
                throw new Error("Not implemented.");
            }
            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }



}

