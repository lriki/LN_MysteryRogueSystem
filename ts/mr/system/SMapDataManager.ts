import { LMapData } from "../lively/LMapData";

export class SMapDataManager {
    private _dataList: LMapData[][] = [];   // [LandId][FloorId]

    // public loadMapData(landId: number, floorId: number): LMapData {
    //     if (this._dataList[landId] == null) {
    //         this._dataList[landId] = [];
    //     }

    //     if (this._dataList[landId][floorId] == null) {
    //         this._dataList[landId][floorId] = new LMapData(landId, floorId);
    //     }

    //     return this._dataList[landId][floorId];
    // }

    public unloadAllData(): void {
        this._dataList = [];
    }
}
