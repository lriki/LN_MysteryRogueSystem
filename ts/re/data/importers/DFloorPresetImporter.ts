import { assert } from "ts/re/Common";
import { DTerrainSettingRef } from "../DLand";
import { REData } from "../REData";

interface DBFloorPreset {
    terrains: Map<string, number>;   // TerrainSettingKey, rate
}

interface DBFloorPresetsDB {
    floorPresets: Map<string, DBFloorPreset>;
}

export class DFloorPresetImporter {
    private _db: DBFloorPresetsDB;

    public constructor(script: string) {
        let db: any = {};
        eval(script);
        assert(db);
        this._db = db;
        this.import();
    }

    private import(): void {
        for (const pair1 of Object.entries(this._db.floorPresets)) {
            const key = pair1[0] as string;
            const preset = pair1[1] as DBFloorPreset;
            const data = REData.newFloorPreset(key);
            for (const [terrainSettingKey, rate] of Object.entries(preset.terrains)) {
                const terraintSettingId = REData.getTerrainSetting(terrainSettingKey).id;
                data.presets.push(new DTerrainSettingRef(terraintSettingId, rate)); 
            }
        }
    }


}
