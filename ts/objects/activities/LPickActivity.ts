import { LEntity } from "../LEntity";
import { LEntityId } from "../LObject";
import { LActivity } from "./LActivity";

export class LPickActivity extends LActivity {

    public static make(subject: LEntity): LPickActivity {
        const a = new LPickActivity();
        a._setup(subject, undefined);
        return a;
    }

}
