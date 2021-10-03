import { assert } from "../Common";
import { LEntity } from "./LEntity";
import { LEntityId } from "./LObject";

export enum LActionTokenType {
    Minor,
    Major,
}

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

    private _minorActionTokenCount: number = 0;

    // 変化によるインスタンス再構築でも行動回数を維持したい。（モンスターは変化の杖の効果を受けたターンは行動できる）
    private _majorActionTokenCount: number = 0;

    public clone(): LActionToken {
        const i = new LActionToken();
        i._minorActionTokenCount = 0;   
        i._majorActionTokenCount = 0;   // 新しく作られた Entity は Scheduler には入っていないので、ActionToken を持っているのは不自然
        return i;
    }
    
    //actionTokenCount(): number { return this._majorActionTokenCount; }
    //setActionTokenCount(value: number): void { this._majorActionTokenCount = value; }

    clearActionTokenCount(): void {
        this._minorActionTokenCount = 0;
        this._majorActionTokenCount = 0;
    }

    public canMinorAction(): boolean {
        return this._minorActionTokenCount > 0;
    }

    public canMajorAction(): boolean {
        return this._minorActionTokenCount > 0 && this._majorActionTokenCount > 0;
    }

    public reset(entity: LEntity, count: number): void {
        this._minorActionTokenCount = count;
        this._majorActionTokenCount = Math.max(count - entity.data().majorActionDeclines, 0);
    }

    public charge(count: number): void {
        this._minorActionTokenCount += count;
        this._majorActionTokenCount += count;
    }

    public consume(tokenType: LActionTokenType): void {
        this.verify(tokenType);
        if (tokenType == LActionTokenType.Minor) {
            this._minorActionTokenCount = Math.max(this._minorActionTokenCount - 1, 0);
        }
        else {
            this._minorActionTokenCount = Math.max(this._minorActionTokenCount - 1, 0);
            this._majorActionTokenCount = Math.max(this._majorActionTokenCount - 1, 0);
        }
    }

    public verify(tokenType: LActionTokenType): void {
        if (tokenType == LActionTokenType.Minor) {
            assert(this._minorActionTokenCount > 0);
        }
        else {
            assert(this._minorActionTokenCount > 0);
            assert(this._majorActionTokenCount > 0);
        }
    }

}
