import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LEquipOffActivity extends LActivity {
    public static make(subject: LEntity, object: LEntity): LEquipOffActivity {
        const a = new LEquipOffActivity();
        a._setup(subject, object);
        return a;
    }
}
