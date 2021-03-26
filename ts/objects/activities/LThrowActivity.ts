import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LThrowActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LThrowActivity {
        const a = new LThrowActivity();
        a._setup(subject, object);
        return a;
    }
}
