import { DAttackElementId } from "./DCommon";

export class DAttackElement {
    id: DAttackElementId;
    name: string;

    public constructor(id: number) {
        this.id = id;
        this.name = "";
    }
}

