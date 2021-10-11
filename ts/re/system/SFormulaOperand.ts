import { assert } from "../Common";
import { REBasics } from "../data/REBasics";
import { REData } from "../data/REData";
import { LEntity } from "../objects/LEntity";
import { paramPowerToAtk } from "../PluginParameters";

/**
 * [ダメージ計算式] の a や b といった項を表すクラス。
 */
export class SFormulaOperand {
    /*
    パラメータ追加プラグイン (AOP) ように Entity に直接プロパティを保存すると、
    - TypeScript としては見えない動的プロパティが追加されるのが心配。競合しそう。(ただでさえすでにメンバが多くなっている)
    - AOP のように事前定義された情報ではなく REData の情報を使って prototype に手を入れることになるため、セーブ・リセット時などテコ入れが必要。ちょっと面倒。
    */

    private _entity: LEntity | undefined;

    public constructor() {
        var prop: any = {};
        for (const param of REData.parameters) {
            prop[param.code] = {
                get: () => {

                    if (paramPowerToAtk && param.id == REBasics.params.atk) {
                        const entity = this.entity();
                        const atk = entity.actualParam(REBasics.params.atk);
                        const pow = entity.actualParam(REBasics.params.pow);
                        const eatk =  entity.queryIdealParameterPlus(REBasics.params.atk);  // Equipments ATK
                        const baseAtk = Math.max(atk - eatk, 1);

                        // http://twist.jpn.org/sfcsiren/index.php?%E3%83%80%E3%83%A1%E3%83%BC%E3%82%B8%E8%A8%88%E7%AE%97%E5%BC%8F
                        // 基本攻撃力+{基本攻撃力×(剣の強さ+ちから-8)/16の小数点以下を四捨五入した値}
                        // 基本攻撃力×(剣の強さ+ちから+8)/16
                        //return atk + Math.round(atk * (eatk + pow - 8) / 16);
                        return baseAtk + Math.round(eatk * (pow / 8.0));

                        // ※原作のダメージはおおよそ 1~200 で計算されることが多いのに対し、RMMZ は 100~ の大きい値を扱う。
                        // エディタもそのように使うことを前提としているため、原作の計算式をそのまま使うことは難しい。。ちからを大きくしても、武器に定数加算しかされない。(8増やしても最終ダメージに+8しかされない)
                    }
                    else {
                        return this.entity().actualParam(param.id);
                    }
                },
                configurable: true
            };
        };
        Object.defineProperties(this, prop);
    }

    public entity(): LEntity {
        assert(this._entity);
        return this._entity;
    }

    public wrap(entity: LEntity | undefined) {
        this._entity = entity;
    }

}

