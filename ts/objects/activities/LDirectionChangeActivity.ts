import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LDirectionChangeActivity extends LActivity {
    private _direction: number = 0;

    public static make(subject: LEntity, d: number): LDirectionChangeActivity {
        const a = new LDirectionChangeActivity();
        a._setup(subject, subject);
        a._direction = d;
        return a;
    }

    public direction(): number {
        return this._direction;
    }
}
