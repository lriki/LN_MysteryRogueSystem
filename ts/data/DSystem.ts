import { DStateId } from "./DState";
import { DFactionId, REData } from "./REData";

export interface DSystemFactions {
    
    //ActorDefaultFactionId: number;// = 1;
    //EnemeyDefaultFactionId: number;// = 2;
    
    /** Player (RMMZ Actor:1) の属する勢力 */
    player: DFactionId;

    /** Enemy の属する勢力 */
    enemy: DFactionId;

    neutral: DFactionId;
}

export interface DSystemStates {
    bless: DStateId,
    curse: DStateId,
    seal: DStateId,
}

export class DSystem {
    public elements: string[];    // IDataSystem.elements (0 is Invalid)

    public factions: DSystemFactions;

    public trapTargetFactionId: DFactionId;

    public states: DSystemStates;

    constructor() {
        this.elements = $dataSystem.elements ?? [];
        this.factions = {
            player: 1,
            enemy: 2,
            neutral: 3,
        };
        this.trapTargetFactionId = this.factions.player;
        this.states = {
            bless: 0,
            curse: 0,
            seal: 0,
        }
    }

    public link(testMode: boolean): void {
        if (!testMode) {
            this.states.bless = REData.getStateFuzzy("kState_UT祝福").id;
            this.states.curse = REData.getStateFuzzy("kState_UT呪い").id;
            this.states.seal = REData.getStateFuzzy("kState_UT封印").id;
        }
        else {
            this.states.bless = REData.getStateFuzzy("kState_UT祝福").id;
            this.states.curse = REData.getStateFuzzy("kState_UT呪い").id;
            this.states.seal = REData.getStateFuzzy("kState_UT封印").id;
        }
    }
}
