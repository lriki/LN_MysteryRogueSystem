import { DClassId } from "./DClass";
import { DSkillId } from "./DCommon";
import { DEntityId } from "./DEntity";
import { DFlavorEffect } from "./DFlavorEffect";
import { DSkillClass } from "./DSkill";
import { DStateId } from "./DState";
import { DFactionId, MRData } from "./MRData";

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


// export interface DSystemSounds {
//     /** プレイヤー及び味方勢力がレベルアップした時の */
//     friendLevelUp: IDataSound;

//     /** プレイヤー及び味方勢力がレベルアップした時の */
//     opponentLevelUp: IDataSound;
// }

export interface DSystemSkills {
    wait: DSkillId;
    move: DSkillId;
    escape: DSkillId;
    normalAttack: DSkillId;
}

export enum DFovSystem {
    RoomBounds = "RoomBounds",
    // https://www.albertford.com/shadowcasting/
    SymmetricShadowcast = "SymmetricShadowcast",
}

/**
 * MR システムをの基本的な動作に必要な定義済みデータを管理します。
 */
export class DSystem {
    //public elements: string[];    // IDataSystem.elements (0 is Invalid)

    public factions: DSystemFactions;

    public trapTargetFactionId: DFactionId;

    public skills: DSystemSkills;


    public states: DSystemStates;

    floorRoundLimit: number = 1000;

    /** 出現テーブルが何もないときに Enemy の Spawn が要求されたときに生成する Entity */
    public fallbackEnemyEntityId: DEntityId;

    /** 出現テーブルが何もないときに Item の Spawn が要求されたときに生成する Entity */
    public fallbackItemEntityId: DEntityId;

    public fallbackGoldEntityId: DEntityId;

    //public fallbackTrapEntityId: DEntityId;

    public initialPartyMembers: DEntityId[];

    public readonly bareHandsFlavorEffect: DFlavorEffect;

    public fovSystem: DFovSystem = DFovSystem.RoomBounds;//DFovSystem.SymmetricShadowcast;//


    constructor() {
        //this.elements = $dataSystem.elements ?? [];
        this.factions = {
            player: 1,
            enemy: 2,
            neutral: 3,
        };
        this.trapTargetFactionId = this.factions.player;
        this.skills = {
            wait: 0,
            move: 0,
            escape: 0,
            normalAttack: 0,
        }
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
        this.bareHandsFlavorEffect = new DFlavorEffect();
        this.bareHandsFlavorEffect.rmmzAnimationId = 1;
    }

    public link(testMode: boolean): void {

        const bless = MRData.getState("kState_System_Bless");
        const curse = MRData.getState("kState_System_Curse")
        const seal = MRData.getState("kState_System_Seal");

        bless.displayNameIcon = true;
        curse.displayNameIcon = true;
        seal.displayNameIcon = true;

        this.skills.wait = MRData.getSkill("kSkill_System_Wait").id;
        this.skills.move = MRData.getSkill("kSkill_System_Move").id;
        this.skills.escape = MRData.getSkill("kSkill_System_Escape").id;
        this.skills.normalAttack = MRData.getSkill("kSkill_System_NormalAttack").id;

        MRData.skills[this.skills.wait].skillClass = DSkillClass.Minor;
        MRData.skills[this.skills.move].skillClass = DSkillClass.Minor;
        MRData.skills[this.skills.escape].skillClass = DSkillClass.Minor;


        this.states.bless = bless.id;
        this.states.curse = curse.id;
        this.states.seal = seal.id;
        this.states.plating = MRData.getState("kState_System_Plating").id;

        this.fallbackEnemyEntityId = MRData.getEnemy("kEntity_スライムA").entityId;
        this.fallbackItemEntityId = MRData.getItem("kEntity_雑草A").id;
        this.fallbackGoldEntityId = MRData.getItem("kEntity_GoldA").id;
        //this.fallbackTrapEntityId = REData.getItem("kEntity_トラバサミA").id;

        for (let i = 1; i < MRData.enemies.length; i++) {
            const data = MRData.enemyData(i);
            for (const item of data.dropItems) {
                if (item.gold > 0 && item.entityId == 0) {
                    item.entityId = this.fallbackGoldEntityId;
                }
            }
        }
    }

    public static getQuestMarkerIcon(key: string | undefined): number {
        switch (key) {
            case "kQuestMarkerIcon_Normal":
                return 320;
            case "kQuestMarkerIcon_Main":
                return 321;
            case "kQuestMarkerIcon_Combat":
                return 322;
            case "kQuestMarkerIcon_Collect":
                return 323;
            case "kQuestMarkerIcon_Explore":
                return 322;
            default:
                return 0;
        }
    }
}
