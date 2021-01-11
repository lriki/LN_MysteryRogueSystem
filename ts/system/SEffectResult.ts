import { DState, DStateId } from "ts/data/DState";
import { REData } from "ts/data/REData";

/**
 * 一度の Effect の適用結果。Visual で表示したいコンテンツのソースデータとなる。
 * メッセージに限らず、ポップアップやイメージ表情差分表示など、様々な Visual 表現に必要なすべてのデータを含む。
 * 
 * 効果を受ける側についての情報であり、1ターン内では1つの Entity に対して複数の EffectResult のインスタンスが作られることがある。
 * コアスクリプトでは Game_Battler と Game_ActionResult が 1:1 だが、こちらは 1:n なので注意。
 * 例えば、
 * - 地雷を踏む→ダメージ
 * - 隣のタイルにあった地雷が誘爆する→ダメージ
 */
export class SEffectResult {

    // 意味のある効果適用ができたかどうか。
    // 確率計算の前に、現状知りえる情報内で明らかに適用できるかどうかを判定する。
    // 例えば HP Full の時に回復アイテムを使ったときは false になったりする。
    // false の場合「しかし、なにもおこらなかった」を表示したりする。
    used: boolean = false;  // TODO: NotImplemented

    // 攻撃側の命中判定結果。true の場合命中。used == true の場合参照できる。
    missed: boolean = false;  // TODO: NotImplemented

    // 防御側の回避判定結果。true の場合命中。used == true の場合参照できる。
    evaded: boolean = false;  // TODO: NotImplemented

    // 物理攻撃であるか。回避判定に eva を使うか、mev を使うかきめたり、クリティカルの発生有無を決めるのに使う。
    // Game_Action.prototype.isPhysical 参照。
    physical: boolean = false;  // TODO: NotImplemented

    drain: boolean = false;  // TODO: NotImplemented

    // Game_Action.prototype.itemCri
    critical: boolean = false;  // TODO: NotImplemented

    // 効果適用の成否。false の場合、 "%1には効かなかった！"
    // used, missed, evaded の判定後、実際に防御側のパラメータを変動させたかどうか。
    success: boolean = false;  // TODO: NotImplemented

    // HP に関係する効果であったか。文字の色を変えたりする
    hpAffected = false;  // TODO: NotImplemented

   parameterDamags: number[] = [];    // REData.parameters の要素数分の配列。それぞれのパラメータをどれだけ変動させるか。負値はダメージ。

   addedStates: DStateId[] = [];
   removedStates: DStateId[] = [];
    /*
    this.addedBuffs = [];
    this.addedDebuffs = [];
    this.removedBuffs = [];
    */

    // Game_ActionResult.prototype.isHit
    isHit(): boolean {
        return this.used && !this.missed && !this.evaded;
    }

    clear(): void {
        this.used = false;
        this.missed = false;
        this.evaded = false;
        this.physical = false;
        this.drain = false;
        this.critical = false;
        this.success = false;
        this.hpAffected = false;
        this.parameterDamags = [];
        this.addedStates = [];
        this.removedStates = [];
        //this.addedBuffs = [];
        //this.addedDebuffs = [];
        //this.removedBuffs = [];
    }

    // Game_ActionResult.prototype.isStateAdded
    isStateAdded(stateId: DStateId): boolean {
        return this.addedStates.includes(stateId);
    };

    // Game_ActionResult.prototype.pushAddedState
    pushAddedState(stateId: DStateId): void {
        if (!this.isStateAdded(stateId)) {
            this.addedStates.push(stateId);
        }
    }

    // Game_ActionResult.prototype.isStateRemoved
    isStateRemoved(stateId: DStateId): boolean {
        return this.removedStates.includes(stateId);
    }
    
    // Game_ActionResult.prototype.pushRemovedState
    pushRemovedState(stateId: DStateId): void {
        if (!this.isStateRemoved(stateId)) {
            this.removedStates.push(stateId);
        }
    }
    
    // Game_ActionResult.prototype.addedStateObjects
    addedStateObjects(): DState[] {
        return this.addedStates.map(id => REData.states[id]);
    }
}
