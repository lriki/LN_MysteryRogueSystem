
/**
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
export class DTraits {
    static TRAIT_ELEMENT_RATE = 11;
    static TRAIT_STATE_RATE = 13;

    /**
     * Game_BattlerBase.TRAIT_PARAM
     * dataId: RMMZ ParameterId
     * value:  
     */
    static TRAIT_PARAM = 21;
    static TRAIT_XPARAM = 22;
    static TRAIT_SPARAM = 23;

    static TRAIT_ATTACK_ELEMENT = 31;


    // ↑ ここまでは RMMZ の Game_BattlerBase.TRAIT_xxxx と同一
    //----------
    


    // 壁抜けゴースト系モンスターの "フロア全体視界"

}

