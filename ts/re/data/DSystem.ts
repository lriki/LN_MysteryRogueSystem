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
        }
        this.fallbackEnemyEntityId = 0;
        this.fallbackItemEntityId = 0;
        this.fallbackGoldEntityId = 0;
    }

    public link(testMode: boolean): void {

        const bless = REData.getState("kState_UT祝福");
        const curse = REData.getState("kState_UT呪い")
        const seal = REData.getState("kState_UT封印");

        bless.displayNameIcon = true;
        curse.displayNameIcon = true;
        seal.displayNameIcon = true;

        this.states.bless = bless.id;
        this.states.curse = curse.id;
        this.states.seal = seal.id;

        this.fallbackEnemyEntityId = REData.getEnemy("kEnemy_スライム").entityId;
        this.fallbackItemEntityId = REData.getItem("kItem_雑草").id;
        this.fallbackGoldEntityId = REData.getItem("kItem_Gold").id;

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
