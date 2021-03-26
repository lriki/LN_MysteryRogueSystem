import { LActivity } from "./LActivity";

export class LDirectionChangeActivity extends LActivity {
    private _direction: number = 0;

    public setup(d: number): LDirectionChangeActivity {
        this._direction = d;
        return this;
    }

    public direction(): number {
        return this._direction;
    }
}
