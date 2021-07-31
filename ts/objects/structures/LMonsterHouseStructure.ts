import { assert, tr2 } from "ts/Common";
import { DMonsterHouseType, DMonsterHouseTypeId } from "ts/data/DMonsterHouse";
import { DFactionId, REData } from "ts/data/REData";
import { FMonsterHouseStructure } from "ts/floorgen/FStructure";
import { Helpers } from "ts/system/Helpers";
import { SCommandContext } from "ts/system/SCommandContext";
import { MonsterHouseState } from "../LRoom";
import { REGame } from "../REGame";
import { LRoomId } from "../LBlock";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";

export class LMonsterHouseStructure extends LStructure {
    private _roomId: LRoomId = 0
    private _monsterHouseTypeId: DMonsterHouseTypeId = 0;
    private _monsterHouseFactionId: DFactionId = 0;
    private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    // モンスターハウスの巻物などで動的に生成されることもあるため、FMonsterHouseStructure は参照しないようにする
    public setup(roomId: LRoomId, monsterHouseTypeId: DMonsterHouseTypeId): void {
        this._roomId = roomId;
        this._monsterHouseTypeId = monsterHouseTypeId;
        this._monsterHouseFactionId = REData.system.factions.enemy;
        this._monsterHouseState = MonsterHouseState.Sleeping;
    }

    public roomId(): LRoomId {
        return this._roomId;
    }

    public monsterHouseTypeId(): DMonsterHouseTypeId {
        return this._monsterHouseTypeId;
    }

    public monsterHouseData(): DMonsterHouseType {
        return REData.monsterHouses[this._monsterHouseTypeId];
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
        context.postMessage(tr2("モンスターハウスだ！"));
        AudioManager.playBgm(this.monsterHouseData().bgm, 0);

        this._monsterHouseState = MonsterHouseState.Activated;
    }
    
    onEntityLocated(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        if (block._roomId == this._roomId) {
            // モンスターハウスから見て、侵入してきた entity が敵対関係にあれば、起動する
            if (Helpers.isHostileFactionId(this.monsterHouseFactionId(), entity.getOutwardFactionId()) &&
                this.monsterHouseState() == MonsterHouseState.Sleeping) {
                this.startMonsterHouse(context);
            }
        }
    }
}
