import { assert, MRSerializable, tr2 } from "ts/re/Common";
import { DMonsterHouseType, DMonsterHouseTypeId } from "ts/re/data/DMonsterHouse";
import { DFactionId, MRData } from "ts/re/data/MRData";
import { Helpers } from "ts/re/system/Helpers";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { MonsterHouseState } from "../LRoom";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LStructure } from "./LStructure";
import { SSoundManager } from "ts/re/system/SSoundManager";
import { LRoomId } from "../LCommon";

@MRSerializable
export class LMonsterHouseStructure extends LStructure {
    private _roomId: LRoomId = 0
    private _monsterHouseTypeId: DMonsterHouseTypeId = 0;
    private _monsterHouseFactionId: DFactionId = 0;
    private _monsterHouseState: MonsterHouseState = MonsterHouseState.Sleeping;

    // モンスターハウスの巻物などで動的に生成されることもあるため、FMonsterHouseStructure は参照しないようにする
    public setup(roomId: LRoomId, monsterHouseTypeId: DMonsterHouseTypeId): void {
        this._roomId = roomId;
        this._monsterHouseTypeId = monsterHouseTypeId;
        this._monsterHouseFactionId = MRData.system.factions.enemy;
        this._monsterHouseState = MonsterHouseState.Sleeping;
    }

    public roomId(): LRoomId {
        return this._roomId;
    }

    public monsterHouseTypeId(): DMonsterHouseTypeId {
        return this._monsterHouseTypeId;
    }

    public monsterHouseData(): DMonsterHouseType {
        return MRData.monsterHouses[this._monsterHouseTypeId];
    }

    public monsterHouseFactionId(): DFactionId {
        return this._monsterHouseFactionId;
    }

    public monsterHouseState(): MonsterHouseState {
        return this._monsterHouseState;
    }

    public startMonsterHouse(cctx: SCommandContext): void {
        assert(this._monsterHouseTypeId > 0);
        assert(this._monsterHouseState == MonsterHouseState.Sleeping);

        cctx.postWaitSequel();
        cctx.postMessage(tr2("モンスターハウスだ！"));
        SSoundManager.playBgm(this.monsterHouseData().bgm);

        this._monsterHouseState = MonsterHouseState.Activated;
    }
    
    onEntityLocated(cctx: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.mx, entity.my);
        if (block._roomId == this._roomId) {
            // モンスターハウスから見て、侵入してきた entity が敵対関係にあれば、起動する
            if (Helpers.isHostileFactionId(this.monsterHouseFactionId(), entity.getOutwardFactionId()) &&
                this.monsterHouseState() == MonsterHouseState.Sleeping) {
                this.startMonsterHouse(cctx);
            }
        }
    }
}
