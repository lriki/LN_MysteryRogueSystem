
/**
 * データのみ保持する。
 * 
 * @note 実装は interface ではなく class にしてみる。
 * interface だとシリアライズは楽だが、リフレクションが使えない。
 */
export class RE_Game_Attribute
{
    data(): RE_Game_AttributeData {
        return {};
    }
}

export interface RE_Game_AttributeData {
}

/**
 * 論理座標値を持ち、Map 上に配置される Entity の Attribute。
 * 
 * ほとんどの Entity が持つことになる Attribute だが、持たないものもある。
 * 代表的なものだと、お店のセキュリティシステム。これは座標は持たないがお店1つにつき1つ存在して、
 * Player がアイテムを持ったまま店から出たかをチェックしている。
 * ※店主が倒された等でいなくなってもドロボウは発動するので、店主と同じ Entity にするわけにはいかない。
 */
export interface RE_Game_PositionalAttributeData extends RE_Game_AttributeData {
    x: number;          /**< 論理 X 座標 */
    y: number;          /**< 論理 Y 座標 */
    floorId: number;    /**< Entity が存在しているフロア */
}
export class RE_Game_PositionalAttribute extends RE_Game_Attribute {
    _data: RE_Game_PositionalAttributeData = {
        x: 0,
        y: 0,
        floorId: 0,
    };
    data(): RE_Game_AttributeData {
        return this._data;
    }
}

/**
 * 行動順ルールのもと、1ターンの間に何らかの行動を起こす可能性があるもの。
 *
 * - 一般的なキャラクター (Player, Enemy, NPC)
 */
export class RE_Game_UnitAttribute extends RE_Game_PositionalAttribute {
}

