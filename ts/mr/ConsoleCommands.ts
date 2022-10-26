import { assert } from "./Common";
import { DEntityCreateInfo } from "./data/DEntity";
import { MRBasics } from "./data/MRBasics";
import { MRData } from "./data/MRData";
import { LBattlerBehavior } from "./lively/behaviors/LBattlerBehavior";
import { LInventoryBehavior } from "./lively/behaviors/LInventoryBehavior";
import { LTileShape } from "./lively/LBlock";
import { LEntity } from "./lively/LEntity";
import { LMap } from "./lively/LMap";
import { MRLively } from "./lively/MRLively";
import { SEntityFactory } from "./system/internal";
import { MRSystem } from "./system/MRSystem";
import { SDebugHelpers } from "./system/SDebugHelpers";


function entities(domain?: string): LEntity[] {
    if (domain == "world") {
        //return REGame.world.entities();
        throw new Error("Not implemented.");
    }
    else {
        return MRLively.map.entities();
    }
}

function mapInfo(): LMap {
    return MRLively.map;
}

function setHP(entityId: number, value: number) {
    const e = MRLively.world.entityByIndex(entityId);
    SDebugHelpers.setHP(e, value);
}

function setFP(entityId: number, value: number) {
    const e = MRLively.world.entityByIndex(entityId);
    SDebugHelpers.setFP(e, value);
}

function setPlayerParameter(key: string, value: number) {
    const player = MRLively.camera.focusedEntity();
    if (!player) return;
    player.setParamCurrentValue(MRData.parameter(key).id, value);
}

function setVariable(id: number, value: number) {
    $gameVariables.setValue(id, value);
}

/**
 * 
 * @param entityId 
 * @param pattern id, name, key
 */
function addState(entityKey: string, stateKey: string) {
    const e = MRLively.world.getFirstEntityByKey(entityKey);
    e.addState(MRData.getState(stateKey).id);
}

function visitAll() {
    const player = MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    player.addState(MRData.getState("UT気配察知").id);
    player.addState(MRData.getState("UT道具感知").id);
    MRLively.map.unitClarity = true;
    MRLively.map.blocks().forEach(b => b._passed = true);
    MRSystem.minimapData.setRefreshNeeded();
}

function levelMax() {
    const player = MRLively.camera.focusedEntity();
    if (player) {
        player.setParamCurrentValue(MRBasics.params.level, 99);
    }
}

function moveToExit() {
    const exitPoint = MRLively.map.entities().find(x => x.kindDataId() == MRBasics.entityKinds.exitPoint);
    if (!exitPoint) return;

    const player = MRLively.camera.focusedEntity();
    if (!player) return;

    MRLively.world.transferEntity(player, player.floorId, exitPoint.mx, exitPoint.my);
}

function addItem(itemKey: string) {
    const item = SEntityFactory.newEntity(DEntityCreateInfo.makeSingle(MRData.getEntity(itemKey).id));
    const player = MRLively.camera.focusedEntity();
    if (!player) return;
    player.getEntityBehavior(LInventoryBehavior).addEntity(item);

}

(window as any).MR = {
    entities: entities,
    mapInfo: mapInfo,
    setHP: setHP,
    setFP: setFP,
    setPlayerParameter: setPlayerParameter,
    addState: addState,
    visitAll: visitAll,
    setVariable: setVariable,
    levelMax: levelMax,
    moveToExit: moveToExit,
    addItem: addItem,
};

Object.defineProperty((window as any).MR, "player", {
    get: function(): LEntity {
        const player = MRLively.camera.focusedEntity();
        assert(player);
        return player;
    }
});

export {}
