import { assert } from "ts/re/Common";
import { REData } from "../REData";

// interface DBTerrainSettingRef {
//     terrainSettingsKey: string;
//     rate: number;
// }

interface DBTerrainSetting {
    shapes: Map<string, number>;
    structures: Map<string, number>;
}

interface DBTerrainSettingDB {
    terrainSettings: Map<string, DBTerrainSetting>;
}

export class DTerrainSettingImporter {
    private _db: DBTerrainSettingDB;

    public constructor(script: string) {
        let db: any = {};
        eval(script);
        assert(db);
        this._db = db;
        this.import();
    }

    private import(): void {
        for (const pair1 of Object.entries(this._db.terrainSettings)) {
            const key = pair1[0] as string;
            const preset = pair1[1] as DBTerrainSetting;
            const data = REData.newTerrainSetting(key);
            
            // shapes
            for (const [shapeKey, rate] of Object.entries(preset.shapes)) {
                const dataId = REData.getTerrainShape(shapeKey).id;
                data.shapeRefs.push({dataId: dataId, rate: rate}); 
            }

            // structures
            if (preset.structures) {
                for (const [name, rate] of Object.entries(preset.structures)) {
                    data.forceStructures.push({typeName: name, rate: (rate as number) * 100}); 
                }
            }
        }
    }
}
