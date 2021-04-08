import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LForwardFloorActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LForwardFloorActivity {
        const a = new LForwardFloorActivity();
        a._setup(subject, object);
        return a;
    }
}
