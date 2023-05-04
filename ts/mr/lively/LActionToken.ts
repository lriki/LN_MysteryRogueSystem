import { assert, MRSerializable } from "../Common";
import { LActionTokenConsumeType } from "./LCommon";
import { LEntity } from "./entity/LEntity";
import { LEntityId } from "./LObject";

export enum LActionTokenType {
    Minor,
    Major,
}

@MRSerializable
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

    public actionCount(): number {
        return Math.max(this._minorActionTokenCount, this._majorActionTokenCount);
    }

    public reset(entity: LEntity, count: number): void {
        const data = entity.data;
        this._minorActionTokenCount = count;
        this._majorActionTokenCount = Math.max(count - data.majorActionDeclines, 1);
    }

    public charge(count: number): void {
        this._minorActionTokenCount += count;
        this._majorActionTokenCount += count;
    }

    public consume(type: LActionTokenConsumeType): LActionTokenType {
        this.verify(type);
        if (type == LActionTokenConsumeType.MinorActed) {
            this._minorActionTokenCount = Math.max(this._minorActionTokenCount - 1, 0);
            return LActionTokenType.Minor;
        }
        else if (type == LActionTokenConsumeType.MajorActed) {
            this._minorActionTokenCount = Math.max(this._minorActionTokenCount - 1, 0);
            this._majorActionTokenCount = Math.max(this._majorActionTokenCount - 1, 0);
            return LActionTokenType.Major;
        }
        else {
            if (this.canMajorAction()) {
                return this.consume(LActionTokenConsumeType.MajorActed);
            }
            else {
                return this.consume(LActionTokenConsumeType.MinorActed);
            }
        }
    }

    public verify(type: LActionTokenConsumeType): void {
        if (type == LActionTokenConsumeType.MinorActed) {
            assert(this._minorActionTokenCount > 0);
        }
        else if (type == LActionTokenConsumeType.MajorActed) {
            assert(this._minorActionTokenCount > 0);
            assert(this._majorActionTokenCount > 0);
        }
        else {
            assert(this._minorActionTokenCount >= 0 || this._majorActionTokenCount >= 0);
        }
    }

}
