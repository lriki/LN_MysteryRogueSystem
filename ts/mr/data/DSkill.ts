import { DSpecialEffectId as DSpecialEffectId, DSkillId, DEmittorId } from "./DCommon";
import { DRmmzEffectScope } from "./DEffect";
import { DEmittor } from "./DEmittor";
import { DFlavorEffect, IFlavorEffectProps } from "./DFlavorEffect";
import { MRData } from "./MRData";

export enum DSkillClass {
    Major = 0,
    Minor = 1,
}

export class DSkill {
    /*
    [2022/9/7] なぜ Action と Skill を関連付けたのか
    ----------
    1. FlavorEffect をエディタから指定できるようにすることを考えると、Skill 扱いしたほうが都合がよい。
    2. 単なる "移動" や "通常攻撃" も、現時点で Action としても、Skill としても扱っている。（Enemy の行動選択として "移動" スキルがあると都合がよい）
    3. Action の条件を、 Skill と同様にしていできる。例えば、レベルアップやイベントで新しい Action を取れるようになったり、
       クラスによって Action を変えられるようにしたり、といったことができる。
    4. 同様に RMMZ の Trait などの仕様とシームレスに統合できる。 Action の封印を Skill の封印として扱ったり、何か装備した時だけ使える Action が作れる。
    */


    /** ID (0 is Invalid). */
    readonly id: DSkillId;

    readonly key: string;
    
    isActivity: boolean;

    /** Name */
    name: string;

    priority: number = 0;

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
    
    // message1: string;
    // message2: string;

    /** スキル発動者に対する FlavorEffect */
    flavorEffect: DFlavorEffect | undefined;
    // NOTE: こちらは主にスキル発動の message を持つためのものであるため、DEmittor が持つものとは区別している。

    skillClass: DSkillClass = DSkillClass.Major;

    constructor(id: DSkillId, key: string) {
        this.id = id,
        this.key = key;
        this.name = "null";
        this.isActivity = false;
        this.rmmzEffectScope = DRmmzEffectScope.None;
        //effectSet: new DEffectSet(),
        this.emittorId = 0;
        this.flavorEffect = undefined;
    }

    public emittor(): DEmittor {
        return MRData.getEmittorById(this.emittorId);
    }

    public setFlavorEffect(options: IFlavorEffectProps): void {
        this.flavorEffect = new DFlavorEffect(options);
    }

    public applyProps(props: ISkillProps): void {
        if (props.flavorEffect) {
            this.setFlavorEffect(props.flavorEffect);
        }
    }
}

//------------------------------------------------------------------------------
// Props

export interface ISkillProps {
    /**
     * この Skill を発動するときに再生する FlavorEffect。
     */
    flavorEffect?: IFlavorEffectProps;
}
