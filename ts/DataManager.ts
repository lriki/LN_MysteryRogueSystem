import { assert } from "./Common";
import { RE_Data_EntityKind } from "./Data";

export class RE_Data
{
    // Standard entity kinds.
    static WeaponKindId: number;
    static ShieldKindId: number;
    static ArrowKindId: number;
    static BraceletKindId: number;
    static FoodKindId: number;
    static HerbKindId: number;
    static ScrollKindId: number;
    static WandKindId: number;
    static PotKindId: number;
    static DiscountTicketKindId: number;
    static BuildingMaterialKindId: number;
    static TrapKindId: number;
    static FigurineKindId: number;
    static MonsterKindId: number;
    
    
    static itemGroups: RE_Data_EntityKind[];

    static addEntityKind(name: string): number {
        const newId = this.itemGroups.length + 1;
        this.itemGroups.push({
            id: newId,
            name: name
        });
        return newId;
    }
}


export class RE_DataManager
{
    static loadData(): void
    {
        console.log("RE_DataManager.loadData");

        RE_Data.WeaponKindId = RE_Data.addEntityKind("武器");
        RE_Data.ShieldKindId = RE_Data.addEntityKind("盾");
        RE_Data.ArrowKindId = RE_Data.addEntityKind("矢");
        //RE_Data.addEntityKind("石");
        //RE_Data.addEntityKind("弾");
        RE_Data.BraceletKindId = RE_Data.addEntityKind("腕輪");
        RE_Data.FoodKindId = RE_Data.addEntityKind("食料");
        RE_Data.HerbKindId = RE_Data.addEntityKind("草");
        RE_Data.ScrollKindId = RE_Data.addEntityKind("巻物");
        RE_Data.WandKindId = RE_Data.addEntityKind("杖");
        RE_Data.PotKindId = RE_Data.addEntityKind("壺");
        RE_Data.DiscountTicketKindId = RE_Data.addEntityKind("割引券");
        RE_Data.BuildingMaterialKindId = RE_Data.addEntityKind("材料");
        RE_Data.TrapKindId = RE_Data.addEntityKind("罠");
        RE_Data.FigurineKindId = RE_Data.addEntityKind("土偶");
        RE_Data.MonsterKindId = RE_Data.addEntityKind("モンスター");
    }


}
