import { assert } from "./Common";
import { RE_Data_EntityKind, RE_Data_Actor, RE_Data_Land, RE_Data_Floor } from "./Data";

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
    
    
    static actors: RE_Data_Actor[] = [];
    static entityKinds: RE_Data_EntityKind[] = [];
    static lands: RE_Data_Land[] = [];
    static floors: RE_Data_Floor[] = [];

    static addEntityKind(name: string): number {
        const newId = this.entityKinds.length + 1;
        this.entityKinds.push({
            id: newId,
            name: name
        });
        return newId;
    }
    
    static addLand(mapId: number): number {
        const newId = this.lands.length + 1;
        this.lands.push({
            id: newId,
            mapId: mapId,
            eventTableMapId: 0,
            itemTableMapId: 0,
            enemyTableMapId: 0,
            trapTableMapId: 0,
        });
        return newId;
    }
}


export class RE_DataManager
{
    static loadData(): void
    {
        console.log("RE_DataManager.loadData");

        RE_Data.addEntityKind("null");
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
        
        // Import Actors
        RE_Data.actors = $dataActors.map((x) => {
            if (x) 
                return {
                    id: x.id ?? 0,
                    name: x.name ?? "",
                };
            else
                return { id: 0, name: "null" };
        });

        // Import Lands
        // 最初に Land を作る
        RE_Data.addLand(0); // dummy
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info && info.name?.startsWith("RELand:")) {
                RE_Data.addLand(i);
            }
        }
        // 次に parent が Land である Map から Floor 情報を作る
        for (var i = 0; i < $dataMapInfos.length; i++) {
            const info = $dataMapInfos[i];
            if (info) {
                const land = RE_Data.lands.find(x => info.parentId && x.mapId == info.parentId);
                if (land) {
                    if (info.name?.startsWith("Event")) {
                        land.eventTableMapId = i;
                    }
                    else if (info.name?.startsWith("Item")) {
                        land.itemTableMapId = i;
                    }
                    else if (info.name?.startsWith("Enemy")) {
                        land.enemyTableMapId = i;
                    }
                    else if (info.name?.startsWith("Trap")) {
                        land.trapTableMapId = i;
                    }
                }
            }
        }

        console.log("lands:", RE_Data.lands);
    }


}
