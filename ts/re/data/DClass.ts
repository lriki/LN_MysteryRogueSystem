
export type DClassId = number;

export interface DClassLearningSkill {
    level: number;
    note: string;
    skillId: number;
}

export class DClass {
    /** ID (0 is Invalid). */
    id: DClassId;

    /** Name */
    name: string;

    /** IDataClass.expParams */
    expParams: number[];

    /** IDataClass.params -> mhp,mmp,atk,def,mat,mdf,agi,luk (DParamId とは関係ない点に注意) */
    params: number[][];

    traits: IDataTrait[];

    learnings: DClassLearningSkill[];

    public constructor(id: DClassId) {
        this.id = 0;
        this.name = "null";
        this.expParams = [];
        this.params = [];
        this.traits = [];
        this.learnings = [];
    }
}
