import { DAttackElementId } from "./DCommon";

export class DAttackElement {
    id: DAttackElementId;
    key: string;
    name: string;
    rmmzElementId: number;  // 0 is invalid.

    public constructor(id: number) {
        this.id = id;
        this.key = "";
        this.name = "";
        this.rmmzElementId = 0;
    }

    public parseNameAndKey(str: string) {
        const tokens = str.split("##");
        if (tokens.length == 2) {
            this.name = tokens[0];
            this.key = tokens[1];
        }
        else {
            this.name = this.key = str;
        }
    }
}

