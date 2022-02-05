import { paramRandomMapDefaultHeight, paramRandomMapDefaultWidth } from "../PluginParameters";
import { DTerrainPresetId } from "./DCommon";

export enum DSectorConnectionPreset {
    Default,
    C,
    H,
    N,
    S,
    O,
    F,
    T,
}

export interface DTerrainRoomDef {
    typeName: string;
    rate: number;
}

export interface DTerrainShopDef {
    typeName: string;
    rate: number;
}

export interface DTerrainMonsterHouseDef {
    typeName: string;
    rate: number;
}

export class DTerrainPreset {
    id: DTerrainPresetId;
    key: string;
    width: number;
    height: number;
    divisionCountX: number;
    divisionCountY: number;
    connectionPreset: DSectorConnectionPreset;
    roomDefs: DTerrainRoomDef[];
    shopDefs: DTerrainShopDef[];
    monsterHouseDefs: DTerrainMonsterHouseDef[];
    
    public constructor(id: number) {
        this.id = id;
        this.key = "";
        this.width = paramRandomMapDefaultWidth;
        this.height = paramRandomMapDefaultHeight;
        this.divisionCountX = 3;
        this.divisionCountY = 3;
        this.connectionPreset = DSectorConnectionPreset.Default;
        this.roomDefs = [{typeName: "default", rate: 5}];
        this.shopDefs = [{typeName: "default", rate: 5}];
        this.monsterHouseDefs = [{typeName: "default", rate: 5}];
    }
}
