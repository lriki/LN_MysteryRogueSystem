import { DEnemyId } from "./DEnemy";
import { DEntityId } from "./DEntity";

export type DTroopId = number;

export class DTroop {
    public id: DTroopId;
    public key: string;
    public members: DEntityId[];

    public constructor(id: DTroopId) {
        this.id = id;
        this.key = "";
        this.members = [];
    }
}
