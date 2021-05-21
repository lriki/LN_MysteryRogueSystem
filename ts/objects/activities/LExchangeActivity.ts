import { LEntity } from "../LEntity";
import { LActivity } from "./LActivity";

export class LExchangeActivity extends LActivity {

    public static make(subject: LEntity): LExchangeActivity {
        const a = new LExchangeActivity();
        a._setup(subject, undefined);
        return a;
    }

}
