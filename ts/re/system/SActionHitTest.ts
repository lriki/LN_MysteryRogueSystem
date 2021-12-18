import { DEffectHitType } from "../data/DEffect";
import { REBasics } from "../data/REBasics";
import { LEntity } from "../objects/LEntity";
import { LRandom } from "../objects/LRandom";
import { paraIndirectPhysicalHitRate } from "../PluginParameters";

export class SActionHitTest {
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
            return target.xparam(REBasics.xparams.eva);
        }
        else if (hitType == DEffectHitType.Magical) {
            return target.xparam(REBasics.xparams.mev);
        }
        else {
            return 0;
        }
    }

    private static testCertainIndirectHits(subject: LEntity, projectile: LEntity, target: LEntity): boolean | undefined {
        const awful = subject.hasTrait(REBasics.traits.AwfulPhysicalIndirectAttack);
        const hit = subject.hasTrait(REBasics.traits.CertainIndirectAttack);
        const avoid = target.hasTrait(REBasics.traits.DodgePhysicalIndirectAttack);
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
