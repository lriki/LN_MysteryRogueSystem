import { DEffect, DRmmzEffectScope, DEffectSet, DEffect_Default } from "./DEffect";
import { DParameterId } from "./DParameter";

export type DSkillDataId = number;


export class DSkill {
    /** ID (0 is Invalid). */
    id: DSkillDataId;

    key: string;
    kind: string;

    /** Name */
    name: string;

    rmmzAnimationId: number;

    /** Cost */
    paramCosts: DParameterId[];

    scope: DRmmzEffectScope;

    //effectSet: DEffectSet;

    // Skill は EffectSet ではなく Effect だけを持つものとする。
    //
    // Item は、食べた、投げ当てられたなど様々な要因により効果を発動するが、
    // この効果は "Skill を発動する" と考える方が管理しやすい。
    // 例えば Scope。ドラゴン草の炎ブレスは貫通Projectileを生成するが、
    // こういった「どの範囲に効果を出すか？Projectileとして効果を放出するか？」は Scope の一環として
    // 指定する方が (絶対かはわからないけど) どちらかと言えば自然だろう。
    effect: DEffect;

    constructor(id: DSkillDataId) {

        this.id = id,
        this.name = "null";
        this.key = "";
        this.kind = "";
        this.rmmzAnimationId = 0;
        this.paramCosts = [];
        this.scope = DRmmzEffectScope.None;
        //effectSet: new DEffectSet(),
        this.effect = DEffect_Default();
    }

    public parseMetadata(meta: any | undefined): void {
        if (!meta) return;
        this.key = meta["RE-Key"];
        this.kind = meta["RE-Kind"];
    }
}

