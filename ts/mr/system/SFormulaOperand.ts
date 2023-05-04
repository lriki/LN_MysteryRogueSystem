import { assert } from "../Common";
import { MRBasics } from "../data/MRBasics";
import { MRData } from "../data/MRData";
import { LEntity } from "../lively/entity/LEntity";
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
                        const atk = entity.getActualParam(MRBasics.params.atk);
                        const pow = entity.getActualParam(MRBasics.params.pow);
                        
                        // NOTE:
                        // ↓原作のダメージ計算式。
                        // http://000.la.coocan.jp/torneco/damage.html
                        // 基本攻撃力+{基本攻撃力×(剣の強さ+ちから-8)/16の小数点以下を四捨五入した値}
                        // 基本攻撃力×(剣の強さ+ちから+8)/16
                        //
                        // 原作のダメージはおおよそ 1~200 で計算されることが多いのに対し、RMMZ は 100~ の大きい値を扱う。
                        // エディタもそのように使うことを前提としているため、原作の計算式をそのまま使うことは難しい。。
                        // ちからを大きくしても、武器に定数加算しかされない。(8増やしても最終ダメージに+8しかされない)
                        // 
                        // 本プラグインとしては、「何もしない」状態、つまりちからが初期値 8 の時に、
                        // RMMZ デフォルトのダメージ計算式を使って計算したのと同じ攻撃力となるのが望ましいだろう。

                        // ↓初版の没式。これだと既に攻撃力にちからが影響しない。
                            // 全体の ATK から、装備による上昇分の ATK を引くことで、素の ATK を求める。
                            // これを 基本攻撃力(素手の攻撃力) とする。
                            //const eatk =  entity.queryIdealParameterPlus(MRBasics.params.atk);  // Equipments ATK
                            //const baseAtk = Math.max(atk - eatk, 1);
                            ////return atk + Math.round(atk * (eatk + pow - 8) / 16);
                            //return baseAtk + Math.round(eatk * (pow / 8.0));

                        // - ちからが 8 であるときの結果は atk そのままとなる。
                        // - ちからが 0 のときは結果は元の atk の半分となる。
                        // - ちからが 24 であるときの結果は atk の2倍となる。
                        return atk + (atk * ((pow - 8) / 16.0));
                    }
                    else {
                        return this.entity().getActualParam(param.id);
                    }
                },
                configurable: true
            };
            prop["max_" + param.code] = {
                get: () => {
                    return this.entity().getParamActualMax(param.id);
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

