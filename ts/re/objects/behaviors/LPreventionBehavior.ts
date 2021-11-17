import { RESerializable, tr2 } from "ts/re/Common";
import { DEffectBehaviorId } from "ts/re/data/DCommon";
import { DEffect } from "ts/re/data/DEffect";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, SRejectionInfo, testPickOutItem } from "./LBehavior";

/**
 * 
 */
@RESerializable
export class LStumblePreventionBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LStumblePreventionBehavior);
        return b
    }

    onPreviewRejection(self: LEntity, cctx: SCommandContext, rejection: SRejectionInfo): SCommandResponse {
        if (rejection.kind == "Effect") {
            if (rejection.effect.sourceKey == "kItem_転び石") {
                return this.rejectStumble(cctx, self);
            }
        }
        else if (rejection.kind == "EffectBehavior") {
            if (rejection.id == REBasics.effectBehaviors.stumble) {
                return this.rejectStumble(cctx, self);
            }
        }
        return SCommandResponse.Pass;
    }

    private rejectStumble(cctx: SCommandContext, self: LEntity): SCommandResponse {
        if (self.actualParam(REBasics.params.remaining) > 0) {
            cctx.postMessage(tr2("%1の効果で転ばなかった。").format(UName.makeNameAsItem(self)));

            // 使用回数を減らして効果を防止する
            self.gainActualParam(REBasics.params.remaining, -1, true);
            return SCommandResponse.Canceled;
        }
        return SCommandResponse.Pass;
    }

    // onPreviewEffectRejection(cctx: SCommandContext, self: LEntity, effect: DEffect): SCommandResponse {

    //     if (effect.sourceKey == "kItem_転び石") {
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
