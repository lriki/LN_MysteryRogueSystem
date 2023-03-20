import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UMovement } from "ts/mr/utility/UMovement";
import { LMovingMethod } from "../ai/LMoveDeterminer";
import { LBlockHelper } from "../helpers/LBlockHelper";
import { LBlock } from "../LBlock";
import { LEntity } from "../LEntity";
import { LRandom } from "../LRandom";
import { LRoom } from "../LRoom";
import { MRLively } from "../MRLively";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";

@MRSerializable
export class LThinkingDeterminer_Wandering extends LThinkingDeterminer {

    override clone(): LThinkingDeterminer_Wandering {
        return new LThinkingDeterminer_Wandering();
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        
        agent.addCandidateAction(
            new LThinkingAction(
            { 
                conditionParam1: undefined,
                conditionParam2: undefined,
                conditionType: undefined,
                rating: LThinkingActionRatings.Moving,
                skillId: MRData.system.skills.move,
            },
            [])
        );
        this.thinkMoving(agent, self);
        return SPhaseResult.Handled;
    }
    
    public thinkMoving(agent: LThinkingAgent, self: LEntity): void {
        const rand = agent.rand;
        const map = MRLively.mapView.currentMap; 
        const block = map.block(self.mx, self.my);

        if (!agent.hasWanderingDestination()) {
            if (!block.isRoom()) {
                // 目的地なし, 現在位置が通路・迷路
                // => 左折の法則による移動
                agent._decired = { method: LMovingMethod.LHRule };
                return;
            }
            else {
                const room = MRLively.mapView.currentMap.room(block._roomId);
                if (!block.isRoomInnerEntrance()) {
                    // 目的地なし, 現在位置が部屋
                    // => ランダムな入口を目的地に設定し、目的地に向かう移動。
                    // => 入口が無ければ左折の法則による移動
                    const block = this.findTargetRoomInnerEntranceBlock(self, rand, room);
                    if (block) {
                        agent._wanderingTargetX = block.mx;
                        agent._wanderingTargetY = block.my;
                        agent._decired = { method: LMovingMethod.ToTarget };
                        return;
                    }
                    else {
                        // 入り口のない部屋。左折の法則による移動を継続する。
                        agent._decired = { method: LMovingMethod.LHRule };
                        return;
                    }
                }
                else {
                    // 目的地なし, 現在位置が部屋の入口
                    // => 現在位置以外のランダムな入口を目的地に設定し、左折の法則による移動
                    // => 他に入口がなければ逆方向を向き、左折の法則による移動
                    const block = this.findTargetRoomInnerEntranceBlock(self, rand, room)
                    if (block) {
                        agent._wanderingTargetX = block.mx;
                        agent._wanderingTargetY = block.my;
                    }
                    else {
                        self.dir = UMovement.reverseDir(self.dir);
                    }

                    agent._decired = { method: LMovingMethod.LHRule };
                    return;
                }
            } 
        }
        else if (!this.canModeToTarget(agent, self)) {
            // 目的地あり 目的地が現在位置
            // => 目的地を解除し、左折の法則による移動
            agent.clearTargetPosition();

            // これは SFC シレン Wiki には乗っていない細工。
            // 部屋内から目的地にたどり着いたとき、現在の向きと通路の方向が直角だと、左折の法則で通路に侵入できなくなる。
            // 対策として、このときは隣接している通路ブロックへの移動を優先する。
            const blocks = UMovement.getMovableAdjacentTiles(self).filter(b => b.isPassageway());
            if (blocks.length > 0) {
                agent._decired = { method: LMovingMethod.ToTarget, passageway: blocks[rand.nextIntWithMax(blocks.length)] };
                return;
            }
            else {
                agent._decired = { method: LMovingMethod.LHRule };
                return;
            }
        }
        else {
            // 目的地あり 目的地が現在位置でない
            // => 目的地に向かう移動 (moveToTarget() で移動)
            agent._decired = { method: LMovingMethod.ToTarget };
            return;
        }
    }
    

    private canModeToTarget(agent: LThinkingAgent, self: LEntity): boolean {
        return agent.hasWanderingDestination() && (self.mx != agent._wanderingTargetX || self.my != agent._wanderingTargetY);
    }

    private findTargetRoomInnerEntranceBlock(self: LEntity, rand: LRandom, room: LRoom): LBlock | undefined {
        const candidates1 = room.getRoomInnerEntranceBlocks().filter(b => b.mx != self.mx || b.my != self.my);    // 足元フィルタ
        if (candidates1.length <= 0) return undefined;

        const candidates2: LBlock[] = [];
        for (const block of candidates1) {
            if (LBlockHelper.hasHostileFootpoint(block, self.getInnermostFactionId())) {
                candidates2.push(block);
            }
        }
        if (candidates2.length > 0) {
            return LBlockHelper.selectNearestBlock(candidates2, self);
        }
        else {
            const block = candidates1[rand.nextIntWithMax(candidates1.length)];
            return block;
        }
    }
}

