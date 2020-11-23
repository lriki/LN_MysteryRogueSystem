import { DEffect } from "./DSkill";

export type DItemDataId = number;

export interface DItem {
    /** ID (0 is Invalid). */
    id: DItemDataId;

    /** Name */
    name: string;

    effect: DEffect;
}


