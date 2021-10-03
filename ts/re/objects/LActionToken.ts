import { assert } from "../Common";


export class LActionToken {
    /*
    トークンの借金について
    ----------
    v0.3.0 までは TokenCount はマイナスになることも考慮されていたが、これからは考慮しない。
    もともとあやつり系のモンスター特技の実装を想定してトークンの借金を考えていたが、
    - 原作の動きを見てみると、1ターンに何回操られても、プレイヤーの行動スキップは1回だけ。
    - マイナス状態を許可すると、どこで不正な値になったのがの検出が困難であり実装難易度が上がる。
    といった事情により廃止。
    あやつりによるターンスキップは、ステートで表現してみる。
    つまり、操られると同時に「次ターン休み」状態を付加し、ラウンド開始時にトークンを配らない。
    */

    // 変化によるインスタンス再構築でも行動回数を維持したい。（モンスターは変化の杖の効果を受けたターンは行動できる）
    _actionTokenCount: number = 0;

    public clone(): LActionToken {
        const i = new LActionToken();
        i._actionTokenCount = 0;   // 新しく作られた Entity は Scheduler には入っていないので、ActionToken を持っているのは不自然
        return i;
    }
    
    actionTokenCount(): number { return this._actionTokenCount; }
    setActionTokenCount(value: number): void { this._actionTokenCount = value; }
    clearActionTokenCount(): void { this._actionTokenCount = 0; }

    public canMinorAction(): boolean {
        return this._actionTokenCount > 0;
    }

    public canMajorAction(): boolean {
        return this._actionTokenCount > 0;
    }

    public charge(count: number): void {
        this._actionTokenCount += count;
    }

    public consume(): void {
        this.verify();
        this._actionTokenCount -= 1;
    }

    public verify(): void {
        // TODO: 今のところ借金する仕組みは無いので、そのように検証してみる。
        // あやつり系のモンスター特技を作るときには、別に借金を許可する consumeActionToken を作ったほうがいいかも。
        assert(this._actionTokenCount > 0);
    }

}
