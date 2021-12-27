import { DRaceId } from "./DCommon";

export class DRace {
    public id: DRaceId;
    public key: string;
    public name: string;
    public traits: IDataTrait[];

    public constructor(id: DRaceId) {
        this.id = id;
        this.key = "";
        this.name = "";
        this.traits = [];
    }
}
