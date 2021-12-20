import { DEffect, DEffectSet } from "../data/DEffect";
import { LEntity } from "../objects/LEntity";
import { LRandom } from "../objects/LRandom";
import { SEffect } from "../system/SEffectApplyer";

export interface UResolveApplyEffects {
    mainTarget: LEntity;                // 参考情報
    targets: Map<LEntity, SEffect[]>;   // 必要であれば mainTarget も含まれている。
}

/**
 * Effect 関係のヘルパー
 */
export class UEffect {
    public static resolveApplyEffects(allEffects: readonly SEffect[], targets: LEntity[], rand: LRandom): UResolveApplyEffects[] {
        const result: UResolveApplyEffects[] = [];
        for (const target of targets) {
            const localTargets = new Map<LEntity, SEffect[]>();

            // まず SubComponent を含めた適用対象を取り出す
            for (const effect of allEffects) {
                // Find sub-components
                const subComponentKey = effect.data().matchConditions.key;
                if (subComponentKey) {
                    for (const subTarget of target.querySubEntities(subComponentKey)) {
                        const pair = localTargets.get(subTarget);
                        if (pair) {
                            pair.push(effect);
                        }
                        else {
                            localTargets.set(subTarget, [effect]);
                        }
                    }
                }
                else {
                    // Main Effect
                    const pair = localTargets.get(target);
                    if (pair) {
                        pair.push(effect);
                    }
                    else {
                        localTargets.set(target, [effect]);
                    }
                }
            }

            result.push({
                mainTarget: target,
                targets: localTargets,
            });
        }

        return result;
    }

    // public static meetsCondition(entity: LEntity, effect: DEffect): boolean {
    //     if (effect.matchConditions.kindId != 0 && effect.matchConditions.kindId !=entity.kindDataId()) {
    //         return false;
    //     }
    //     return true;
    // }

    // public static testApply(effectSet: DEffectSet, entity: LEntity): boolean {
    //     for (const effect of effectSet.effects) {
    //         if (this.meetsCondition(entity, effect)) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }
}
