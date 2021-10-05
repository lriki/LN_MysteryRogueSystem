import { assert } from "../Common";
import { REBasics } from "../data/REBasics";
import { REData } from "../data/REData";
import { LEntity } from "../objects/LEntity";

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
                    return this.entity().actualParam(param.id);
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

