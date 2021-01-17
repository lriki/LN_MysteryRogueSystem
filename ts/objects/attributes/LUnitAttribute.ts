import { LAttribute, LAttributeData } from "./LAttribute";


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
    clearActionTokenCount(): void { this._actionTokenCount = 0; }
}


