import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LBackwardFloorActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LBackwardFloorActivity {
        const a = new LBackwardFloorActivity();
        a._setup(subject, object);
        return a;
    }
}
