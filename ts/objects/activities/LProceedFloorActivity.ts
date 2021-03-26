import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LProceedFloorActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LProceedFloorActivity {
        const a = new LProceedFloorActivity();
        a._setup(subject, object);
        return a;
    }
}
