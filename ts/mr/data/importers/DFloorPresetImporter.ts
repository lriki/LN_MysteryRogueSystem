import { assert } from "ts/mr/Common";
import { DTerrainSettingRef } from "../DLand";
import { MRData } from "../MRData";

interface DBFloorPreset {
    terrains: Map<string, number>;   // TerrainSettingKey, rate
    monsterHouses: Map<string, number> | undefined;
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
            const data = MRData.newFloorPreset(key);

            // terrains
            for (const [terrainSettingKey, rate] of Object.entries(preset.terrains)) {
                const terraintSettingId = MRData.getTerrainSetting(terrainSettingKey).id;
                data.terrains.push(new DTerrainSettingRef(terraintSettingId, rate)); 
            }

            // monsterHouses
            if (preset.monsterHouses) {
                for (const [name, rate] of Object.entries(preset.monsterHouses)) {
                    data.monsterHouses.push({name: name, rating: rate as number}); 
                }
            }
        }
    }


}
