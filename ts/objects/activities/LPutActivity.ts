import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LPutActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LPutActivity {
        const a = new LPutActivity();
        a._setup(subject, object);
        return a;
    }
}
