import { RESerializable } from "../Common";
import { LBattlerBehavior } from "./behaviors/LBattlerBehavior";
import { LEntity } from "./LEntity";

/**
 * 特に経験値はステップ終了時にまとめて取得できる。
 * そういった遅延取得に関係するデータをまとめておくクラス。
 */
@RESerializable
export class LReward {
    private _exp: number;

    public constructor() {
        this._exp = 0;
    }

    public clear(): void {
        this._exp = 0;
    }

    public exp(): number {
        return this._exp;
    }

    public addExp(value: number): void {
        this._exp += value;
    }

    public apply(entity: LEntity): void {
        const b = entity.findEntityBehavior(LBattlerBehavior);
        if (b) {
            b.gainExp(this._exp);
        }

        this.clear();
    }
}
