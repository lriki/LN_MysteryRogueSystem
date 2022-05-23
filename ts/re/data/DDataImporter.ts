import { DHelpers } from "./DHelper";
import { DLand } from "./DLand";
import { DMap, REData } from "./REData";

export class DDataImporter {

    // ここではまずマップ ID の関連付けのみ行う。
    public static importMapData(mapData: DMap, data: IDataMapInfo, parent1: IDataMapInfo, parent2: IDataMapInfo | undefined): void {

        // 出現テーブルは当初単一のマップであったが、次のような理由で分けることにした。
        // - Shop 対応を始めたことでテーブルが非常に大きくなり始め、編集が大変になってきた。
        // - 単一の出現テーブルで、ある Entity の出現領域を細かく制御するのが難しい。
        if (parent1.name.includes("[Table]")) {
            const land = this.findLand(parent2);
            if (land) {
                if (data.name == "Event") {
                    land.eventTableMapId = data.id;
                }
                else if (data.name == "Enemy") {
                    land.enemyTableMapId = data.id;
                }
                else if (data.name == "Item") {
                    land.itemTableMapId = data.id;
                }
                else if (data.name == "Trap") {
                    land.trapTableMapId = data.id;
                }
                else if (data.name == "Shop") { // 店売りアイテム
                    land.shopTableMapId = data.id;
                }
                else if (data.name.includes("Shop(Peddler)")) { // 行商人アイテム
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("Shop(Weapon)")) { // 専門店アイテム (武器)
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("Shop(Luxury)")) { // 高級店アイテム
                    throw new Error("Not implemented.");
                }
                else if (data.name.includes("RandomPot")) {    // 変化の壺
                    throw new Error("Not implemented.");
                }
            }
        }
        else if (parent1.name.includes("[System]")) {
            const land = this.findLand(parent2);
            if (land) {
                if (data.name == "ExitMap") {
                    land.exitRMMZMapId = data.id;
                }
            }
        }
        else if (parent1.name.includes("[Event]")) {
            mapData.eventMap = true;
            mapData.landId = DHelpers.RmmzNormalMapLandId;
        }
    }


    private static findLand(data: IDataMapInfo | undefined): DLand | undefined {
        if (!data) return undefined;
        return REData.lands.find(x => data && x.rmmzMapId == data.id);
    }
}

