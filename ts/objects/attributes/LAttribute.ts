import { assert } from "ts/Common";
import { EntityId } from "ts/system/EntityId";
import { REGame } from "../../RE/REGame";
import { REGame_Entity } from "../../RE/REGame_Entity";

/**
 * データのみ保持する。
 * 
 * @note 実装は interface ではなく class にしてみる。
 * interface だとシリアライズは楽だが、リフレクションが使えない。
 */
export class LAttribute
{
    dataId: number = 0;
    _ownerEntityId: EntityId = { index: 0, key: 0 };

    data(): LAttributeData {
        return {};
    }

    entity(): REGame_Entity {
        assert(this._ownerEntityId.index > 0);
        return REGame.world.entity(this._ownerEntityId);
    }
}

export interface LAttributeData {
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
export interface LUnitAttributeData extends LAttributeData {
}
export class LUnitAttribute extends LAttribute {
    _factionId: number = 0;
    _speedLevel: number = 1;     // 1 が基本, 0は無効値。2は倍速。3は3倍速。-1は鈍足。
    _waitTurnCount: number = 0;  // 内部パラメータ。待ち数。次のターン、行動できるかどうか。
    _manualMovement: boolean = false;    // マニュアル操作するかどうか。
    _actionTokenCount: number = 0;
    _targetingEntityId: number = 0;   // AIMinor Phase で、攻撃対象を確定したかどうか。以降、Run 内では iterationCount が残っていても MinorAction を行わない

    // Battler params
    

    factionId(): number { return this._factionId; }
    setFactionId(value: number): LUnitAttribute { this._factionId = value; return this; }

    speedLevel(): number { return this._speedLevel; }
    setSpeedLevel(value: number): LUnitAttribute { this._speedLevel = value; return this; }

    waitTurnCount(): number { return this._waitTurnCount; }
    setWaitTurnCount(value: number): LUnitAttribute { this._waitTurnCount = value; return this; }

    manualMovement(): boolean { return this._manualMovement; }
    setManualMovement(value: boolean): LUnitAttribute { this._manualMovement = value; return this; }

    actionTokenCount(): number { return this._actionTokenCount; }
    setActionTokenCount(value: number): LUnitAttribute { this._actionTokenCount = value; return this; }
}

