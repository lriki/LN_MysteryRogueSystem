import { assert, MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { LBehavior } from "../internal";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { LBattlerBehavior } from "./LBattlerBehavior";
import { DRace } from "ts/mr/data/DRace";

/**
 * LEntity の持つ Race に基づいて種族を表現する Behavior。
 */
@MRSerializable
export class LRaceBehavior extends LBattlerBehavior {
    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LRaceBehavior);
        return b;
    }
    
    private races(self: LEntity): readonly DRace[] {
        return self.data.raceIds.map(x => MRData.races[x]);   // TODO: data レイヤーの分は、先に結合しておいていいかも。速度的な理由で。
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        for (const race of this.races(self)) {
            for (const t of race.traits){
                result.push(t);
            }
        }
    }
}



