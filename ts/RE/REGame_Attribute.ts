
/**
 * データのみ保持する。
 * 
 * @note 実装は interface ではなく class にしてみる。
 * interface だとシリアライズは楽だが、リフレクションが使えない。
 */
export class REGame_Attribute
{
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
    factionId: number;
    speedLevel: number;     // 0 が基本、1は倍速。2は2倍速。-1は鈍足。
    waitTurnCount: number;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    manualMovement: boolean;    // マニュアル操作するかどうか。
    actionTokenCount: number;
}
export class REGame_UnitAttribute extends REGame_Attribute {

    factionId(): number { return this._data.factionId; }
    setFactionId(value: number): REGame_UnitAttribute { this._data.factionId = value; return this; }

    speedLevel(): number { return this._data.speedLevel; }
    setSpeedLevel(value: number): REGame_UnitAttribute { this._data.speedLevel = value; return this; }

    waitTurnCount(): number { return this._data.waitTurnCount; }
    setWaitTurnCount(value: number): REGame_UnitAttribute { this._data.waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._data.manualMovement; }
    setManualMovement(value: boolean): REGame_UnitAttribute { this._data.manualMovement = value; return this; }

    actionTokenCount(): number { return this._data.actionTokenCount; }
    setActionTokenCount(value: number): REGame_UnitAttribute { this._data.actionTokenCount = value; return this; }

    _data: REGame_UnitAttributeData = {
        factionId: 0,
        speedLevel: 0,
        waitTurnCount: 0,
        manualMovement: false,
        actionTokenCount: 0,
    };
    data(): REGame_AttributeData {
        return this._data;
    }
    
    
}

