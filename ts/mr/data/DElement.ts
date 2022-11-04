import { DElementId } from "./DCommon";

export class DElement {
    public readonly id: DElementId;
    public readonly key: string;
    name: string;

    public constructor(id: number, key: string) {
        this.id = id;
        this.key = key;
        this.name = "";
    }
}

