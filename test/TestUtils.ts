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
        const emittor = data.getReaction(REBasics.actions.EatActionId).emittor();//data.emittorSet.emittors(DEffectCause.Eat);
        assert(!!emittor);

        // 食べた時に FP を回復する効果がある？
        //expect(!!emittors.find(e => !!e.effectSet.effects[0].parameterQualifyings.find(x => x._parameterId == REBasics.params.fp && x.formula == "500")));
        expect(!!emittor.effectSet.effects[0].parameterQualifyings.find(x => x._parameterId == REBasics.params.fp && x.formula == "500"));

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

    public static testCommonScrollBegin(actor: LEntity, item: LEntity) {
        const name = UName.makeNameAsItem(item);
        const data = item.data();

        // 未識別で仮名が付いている？
        expect(name.includes(data.display.name)).toBe(false);
        
        // [読む] ができる？
        expect(item.queryReactions().includes(REBasics.actions.ReadActionId)).toBe(true);

        // [読む] に対応する Emittor がある？
        const reaction = data.reactions.find(x => x.actionId == REBasics.actions.ReadActionId);
        assert(reaction);
        assert(!!reaction.emittingEffect);
    }
    
    public static testCommonScrollEnd(actor: LEntity, item: LEntity) {
        // 読まれたので消滅済み
        expect(item.isDestroyed()).toBe(true);

        // 読まれたら識別済みになる
        const name = UName.makeNameAsItem(item);
        const data = item.data();
        expect(name.includes(data.display.name)).toBe(true);
    }
}

