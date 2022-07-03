import { assert } from "../Common";
import { MRBasics } from "../data/MRBasics";
import { MRData } from "../data/MRData";
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
        for (const param of MRData.parameters) {
            prop[param.code] = {
                get: () => {

                    if (paramPowerToAtk && param.id == MRBasics.params.atk) {
                        const entity = this.entity();
                        const atk = entity.actualParam(MRBasics.params.atk);
                        const pow = entity.actualParam(MRBasics.params.pow);
                        const eatk =  entity.queryIdealParameterPlus(MRBasics.params.atk);  // Equipments ATK

                        // 全体の ATK から、装備による上昇分の ATK を引くことで、素の ATK を求める。
                        const baseAtk = Math.max(atk - eatk, 1);

                        // http://000.la.coocan.jp/torneco/damage.html
                        // 基本攻撃力+{基本攻撃力×(剣の強さ+ちから-8)/16の小数点以下を四捨五入した値}
                        // 基本攻撃力×(剣の強さ+ちから+8)/16
                        //return atk + Math.round(atk * (eatk + pow - 8) / 16);
                        return baseAtk + Math.round(eatk * (pow / 8.0));

                        // ※原作のダメージはおおよそ 1~200 で計算されることが多いのに対し、RMMZ は 100~ の大きい値を扱う。
                        // エディタもそのように使うことを前提としているため、原作の計算式をそのまま使うことは難しい。。
                        // ちからを大きくしても、武器に定数加算しかされない。(8増やしても最終ダメージに+8しかされない)
                    }
                    else {
                        return this.entity().actualParam(param.id);
                    }
                },
                configurable: true
            };
            prop["max_" + param.code] = {
                get: () => {
                    return this.entity().idealParam(param.id);
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

