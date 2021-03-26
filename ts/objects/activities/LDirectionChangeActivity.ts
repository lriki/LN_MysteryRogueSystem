import { LActivity } from "./LActivity";

export class LDirectionChangeActivity extends LActivity {
    private _direction: number;

    public constructor(d: number) {
        super();
        this._direction = d;
    }

    public direction(): number {
        return this._direction;
    }
}
