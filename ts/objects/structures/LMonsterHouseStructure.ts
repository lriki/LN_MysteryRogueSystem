import { assert } from "ts/Common";
import { DBasics } from "ts/data/DBasics";
import { DMonsterHouseId } from "ts/data/DMonsterHouse";
import { DFactionId } from "ts/data/REData";
import { FMonsterHouseStructure } from "ts/floorgen/FStructure";
import { Helpers } from "ts/system/Helpers";
import { SCommandContext } from "ts/system/SCommandContext";
import { LUnitAttribute } from "../attributes/LUnitAttribute";
import { MonsterHouseState } from "../LRoom";
import { REGame } from "../REGame";
import { LRoomId } from "../LBlock";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";

export class LMonsterHouseStructure extends LStructure {
    private _roomId: LRoomId = 0
    private _monsterHouseTypeId: DMonsterHouseId = 0;
    private _monsterHouseFactionId: DFactionId = 0;
    private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    public setup(structure: FMonsterHouseStructure): void {
        this._roomId = structure.roomId();
        this._monsterHouseTypeId = structure.monsterHouseTypeId();
        this._monsterHouseFactionId = DBasics.factions.enemy;
        this._monsterHouseState = MonsterHouseState.Sleeping;
    }

    public monsterHouseTypeId(): DMonsterHouseId {
        return this._monsterHouseTypeId;
    }

    public monsterHouseFactionId(): DFactionId {
        return this._monsterHouseFactionId;
    }

    public monsterHouseState(): MonsterHouseState {
        return this._monsterHouseState;
    }

    public startMonsterHouse(context: SCommandContext): void {
        assert(this._monsterHouseTypeId > 0);
        assert(this._monsterHouseState == MonsterHouseState.Sleeping);

        context.postWaitSequel();
        context.postMessage("モンスターハウスだ！");

        this._monsterHouseState = MonsterHouseState.Activated;
    }
    
    onEntityLocated(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        if (block._roomId == this._roomId) {

            const attr = entity.findAttribute(LUnitAttribute);
            // モンスターハウスから見て、侵入してきた entity が敵対関係にあれば、起動する
            if (attr &&
                Helpers.isHostileFactionId(this.monsterHouseFactionId(), attr.factionId()) &&
                this.monsterHouseState() == MonsterHouseState.Sleeping) {
                this.startMonsterHouse(context);
            }
        }
    }
}
