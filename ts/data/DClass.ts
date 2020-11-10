
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
}
