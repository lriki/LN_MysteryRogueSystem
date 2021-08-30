
export type DTraitId = number;

/**
 * コアスクリプトの Trait は number だけで識別されるものであるが、
 * RE としてはメモ欄を使った指定を行う際の名前検索などで Trait というデータ自体に若干属性が必要になる。
 * 
 * NOTE: Behavior と Trait は違うもの？
 * ----------
 * ひとまず、違うものにしてみる。
 * Behavior に対して Trait は静的なデータ。特に単なるフラグを表したい時に使う。
 * よく見え状態、透視状態、ワナ回避状態、ハラヘラズ状態、ワナ師状態、など。
 * ちなみにこれらは、例えばワナ回避状態であれば、そういった状態を処理できるフローは Behavior に実装され、
 * 実際にその条件を通るかは Trait を持っているかどうか、に依る。
 * - Behavior は "資質"
 * - Trait はその資質を発動させる "鍵"
 * みたいに考えるとよさそう。
 * ただ、よく見え状態やワナ師状態などは必ずしも個々のEntityの Behavior だけで解決できるものではない。
 * そういったものモノある点に注意。
 * それでもまぁ、例えば "勢力の資質" とか "パーティの資質" とかで考えるといいかも。
 */
export interface DTrait {
    /** ID (0 is Invalid). */
    id: DTraitId;

    /** Name */
    name: string;
}



/**
 */
export enum DTraits {
    TRAIT_ELEMENT_RATE = 11,
    TRAIT_STATE_RATE = 13,

    /**
     * Game_BattlerBase.TRAIT_PARAM
     * dataId: RMMZ ParameterId
     * value:  
     */
    TRAIT_PARAM = 21,
    TRAIT_XPARAM = 22,
    TRAIT_SPARAM = 23,

    TRAIT_ATTACK_ELEMENT = 31,


    // ↑ ここまでは RMMZ の Game_BattlerBase.TRAIT_xxxx と同一
    //----------
    
    _separator = 127,

    /**
     * 直接攻撃を必中にする。
     */
    CertainDirectAttack,

    /** 地獄耳 */
    UnitVisitor,

    /** 何らかのアクションを受けたらステート解除。(仮眠や金縛りの解除で使う) */
    StateRemoveByEffect,

    Stackable,

    /**
     * アイテム種別ごとの "使うとき" の練度。
     * 食べる・投げる・読む等。攻撃でも有効。
     * 
     * dataId: DEntityKindId
     * value: 練度。1.0 で等倍
     */
    EffectProficiency,

    /**
     * アイテム種別ごとの "装備したとき" の練度。
     * 
     * 
     * dataId: DEntityKindId
     * value: 練度。1.0 で等倍
     */
    EquipmentProficiency,

    /**
     * Activity を禁止する。
     * 
     * dataId: DActionId
     */
    SealActivity,

    // 壁抜けゴースト系モンスターの "フロア全体視界"

}

