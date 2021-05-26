import { DFactionId } from "./REData";

export interface DSystemFactions {
    
    //ActorDefaultFactionId: number;// = 1;
    //EnemeyDefaultFactionId: number;// = 2;
    
    /** Player (RMMZ Actor:1) の属する勢力 */
    player: DFactionId;

    /** Enemy の属する勢力 */
    enemy: DFactionId;

    neutral: DFactionId;
}

export class DSystem {
    public elements: string[];    // IDataSystem.elements (0 is Invalid)

    public factions: DSystemFactions;

    public trapTargetFactionId: DFactionId;

    constructor() {
        this.elements = $dataSystem.elements ?? [];
        this.factions = {
            player: 1,
            enemy: 2,
            neutral: 3,
        };
        this.trapTargetFactionId = this.factions.player;
    }
}
