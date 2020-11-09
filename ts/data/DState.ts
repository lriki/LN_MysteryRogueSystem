
export type DStateId = number;

export interface DState {
    /** ID (0 is Invalid). */
    id: DStateId;

    /** Name */
    name: string;

    /** Restriction */
    restriction: number;
}
