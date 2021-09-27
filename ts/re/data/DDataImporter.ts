import { assert } from "../Common";
import { DLand } from "./DLand";
import { REData } from "./REData";
import { REDataManager } from "./REDataManager";

export class DDataImporter {

    // ここではまずマップ ID の関連付けのみ行う。
    public static importMapData(data: IDataMapInfo, parent1: IDataMapInfo, parent2: IDataMapInfo | undefined): void {

        // 出現テーブルは当初単一のマップであったが、次のような理由で分けることにした。
        // - Shop 対応を始めたことでテーブルが非常に大きくなり始め、編集が大変になってきた。
        // - 単一の出現テーブルで、ある Entity の出現領域を細かく制御するのが難しい。
        if (parent1.name.includes("[Tables]")) {
            const land = this.findLand(parent2);
            if (land) {
                if (data.name.includes("EventTable")) {
                    land.eventTableMapId = data.id;
                }
                if (data.name.includes("EnemyTable")) {
                    land.enemyTableMapId = data.id;
                }
                else if (data.name.includes("ItemTable")) {
                    land.itemTableMapId = data.id;
                }
                else if (data.name.includes("TrapTable")) {
                    land.trapTableMapId = data.id;
                }
                else if (data.name.includes("ShopTable(Default)")) { // 店売りアイテム
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("ShopTable(Peddler)")) { // 行商人アイテム
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("ShopTable(Weapon)")) { // 専門店アイテム (武器)
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("ShopTable(Luxury)")) { // 高級店アイテム
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("RandomPotTable")) {    // 変化の壺
                    throw new Error("Not implemented.");
                }
            }
        }
    }

    public static beginLoadLandDatabase(land: DLand): void {
        if (land.rmmzMapId > 0) REDataManager.beginLoadMapData(land.rmmzMapId, (data: any) => { land.import(data); });
        //if (land.enemyTableMapId > 0) REDataManager.beginLoadMapData(land.enemyTableMapId, (data: any) => { land.appearanceTable = DLand.buildAppearanceTable(data, land.enemyTableMapId, land.floorInfos.length); });
    }

    private static findLand(data: IDataMapInfo | undefined): DLand | undefined {
        if (!data) return undefined;
        return REData.lands.find(x => data && x.rmmzMapId == data.id);
    }
}

