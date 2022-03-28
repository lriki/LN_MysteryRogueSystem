import { assert } from "ts/re/Common";
import { REBasics } from "ts/re/data/REBasics";
import { LActivity } from "ts/re/objects/activities/LActivity";
import { LEntity } from "ts/re/objects/LEntity";
import { RESystem } from "ts/re/system/RESystem";
import { UName } from "ts/re/usecases/UName";

export class TestUtils {
    public static submitActivity(activity: LActivity) {
        RESystem.dialogContext.postActivity(activity);
        RESystem.dialogContext.activeDialog().submit();
    }

    public static testCommonFood(item: LEntity) {
        const data = item.data();

        // [食べる] ができる？
        expect(item.queryReactions().includes(REBasics.actions.EatActionId)).toBeTruthy();

        // [食べる] に対応する Emittor がある？
        const reaction = data.getReaction(REBasics.actions.EatActionId);
        assert(!!reaction.hasEmittor());

        // 食べた時に FP を回復する効果がある？
        expect(!!reaction.emittors().find(e => !!e.effectSet.effects[0].parameterQualifyings.find(x => x._parameterId == REBasics.params.fp)));
    }

    public static testCommonGrassBegin(actor: LEntity, item: LEntity) {
        const name = UName.makeNameAsItem(item);
        const data = item.data();

        // 未識別で仮名が付いている？
        expect(name.includes(data.display.name)).toBe(false);
        
        // [食べる] ができる？
        expect(item.queryReactions().includes(REBasics.actions.EatActionId)).toBeTruthy();

        // [食べる] に対応する Emittor がある？
        const reaction = data.getReaction(REBasics.actions.EatActionId);
        assert(!!reaction.hasEmittor());

        // 食べた時に FP を回復する効果がある？
        expect(!!reaction.emittors().find(e => !!e.effectSet.effects[0].parameterQualifyings.find(x => x._parameterId == REBasics.params.fp && x.formula == "500")));
        //expect(!!emittor.effectSet.effects[0].parameterQualifyings.find(x => x._parameterId == REBasics.params.fp && x.formula == "500"));

        // おなかを減らしておく
        actor.setActualParam(REBasics.params.fp, 5000);
    }
    
    public static testCommonGrassEnd(actor: LEntity, item: LEntity) {
        // 食べられたので消滅済み
        expect(item.isDestroyed()).toBeTruthy();

        // FP が回復しているはず
        expect(actor.actualParam(REBasics.params.fp) > 5000).toBeTruthy();

        // 食べられたら識別済みになる
        const name = UName.makeNameAsItem(item);
        const data = item.data();
        expect(name.includes(data.display.name)).toBeTruthy();
    }

    public static testCommonScrollBegin(actor: LEntity, item: LEntity) {
        const name = UName.makeNameAsItem(item);
        const data = item.data();

        // 未識別で仮名が付いている？
        expect(name.includes(data.display.name)).toBe(false);
        
        // [読む] ができる？
        expect(item.queryReactions().includes(REBasics.actions.ReadActionId)).toBeTruthy();

        // [読む] に対応する Emittor がある？
        const reaction = data.getReaction(REBasics.actions.ReadActionId);
        assert(reaction);
        assert(!!reaction.hasEmittor());
    }
    
    public static testCommonScrollEnd(actor: LEntity, item: LEntity) {
        // 読まれたので消滅済み
        expect(item.isDestroyed()).toBeTruthy();

        // 読まれたら識別済みになる
        const name = UName.makeNameAsItem(item);
        const data = item.data();
        expect(name.includes(data.display.name)).toBeTruthy();
    }

    public static testCommonArrow(item: LEntity): void {
        // [撃つ] ことができる
        expect(item.queryReactions().includes(REBasics.actions.ShootingActionId)).toBeTruthy();

        // スタックできる
        expect(item.hasTrait(REBasics.traits.Stackable)).toBeTruthy();
    }
}

