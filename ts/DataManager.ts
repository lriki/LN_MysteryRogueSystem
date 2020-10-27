import { REDataManager } from "./data/REDataManager";
import { REGame } from "./RE/REGame";
import { REGameManager } from "./RE/REGameManager";
import { RMMZIntegration } from "./RMMZIntegration";

const _DataManager_loadMapData = DataManager.loadMapData;
DataManager.loadMapData = function(mapId) {
    _DataManager_loadMapData.call(DataManager, mapId);

    const land = REDataManager.findLand(mapId);
    if (land) {
        // Land マップである場合、関係するマップデータをすべて読み込む
        REDataManager.landMapDataLoading = true;
        const eventTable_filename = `Map${land.eventTableMapId.padZero(3)}.json`;
        const itemTable_filename = `Map${land.itemTableMapId.padZero(3)}.json`;
        const enemyTable_filename = `Map${land.enemyTableMapId.padZero(3)}.json`;
        const trapTable_ilename = `Map${land.trapTableMapId.padZero(3)}.json`;
        this.loadDataFile("RE_dataEventTableMap", eventTable_filename);
        this.loadDataFile("RE_dataItemTableMap", itemTable_filename);
        this.loadDataFile("RE_dataEnemyTableMap", enemyTable_filename);
        this.loadDataFile("RE_dataTrapTableMap", trapTable_ilename);
    }
    else {
        REGame.map.clear();
        REDataManager.landMapDataLoading = false;
    }
};

const _DataManager_isMapLoaded = DataManager.isMapLoaded;
DataManager.isMapLoaded = function() {
    const result = _DataManager_isMapLoaded.call(DataManager);
    if (result) {
        if (REDataManager.landMapDataLoading) {
            return !!window["RE_dataEventTableMap"] &&
                   !!window["RE_dataItemTableMap"] &&
                   !!window["RE_dataEnemyTableMap"] &&
                   !!window["RE_dataTrapTableMap"];
        }
        else {
            return true;
        }
    }
    else {
        return false;
    }
};

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(DataManager);

    REGame.integration = new RMMZIntegration();
    REGameManager.createGameObjects();
}
