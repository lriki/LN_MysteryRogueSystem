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
    public static elements: string[];    // IDataSystem.elements (0 is Invalid)

    public static factions: DSystemFactions;
}
