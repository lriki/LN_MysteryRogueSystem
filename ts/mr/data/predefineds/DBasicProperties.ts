import { DSequel, DSequelId } from "../DSequel";



export interface EntityProperty {
    id: number;
    defaultValue: any;
}

// Entity の基本プロパティのうち、Behavior によってオーバーライドされることがあるもの。
// 特に、他の状態に依存して変わる可能性がある状態を返すために使う。
export interface EntityProperties {
    /**
     * DEquipmentPartId[]
     */
    equipmentSlots: number;

}


