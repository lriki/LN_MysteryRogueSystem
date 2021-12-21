import { assert } from "../Common";
import { DEffect, DEffectSet } from "../data/DEffect";
import { LEntity } from "../objects/LEntity";
import { LRandom } from "../objects/LRandom";
import { SEffect } from "../system/SEffectApplyer";

// export interface UResolveApplyEffects {
//     mainTarget: LEntity;                // 参考情報
//     targets: Map<LEntity, SEffect[]>;   // 必要であれば mainTarget も含まれている。
// }

export class UResolvedApplyEffectTarget {
    target: LEntity;                // 実際に Effect 適用先となる Entity。
    mainTarget: LEntity;            // 検索の起点となった Entity。例えば target が武器(SubComponent)であれば、mainTarget はその装備者となる。そうでなければ target == mainTarget。
    candidateEffects: SEffect[];    // 候補 Effect。findKey を解決しただけで、まだ Condition や Rating 等は解決していない。
    actualEffects: SEffect[];       // 実際に適用する Effect。

    public constructor(target: LEntity, mainTarget: LEntity) {
        this.target = target;
        this.mainTarget = mainTarget;
        this.candidateEffects = [];
        this.actualEffects = [];
    }
}

export class UResolvedApplyEffects {
    targets: UResolvedApplyEffectTarget[];

    public constructor() {
        this.targets = [];
    }

    public addCandidateTargetEffect(target: LEntity, mainTarget: LEntity, effect: SEffect): void {
        const t1 = this.targets.find(x => x.target == target);
        if (t1) {
            assert(t1.mainTarget == mainTarget);
            t1.candidateEffects.push(effect);
        }
        else {
            const t2 = new UResolvedApplyEffectTarget(target, mainTarget);
            t2.candidateEffects.push(effect);
            this.targets.push(t2);
        }
    }
}


/**
 * Effect 関係のヘルパー
 */
export class UEffect {
    public static resolveApplyEffects(allEffects: readonly SEffect[], targets: LEntity[], rand: LRandom): UResolvedApplyEffects {
        const result = new UResolvedApplyEffects();

        // まず SubComponent を含めた適用対象と候補 Effect を取り出す
        for (const target of targets) {
            this.selectCandidateTargetEffects(result, allEffects, target, rand);
        }

        // 候補 Effect から実際に適用する Effect を決める
        for (const target of result.targets) {
            this.resolveApplyEffectsSingleTarget(target, rand);
        }

        return result;
    }

    private static selectCandidateTargetEffects(result: UResolvedApplyEffects, allEffects: readonly SEffect[], target: LEntity, rand: LRandom): void {
        for (const effect of allEffects) {
            // Find sub-components
            const subComponentKey = effect.data().subEntityFindKey.key;
            if (subComponentKey) {
                for (const subTarget of target.querySubEntities(subComponentKey)) {
                    result.addCandidateTargetEffect(subTarget, target, effect);
                }
            }
            else {
                // Main Effect
                result.addCandidateTargetEffect(target, target, effect);
            }
        }
    }

    private static resolveApplyEffectsSingleTarget(result: UResolvedApplyEffectTarget, rand: LRandom): void {
        // 条件でフィルタリング
        const candidates = result.candidateEffects.filter(x => this.meetsCondition(x, result.target));

        const ratedCandidates = [];
        for (const effect of candidates) {
            if (effect.data().conditions.applyRating > 0) {
                // レート付きの Effect は後程選択する
                ratedCandidates.push(effect);
            }
            else {
                // レート無しはここで確定
                result.actualEffects.push(effect);
            }
        }

        // レート付きの中から1つ選択
        const re = this.selectEffect(ratedCandidates, rand);
        if (re) {
            result.actualEffects.push(re);
        }
    }

    private static meetsCondition(effect: SEffect, target: LEntity): boolean {
        const data = effect.data();
        const entityData = target.data();

        if (data.conditions.kindId != 0) {
            if (data.conditions.kindId != target.kindDataId()) {
                return false;
            }
        }

        if (data.conditions.raceId != 0) {
            if (!entityData.raceIds.includes(data.conditions.raceId)) {
                return false;
            }
        }

        // 条件にすべて一致 or 条件がひとつもない
        return true;
    }

    private static selectEffect(effectList: SEffect[], rand: LRandom): SEffect | undefined {
        const ratingMax = Math.max(...effectList.map(a => a.data().conditions.applyRating));
        const ratingZero = ratingMax - 10;//- 3;
        const sum = effectList.reduce((r, a) => r + (a.data().conditions.applyRating) - ratingZero, 0);
        if (sum > 0) {
            let value = rand.nextIntWithMax(sum);
            for (const action of effectList) {
                if (!action.data().conditions.applyRating) continue;

                value -= (action.data().conditions.applyRating) - ratingZero;
                if (value < 0) {
                    return action;
                }
            }
        } else {
            return undefined;
        }
    }


    // public static resolveApplyEffectsMainTarget(allEffects: readonly SEffect[], target: LEntity, rand: LRandom): Map<LEntity, SEffect[]> {
    //     const localTargets = new Map<LEntity, SEffect[]>();

    //     for (const effect of allEffects) {
    //         // Find sub-components
    //         const subComponentKey = effect.data().subEntityFindKey.key;
    //         if (subComponentKey) {
    //             for (const subTarget of target.querySubEntities(subComponentKey)) {
    //                 const pair = localTargets.get(subTarget);
    //                 if (pair) {
    //                     pair.push(effect);
    //                 }
    //                 else {
    //                     localTargets.set(subTarget, [effect]);
    //                 }
    //             }
    //         }
    //         else {
    //             // Main Effect
    //             const pair = localTargets.get(target);
    //             if (pair) {
    //                 pair.push(effect);
    //             }
    //             else {
    //                 localTargets.set(target, [effect]);
    //             }
    //         }
    //     }

    //     return localTargets;
    // }

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
