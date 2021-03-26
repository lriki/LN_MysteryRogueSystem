import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LEquipActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LEquipActivity {
        const a = new LEquipActivity();
        a._setup(subject, object);
        return a;
    }
}
