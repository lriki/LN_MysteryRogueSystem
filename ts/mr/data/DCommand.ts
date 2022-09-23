import { DCommandId } from "./DCommon";

/**
 */
export class DCommand {
    /** ID (0 is Invalid). */
    id: DCommandId;

    /** Name. */
    name: string;

    public constructor(id: DCommandId, name: string) {
        this.id = id;
        this.name = name;
    }
}
