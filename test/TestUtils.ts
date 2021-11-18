import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { DEffectCause } from "ts/re/data/DEmittor";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";

export class TestUtils {
    public static testCommonGrassBegin(actor: LEntity, item: LEntity) {
        const name = UName.makeNameAsItem(item);
        const data = item.data();

        // 未識別で仮名が付いている？
        expect(name.includes(data.display.name)).toBe(false);
        
        // [食べる] ができる？
        expect(item.queryReactions().includes(REBasics.actions.EatActionId)).toBe(true);

        // [食べる] に対応する Emittor がある？
        const emittors = data.emittorSet.emittors(DEffectCause.Eat);
        assert(!!emittors);

        // 食べた時に FP を回復する効果がある？
        expect(!!emittors.find(e => !!e.effectSet.effects[0].qualifyings.parameterQualifyings.find(x => x.parameterId == REBasics.params.fp && x.formula == "500")));

        // おなかを減らしておく
        actor.setActualParam(REBasics.params.fp, 5000);
    }
    
    public static testCommonGrassEnd(actor: LEntity, item: LEntity) {
        // 食べられたので消滅済み
        expect(item.isDestroyed()).toBe(true);

        // FP が回復しているはず
        expect(actor.actualParam(REBasics.params.fp) > 5000).toBe(true);

        // 食べられたら識別済みになる
        const name = UName.makeNameAsItem(item);
        const data = item.data();
        expect(name.includes(data.display.name)).toBe(true);
    }
}

