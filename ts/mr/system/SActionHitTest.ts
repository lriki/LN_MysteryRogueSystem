import { DEffectHitType } from "../data/DEffect";
import { MRBasics } from "../data/MRBasics";
import { LEntity } from "../lively/entity/LEntity";
import { LRandom } from "../lively/LRandom";
import { paraIndirectPhysicalHitRate } from "../PluginParameters";

export class SActionHitTest {
    /**
     * Projectle 用の命中判定
     * 
     * RMMZ では命中判定とダメージ適用を1つの処理で行っているが、
     * MR では飛び道具の命中判定の後に様々な処理が割り込む可能性があるため、分ける必要がある。
     * 例えば飛び道具の反射など。
     */
    public static testProjectle(subject: LEntity, projectile: LEntity, target: LEntity, hitType: DEffectHitType, rand: LRandom): boolean {
        const r1 = this.testCertainIndirectHits(subject, projectile, target);
        if (r1 !== undefined) {
            return r1;
        }

        // 攻撃側命中率
        const hitRate = (hitType == DEffectHitType.Physical) ? paraIndirectPhysicalHitRate : 100;

        // 受け側回避率
        const evaRate = this.evaRate(target, hitType) * 100;

        const missed = rand.nextIntWithMax(100) >= hitRate;
        const evaded = !missed && rand.nextIntWithMax(100) < evaRate;

        return !missed && !evaded;
    }

    private static evaRate(target: LEntity, hitType: DEffectHitType): number {
        if (hitType == DEffectHitType.Physical) {
            return target.xparam(MRBasics.xparams.eva);
        }
        else if (hitType == DEffectHitType.Magical) {
            return target.xparam(MRBasics.xparams.mev);
        }
        else {
            return 0;
        }
    }

    private static testCertainIndirectHits(subject: LEntity, projectile: LEntity, target: LEntity): boolean | undefined {
        const awful = subject.hasTrait(MRBasics.traits.AwfulPhysicalIndirectAttack);
        const hit = subject.hasTrait(MRBasics.traits.CertainIndirectAttack);
        const avoid = target.hasTrait(MRBasics.traits.DodgePhysicalIndirectAttack);
        if (hit && avoid) {
            // 絶対命中と絶対回避がコンフリクトしている場合は通常の判定を行う
            return undefined;
        }
        else if (avoid) {
            // 間接攻撃回避
            // result.missed = true;
            // result.evaded = true;
            return false;
        }
        else if (hit) {
            // 間接攻撃 - 絶対命中 (へた投げより優先)
            // result.missed = false;
            // result.evaded = false;
            return true;
        }
        else if (awful) {
            // 間接攻撃命中なし(へた投げ)
            // result.missed = true;
            // result.evaded = true;
            return false;
        }
        return undefined;
    }
}
