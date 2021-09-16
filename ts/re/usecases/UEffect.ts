import { DEffect, DEffectSet } from "../data/DEffect";
import { LEntity } from "../objects/LEntity";

/**
 * Effect 関係のヘルパー
 */
export class UEffect {

    public static meetsCondition(entity: LEntity, effect: DEffect): boolean {
        if (effect.matchConditions.kindId != 0 && effect.matchConditions.kindId !=entity.kindDataId()) {
            return false;
        }
        return true;
    }

    public static testApply(effectSet: DEffectSet, entity: LEntity): boolean {
        for (const effect of effectSet.effects) {
            if (this.meetsCondition(entity, effect)) {
                return true;
            }
        }
        return false;
    }
}
