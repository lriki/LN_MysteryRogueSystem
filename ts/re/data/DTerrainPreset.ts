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

export interface DForceTerrainRoomShape {
    typeName: string;
}

export interface DTerrainStructureDef {
    typeName: string;
    rate: number;
}

export interface DForceTerrainStructure {
    typeName: string;
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
    forceRoomShapes: DForceTerrainRoomShape[];
    structureDefs: DTerrainStructureDef[];
    forceStructures: DForceTerrainStructure[];
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
        this.forceRoomShapes = [];
        this.structureDefs = [{typeName: "default", rate: 5}];
        this.forceStructures = [];
        this.shopDefs = [{typeName: "default", rate: 5}];
        this.monsterHouseDefs = [{typeName: "default", rate: 5}];
    }
}
