
export type DEquipmentPartId = number;

/**
 * 装備部位。slot の種類を表す。
 * 
 * RMMZ の装備タイプからインポートしてくるが、RMMZ のとは少し使い勝手が異なるので注意。
 * 例えば二刀流を実現する装備スロットは、「武器」「盾」という考え方ではなく、「右手」「左手」という考え方をする。
 * 
 * 装備スロットのシステム上は、武器や盾は PrimaryHand, SecondaryHand どちらに装備してもかまわない。
 * 装備可能かの制御は Trait で行う。
 * そのため極端な話、腕をもう一本生やして武器を持たせたり、頭にドリルをつけたりするのも可能。
 * 
 */
export interface DEquipmentPart {
    
    /** ID (0 is Invalid). */
    id: DEquipmentPartId;

    /** Name. */
    name: string;

    

}

export const DEquipmentPart_Default: DEquipmentPart = {
    id: 0,
    name: "null",
};
