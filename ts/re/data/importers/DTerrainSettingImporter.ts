import { assert } from "ts/re/Common";

// interface DBTerrainSettingRef {
//     terrainSettingsKey: string;
//     rate: number;
// }

interface DBTerrainSetting {
    presets: Map<string, number>;   // 
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
        for (const [key, value] of Object.entries(this._db.terrainSettings)) {
        }
    }
}
