import { DClassId } from "./DClass";
import { DEntityId } from "./DEntity";
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
    plating: DStateId,
}

export class DSystem {
    //public elements: string[];    // IDataSystem.elements (0 is Invalid)

    public factions: DSystemFactions;

    public trapTargetFactionId: DFactionId;

    public states: DSystemStates;

    floorRoundLimit: number = 1000;

    /** 出現テーブルが何もないときに Enemy の Spawn が要求されたときに生成する Entity */
    public fallbackEnemyEntityId: DEntityId;

    /** 出現テーブルが何もないときに Item の Spawn が要求されたときに生成する Entity */
    public fallbackItemEntityId: DEntityId;

    public fallbackGoldEntityId: DEntityId;

    //public fallbackTrapEntityId: DEntityId;

    public initialPartyMembers: DEntityId[];


    constructor() {
        //this.elements = $dataSystem.elements ?? [];
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
            plating: 0,
        }
        this.fallbackEnemyEntityId = 0;
        this.fallbackItemEntityId = 0;
        this.fallbackGoldEntityId = 0;
        //this.fallbackTrapEntityId = 0;
        this.initialPartyMembers = [];
    }

    public link(testMode: boolean): void {

        const bless = REData.getState("kState_System_Bless");
        const curse = REData.getState("kState_System_Curse")
        const seal = REData.getState("kState_System_Seal");

        bless.displayNameIcon = true;
        curse.displayNameIcon = true;
        seal.displayNameIcon = true;

        this.states.bless = bless.id;
        this.states.curse = curse.id;
        this.states.seal = seal.id;
        this.states.plating = REData.getState("kState_System_Plating").id;

        this.fallbackEnemyEntityId = REData.getEnemy("kEntity_スライム_A").entityId;
        this.fallbackItemEntityId = REData.getItem("kEntity_雑草_A").id;
        this.fallbackGoldEntityId = REData.getItem("kEntity_Gold").id;
        //this.fallbackTrapEntityId = REData.getItem("kEntity_トラバサミ_A").id;

        for (let i = 1; i < REData.enemies.length; i++) {
            const data = REData.enemyData(i);
            for (const item of data.dropItems) {
                if (item.gold > 0 && item.entityId == 0) {
                    item.entityId = this.fallbackGoldEntityId;
                }
            }
        }
    }
}
