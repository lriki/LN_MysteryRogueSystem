
export type DClassId = number;

export interface DClass {
    /** ID (0 is Invalid). */
    id: DClassId;

    /** Name */
    name: string;

    /** IDataClass.expParams */
    expParams: number[];

    /** IDataClass.params -> mhp,mmp,atk,def,mat,mdf,agi,luk */
    params: number[][];

    traits: IDataTrait[];
}

export const DClass_Default: DClass = {
    id: 0,
    name: "null",
    expParams: [],
    params: [],
    traits: [],
};

