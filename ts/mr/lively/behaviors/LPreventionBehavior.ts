import { MRSerializable, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SCommandResponse } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { UName } from "ts/mr/utility/UName";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { LBehavior, SRejectionInfo } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LStumblePreventionBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LStumblePreventionBehavior);
        return b
    }

    onPreviewRejection(self: LEntity, cctx: SCommandContext, rejection: SRejectionInfo): SCommandResponse {
        if (rejection.kind == "Effect") {
            // Effect の発動自体を防ぎたい。
            // もし EffectBehavior だけでガードすると、転び石のダメージは防げない。
            if (rejection.effect.sourceKey == "kEntity_転び石_A") {
                return this.rejectStumble(cctx, self);
            }
        }
        else if (rejection.kind == "EffectBehavior") {
            if (rejection.id == MRBasics.effectBehaviors.stumble) {
                return this.rejectStumble(cctx, self);
            }
        }
        return SCommandResponse.Pass;
    }

    private rejectStumble(cctx: SCommandContext, self: LEntity): SCommandResponse {
        if (self.actualParam(MRBasics.params.remaining) > 0) {
            cctx.postMessage(tr2("%1の効果で転ばなかった。").format(UName.makeNameAsItem(self)));

            // 使用回数を減らして効果を防止する
            self.gainActualParam(MRBasics.params.remaining, -1, true);
            return SCommandResponse.Canceled;
        }
        return SCommandResponse.Pass;
    }

    // onPreviewEffectRejection(cctx: SCommandContext, self: LEntity, effect: DEffect): SCommandResponse {

    //     if (effect.sourceKey == "kEntity_転び石_A") {
    //         if (self.actualParam(REBasics.params.remaining) > 0) {
    //             // 使用回数を減らして効果を防止する
    //             self.gainActualParam(REBasics.params.remaining, -1);
    //             return SCommandResponse.Canceled;
    //         }
    //     }

    //     return SCommandResponse.Pass;
    // }

    // onPreviewEffectBehaviorRejection(cctx: SCommandContext, self: LEntity, id: DEffectBehaviorId): SCommandResponse {

    //     if (id == REBasics.effectBehaviors.stumble) {
    //         if (self.actualParam(REBasics.params.remaining) > 0) {
    //             // 使用回数を減らして効果を防止する
    //             self.gainActualParam(REBasics.params.remaining, -1);
    //             return SCommandResponse.Canceled;
    //         }
    //     }

    //     return SCommandResponse.Pass;
    // }


    
}
