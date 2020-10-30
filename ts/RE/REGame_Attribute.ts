
/**
 * データのみ保持する。
 * 
 * @note 実装は interface ではなく class にしてみる。
 * interface だとシリアライズは楽だが、リフレクションが使えない。
 */
export class REGame_Attribute
{
    dataId: number = 0;

    data(): REGame_AttributeData {
        return {};
    }
}

export interface REGame_AttributeData {
}

/**
 * 論理座標値を持ち、Map 上に配置される Entity の Attribute。
 * 
 * floorId と x, y で、Entity の存在している場所を一意に特定できる。
 * ※floorId はダンジョンの階番号ではない。REData.floors の要素番号。
 * 
 * ほとんどの Entity が持つことになる Attribute だが、持たないものもある。
 * 代表的なものだと、お店のセキュリティシステム。これは座標は持たないがお店1つにつき1つ存在して、
 * Player がアイテムを持ったまま店から出たかをチェックしている。
 * ※店主が倒された等でいなくなってもドロボウは発動するので、店主と同じ Entity にするわけにはいかない。
 */
/*
export interface REGame_PositionalAttributeData extends REGame_AttributeData {
    floorId: number;
    x: number;
    y: number;
}
export class REGame_PositionalAttribute extends REGame_Attribute {
    _data: REGame_PositionalAttributeData = {
        x: 0,
        y: 0,
        floorId: 0,
    };
    data(): REGame_AttributeData {
        return this._data;
    }
}
*/

/**
 * 行動順ルールのもと、1ターンの間に何らかの行動を起こす可能性があるもの。
 *
 * - 一般的なキャラクター (Player, Enemy, NPC)
 */
export interface REGame_UnitAttributeData extends REGame_AttributeData {
}
export class REGame_UnitAttribute extends REGame_Attribute {
    _factionId: number = 0;
    _speedLevel: number = 0;     // 0 が基本、1は倍速。2は2倍速。-1は鈍足。
    _waitTurnCount: number = 0;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    _manualMovement: boolean = false;    // マニュアル操作するかどうか。
    _actionTokenCount: number = 0;

    factionId(): number { return this._factionId; }
    setFactionId(value: number): REGame_UnitAttribute { this._factionId = value; return this; }

    speedLevel(): number { return this._speedLevel; }
    setSpeedLevel(value: number): REGame_UnitAttribute { this._speedLevel = value; return this; }

    waitTurnCount(): number { return this._waitTurnCount; }
    setWaitTurnCount(value: number): REGame_UnitAttribute { this._waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._manualMovement; }
    setManualMovement(value: boolean): REGame_UnitAttribute { this._manualMovement = value; return this; }

    actionTokenCount(): number { return this._actionTokenCount; }
    setActionTokenCount(value: number): REGame_UnitAttribute { this._actionTokenCount = value; return this; }
}

