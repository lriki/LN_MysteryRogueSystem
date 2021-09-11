import { assert } from "ts/re/Common";
import { DBasics } from "ts/re/data/DBasics";
import { DEffectCause } from "ts/re/data/DEffect";
import { LEntity } from "ts/re/objects/LEntity";
import { UName } from "ts/re/usecases/UName";


export class TestUtils {
    public static testCommonGrassBegin(actor: LEntity, item: LEntity) {
        const name = UName.makeNameAsItem(item);
        const data = item.data();

        // 未識別で仮名が付いている？
        expect(name.includes(data.display.name)).toBe(false);
        
        // [食べる] ができる？
        expect(item.queryReactions().includes(DBasics.actions.EatActionId)).toBe(true);

        // [食べる] に対応する Emittor がある？
        const emittors = data.effectSet.emittors(DEffectCause.Eat);
        assert(!!emittors);

        // 食べた時に FP を回復する効果がある？
        expect(!!emittors.find(e => !!e.effect.targetQualifyings.parameterQualifyings.find(x => x.parameterId == DBasics.params.fp && x.formula == "5")));

        // おなかを減らしておく
        actor.setActualParam(DBasics.params.fp, 500);
    }
    
    public static testCommonGrassEnd(actor: LEntity, item: LEntity) {
        // 食べられたので消滅済み
        expect(item.isDestroyed()).toBe(true);

        // FP が回復しているはず
        expect(actor.actualParam(DBasics.params.fp) > 500).toBe(true);

        // 食べられたら識別済みになる
        const name = UName.makeNameAsItem(item);
        const data = item.data();
        expect(name.includes(data.display.name)).toBe(true);
    }
}

