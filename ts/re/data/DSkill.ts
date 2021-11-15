import { DEffectBehaviorId as DEffectBehaviorId, DSkillId } from "./DCommon";
import { DRmmzEffectScope } from "./DEffect";
import { DEmittor, DEmittorId } from "./DEmittor";
import { DParameterId } from "./DParameter";
import { REData } from "./REData";

export class DSkill {
    /** ID (0 is Invalid). */
    id: DSkillId;

    key: string;
    kind: string;

    /** Name */
    name: string;

    /**
     * エディタで指定される Scope.
     * 
     * この情報は実際の効果範囲を示すものではなく、AIなどで使用する参考情報となる。
     * つまり、効果の実態がダメージなのか回復なのか、や、投げて使うのか食べ使うのか、といった
     * 実際の振る舞いは関係なしに、「普通に使うときは敵味方どちらを対象とするか？」を指定する。
     */
    rmmzEffectScope: DRmmzEffectScope;

    //effectSet: DEffectSet;

    // Skill は EffectSet ではなく Effect だけを持つものとする。
    //
    // 簡単に言うと、Item の方が Skill よりも偉いため。
    //
    // Item は、食べた、投げ当てられたなど様々な要因により効果を発動するが、
    // この効果は "Skill を発動する" と考える方が管理しやすい。
    // 例えば Scope。ドラゴン草の炎ブレスは貫通Projectileを生成するが、
    // こういった「どの範囲に効果を出すか？Projectileとして効果を放出するか？」は Scope の一環として
    // 指定する方が (絶対かはわからないけど) どちらかと言えば自然だろう。
    emittorId: DEmittorId;
    
    message1: string;
    message2: string;

    constructor(id: DSkillId) {
        this.id = id,
        this.name = "null";
        this.key = "";
        this.kind = "";
        this.rmmzEffectScope = DRmmzEffectScope.None;
        //effectSet: new DEffectSet(),
        this.emittorId = 0;
        this.message1 = "";
        this.message2 = "";
    }

    public parseMetadata(meta: any | undefined): void {
        if (!meta) return;
        this.key = meta["MR-Key"];
        this.kind = meta["RE-Kind"];
    }

    public emittor(): DEmittor {
        return REData.getEmittorById(this.emittorId);
    }
}

export class DEffectBehavior {
    id: DEffectBehaviorId;
    key: string;

    public constructor(id: DEffectBehaviorId, key: string) {
        this.id = id;
        this.key = key;
    }
}
