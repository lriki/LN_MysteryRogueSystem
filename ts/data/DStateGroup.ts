
export type DStateGroupId = number;

export class DStateGroup {
    public id: DStateGroupId;
    public name: string;
    public key: string;

    public constructor(id: DStateGroupId) {
        this.id = id;
        this.name = "";
        this.key = "";
    }
}
