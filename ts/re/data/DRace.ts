import { DRaceId } from "./DCommon";

export class DRace {
    public id: DRaceId;
    public key: string;
    public name: string;

    public constructor(id: DRaceId) {
        this.id = id;
        this.key = "";
        this.name = "";
    }
}
