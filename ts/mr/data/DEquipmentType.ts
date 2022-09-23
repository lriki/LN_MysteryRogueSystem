
export type DEquipmentTypeId = number;

export interface DEquipmentType {
    
    /** ID (0 is Invalid). */
    id: DEquipmentTypeId;

    /** Name. */
    name: string;


}

export const DEquipmentType_Default: DEquipmentType = {
    id: 0,
    name: "null",
};
