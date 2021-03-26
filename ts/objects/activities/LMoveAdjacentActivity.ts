import { LActivity } from "./LActivity";

export class LMoveAdjacentActivity extends LActivity {
    private _direction: number = 0;

    public setup(d: number): LMoveAdjacentActivity {
        this._direction = d;
        return this;
    }

    public direction(): number {
        return this._direction;
    }
}
