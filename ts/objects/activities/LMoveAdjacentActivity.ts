import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LMoveAdjacentActivity extends LActivity {
    private _direction: number = 0;

    public static make(subject: LEntity, d: number): LMoveAdjacentActivity {
        const a = new LMoveAdjacentActivity();
        a._setup(subject, subject);
        a._direction = d;
        return a;
    }

    //public setup(d: number): LMoveAdjacentActivity {
    //    this._direction = d;
    //    return this;
    //}

    public direction(): number {
        return this._direction;
    }
}
