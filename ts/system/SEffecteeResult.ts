
// ターゲット側
export class SEffecteeResult {

    // 意味のある効果適用ができたかどうか。false のばあい「しかし、なにもおこらなかった」を表示したりする。
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
    success: boolean = false;  // TODO: NotImplemented

    // HP に関係する効果であったか。文字の色を変えたりする
    hpAffected = false;  // TODO: NotImplemented

    /*
    this.hpDamage = 0;
    this.mpDamage = 0;
    this.tpDamage = 0;
    this.addedStates = [];
    this.removedStates = [];
    this.addedBuffs = [];
    this.addedDebuffs = [];
    this.removedBuffs = [];
    */

    // Game_ActionResult.prototype.isHit
    isHit() boolean {
        return this.used && !this.missed && !this.evaded;
    }

}

