import { REBasics } from "./data/REBasics";
import { REData } from "./data/REData";
import { LBattlerBehavior } from "./objects/behaviors/LBattlerBehavior";
import { TileShape } from "./objects/LBlock";
import { LEntity } from "./objects/LEntity";
import { LMap } from "./objects/LMap";
import { REGame } from "./objects/REGame";
import { RESystem } from "./system/RESystem";
import { SDebugHelpers } from "./system/SDebugHelpers";


function entities(domain?: string): LEntity[] {
    if (domain == "world") {
        //return REGame.world.entities();
        throw new Error("Not implemented.");
    }
    else {
        return REGame.map.entities();
    }
}

function mapInfo(): LMap {
    return REGame.map;
}

function setHP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
}

function setFP(entityId: number, value: number) {
    const e = REGame.world.entityByIndex(entityId);
    SDebugHelpers.setFP(e, value);
}

function setVariable(id: number, value: number) {
    $gameVariables.setValue(id, value);
}

/**
 * 
 * @param entityId 
 * @param pattern id, name, key
 */
function addState(entityId: number, pattern: string) {
    const e = REGame.world.entityByIndex(entityId);
    e.addState(REData.getState(pattern).id);
}

function visitAll() {
    addState(REGame.system.mainPlayerEntityId.index2(), "UT気配察知");
    addState(REGame.system.mainPlayerEntityId.index2(), "UT道具感知");
    REGame.map.blocks().forEach(b => b._passed = true);
    RESystem.minimapData.setRefreshNeeded();
}

function levelMax() {
    const player = REGame.camera.focusedEntity();
    if (player) {
        player.setActualParam(REBasics.params.level, 99);
    }
}




(window as any).MR = {
    entities: entities,
    mapInfo: mapInfo,
    setHP: setHP,
    setFP: setFP,
    addState: addState,
    visitAll: visitAll,
    setVariable: setVariable,
    levelMax: levelMax,

};

export {}
