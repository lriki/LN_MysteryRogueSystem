import { RESerializable, tr2 } from "ts/re/Common";
import { DEffectBehaviorId } from "ts/re/data/DCommon";
import { DEffect } from "ts/re/data/DEffect";
import { REBasics } from "ts/re/data/REBasics";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { UName } from "ts/re/usecases/UName";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onGrounded, testPickOutItem } from "./LBehavior";

/**
 * 
 */
@RESerializable
export class LStumblePreventionBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LStumblePreventionBehavior);
        return b
    }

    onPreviewEffectRejection(context: SCommandContext, self: LEntity, effect: DEffect): SCommandResponse {

        if (effect.sourceKey == "kItem_転び石") {
            if (self.actualParam(REBasics.params.remaining) > 0) {
                // 使用回数を減らして効果を防止する
                self.gainActualParam(REBasics.params.remaining, -1);
                return SCommandResponse.Canceled;
            }
        }

        return SCommandResponse.Pass;
    }

    onPreviewEffectBehaviorRejection(context: SCommandContext, self: LEntity, id: DEffectBehaviorId): SCommandResponse {

        if (id == REBasics.effectBehaviors.stumble) {
            if (self.actualParam(REBasics.params.remaining) > 0) {
                // 使用回数を減らして効果を防止する
                self.gainActualParam(REBasics.params.remaining, -1);
                return SCommandResponse.Canceled;
            }
        }

        return SCommandResponse.Pass;
    }


    
}
