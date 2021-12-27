import { assert, RESerializable } from "ts/re/Common";
import { REData } from "ts/re/data/REData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { DRace } from "ts/re/data/DRace";

/**
 * LEntity の持つ Race に基づいて種族を表現する Behavior。
 */
@RESerializable
export class LRaceBehavior extends LBattlerBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LRaceBehavior);
        return b;
    }
    
    private races(self: LEntity): readonly DRace[] {
        return self.data().raceIds.map(x => REData.races[x]);   // TODO: data レイヤーの分は、先に結合しておいていいかも。速度的な理由で。
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        for (const race of this.races(self)) {
            for (const t of race.traits){
                result.push(t);
            }
        }
    }
}



