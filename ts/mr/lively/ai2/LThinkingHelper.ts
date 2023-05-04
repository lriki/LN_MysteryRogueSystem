import { SAIHelper } from "ts/mr/system/SAIHelper";
import { UAction } from "ts/mr/utility/UAction";
import { UBlock } from "ts/mr/utility/UBlock";
import { UMovement } from "ts/mr/utility/UMovement";
import { LMovingMethod } from "../ai/LMoveDeterminer";
import { HMovement } from "../helpers/HMovement";
import { LEntity } from "../entity/LEntity";
import { LMap, MovingMethod } from "../LMap";
import { LRandom } from "../LRandom";
import { LThinkingAgent } from "./LThinkingAgent";

export interface ThinkMovingResult {
    mx?: number;    // -1 の場合、 wait
    my?: number;
    dir?: number;
};

export class LThinkingHelper {

    
    public static decideTargetPosition(agent: LThinkingAgent, self: LEntity, map: LMap): ThinkMovingResult | undefined {

        
        const target = UAction.findInSightNearlyHostileEntity(self);
        if (target) {
            // 逃げたい Unit が視界内にいる。（部屋内・通路内は問わない）


            const block = map.block(self.mx, self.my);
            const room = map.room(block._roomId);

            // 自分が部屋内の入り口に立っていて、隣接する通路は逃げても大丈夫そうなら、通路へ逃げ込む
            if (block.isRoomInnerEntrance()) {
                const roomOuterEntrance = UBlock.adjacentBlocks4(map, block.mx, block.my).find(x => x.isPassageway());
                if (roomOuterEntrance && !this.checkDeadInArea(self, target, roomOuterEntrance.mx, roomOuterEntrance.my)) {
                    return { mx: roomOuterEntrance.mx, my: roomOuterEntrance.my };
                }
            }


            // 
            const safetyInnerRoomEntrance = room.getRoomInnerEntranceBlocks()
                .filter(b =>
                    !this.checkDeadInArea(self, target, b.mx, b.my) &&    // block は敵対の向こう側にあるのでそっちは除外
                    (b.mx != self.mx || b.my != self.my))                   // 足元は除外
                .selectMin((a, b) => UMovement.distanceSq(a.mx, a.my, b.mx, b.my));
                
            if (safetyInnerRoomEntrance) {
                // 相手に対して、背面等に通路がある。そこを目指す。
                //this._movingHelper.setTargetPosition(doorway.x(), doorway.y());
                return { mx: safetyInnerRoomEntrance.mx, my: safetyInnerRoomEntrance.my };
            }
            else {
                // 相手が通路側に立ちふさがっている場合など

                const rdir = SAIHelper.entityDistanceToDir(target, self);
                const dir = SAIHelper.entityDistanceToDir(self, target);
                
                // まず背面にまったく移動できないかチェック
                const blocks = UMovement.getWay3FrontBlocks(self, rdir);
                if (!blocks.find(b => HMovement.checkPassageBlockToBlock(self, block, b, MovingMethod.Walk))) {

                    if (!UMovement.checkAdjacentPositions(self.mx, self.my, target.mx, target.my)) {
                        // 隣接していなければ相手を向いて待機。
                        // 消費 Token を Major にしてしまうと、倍速1回行動の時に上手く動かないので Minor で消費する。
                        // cctx.postActivity(
                        //     LActivity.make(self)
                        //     .withEntityDirection(dir)
                        //     .withConsumeAction(LActionTokenConsumeType.MinorActed));
                        // return true;
                        return { dir: dir };
                    }
                    else {
                        // 観念して通常の移動を行う
                        const doorway = agent.rand.selectOrUndefined(room.getRoomInnerEntranceBlocks());
                        if (doorway) {
                            // 出口を目的地設定して移動
                            return { mx: doorway.mx, my: doorway.my };
                        }
                        else {
                            // 出口の無い部屋。通常の移動プロセスにしたがう
                        }
                    }
                }
                else {
                    // 後ろに逃げるスペースがあるなら、左折の法則で逆方向に逃げる
                    const block2 = UMovement.getMovingCandidateBlockAsLHRule(self, rdir);
                    if (block2) {
                        return { mx: block2.mx, my: block2.my };
                    }
                    else {
                        throw new Error("Unreachable");
                    }

                    // if (block2) {
                    //     cctx.postActivity(
                    //         LActivity.makeMoveToAdjacentBlock(self, block2)
                    //         .withEntityDirection(rdir)
                    //         .withConsumeAction(LActionTokenConsumeType.MinorActed));
                    //     return true;
                    // }
                    // else {
                    //     throw new Error("Unreachable");
                    // }
                }
                
                
                /*
                const dir = SAIHelper.entityDistanceToDir(target, self);
                if (UMovement.checkPassageToDir(self, dir)) {
                    cctx.postActivity(
                        LActivity.makeMoveToAdjacent(self, dir)
                        .withEntityDirection(dir)
                        .withConsumeAction());
                    return SPhaseResult.Handled;
                }
                */

            }

        }

        return undefined;
    }

    
    // (mx, my) は subject から見て、hostileEntity の背面(向こう側)にあるかを判断する。
    // そっちの方向には行きたくない判断に使う。
    private static checkDeadInArea(subject: LEntity, hostileEntity: LEntity, mx: number, my: number): boolean {
        const sx = subject.mx;
        const sy = subject.my;
        const ex = hostileEntity.mx;
        const ey = hostileEntity.my;
        const dx = Math.abs(sx - ex);
        const dy = Math.abs(sy - ey);

        const checkH = () => {
            if (sx < ex) {          // 自分が敵の左側
                if (ex <= mx) {      // 相手の立っている位置とその右側はすべて Dead
                    return true;
                }
            }
            else if (ex < sx) {     // 自分が敵の右側
                if (mx <= ex) {      // 相手の立っている位置とその左側はすべて Dead
                    return true;
                }
            }
            else {
                // 同一座標はセーフ
            }
        };

        const checkV = () => {
            if (sy < ey) {          // 自分が敵の上側
                if (ey <= my) {      // 相手の立っている位置とその下側はすべて Dead
                    return true;
                }
            }
            else if (ey < sy) {     // 自分が敵の下側
                if (my <= ey) {      // 相手の立っている位置とその上側はすべて Dead
                    return true;
                }
            }
            else {
                // 同一座標はセーフ
            }
        };

        if (UMovement.distanceSq(sx, sy, mx, my) <= UMovement.distanceSq(ex, ey, mx, my)) {
            return false;
        }
        
        if (dx > dy) {
            if (checkH()) return true;
        }
        else if (dx < dy) {
            if (checkV()) return true;
        }
        else {
            if (checkH()) return true;
            if (checkV()) return true;
        }

        return false;
    }


    // public static thinkMoving(self: LEntity, prevTargetMX: number, prevTargetMY: number, rand: LRandom, map: LMap): void {
    //     //const block = MRLively.mapView.currentMap.block(self.mx, self.my);
    //     const block = map.block(self.mx, self.my);
    //     const hasDestination = (prevTargetMX >= 0 && prevTargetMY >= 0);

    //     if (!hasDestination) {
    //         if (!block.isRoom()) {
    //             // 目的地なし, 現在位置が通路・迷路
    //             // => 左折の法則による移動
    //             this._decired = { method: LMovingMethod.LHRule };
    //             return;
    //         }
    //         else {
    //             const room = MRLively.mapView.currentMap.room(block._roomId);
    //             if (!block.isRoomInnerEntrance()) {
    //                 // 目的地なし, 現在位置が部屋
    //                 // => ランダムな入口を目的地に設定し、目的地に向かう移動。
    //                 // => 入口が無ければ左折の法則による移動
    //                 const block = this.findTargetRoomInnerEntranceBlock(self, rand, room)
    //                 if (block) {
    //                     this._targetPositionX = block.mx;
    //                     this._targetPositionY = block.my;
    //                     this._decired = { method: LMovingMethod.ToTarget };
    //                     return;
    //                 }
    //                 else {
    //                     // 入り口のない部屋。左折の法則による移動を継続する。
    //                     this._decired = { method: LMovingMethod.LHRule };
    //                     return;
    //                 }
    //             }
    //             else {
    //                 // 目的地なし, 現在位置が部屋の入口
    //                 // => 現在位置以外のランダムな入口を目的地に設定し、左折の法則による移動
    //                 // => 他に入口がなければ逆方向を向き、左折の法則による移動
    //                 const block = this.findTargetRoomInnerEntranceBlock(self, rand, room)
    //                 if (block) {
    //                     this._targetPositionX = block.mx;
    //                     this._targetPositionY = block.my;
    //                 }
    //                 else {
    //                     self.dir = UMovement.reverseDir(self.dir);
    //                 }

    //                 this._decired = { method: LMovingMethod.LHRule };
    //                 return;
    //             }
    //         } 
    //     }
    //     else if (!this.canModeToTarget(self)) {
    //         // 目的地あり 目的地が現在位置
    //         // => 目的地を解除し、左折の法則による移動
    //         this.clearTargetPosition();

    //         // これは SFC シレン Wiki には乗っていない細工。
    //         // 部屋内から目的地にたどり着いたとき、現在の向きと通路の方向が直角だと、左折の法則で通路に侵入できなくなる。
    //         // 対策として、このときは隣接している通路ブロックへの移動を優先する。
    //         const blocks = UMovement.getMovableAdjacentTiles(self).filter(b => b.isPassageway());
    //         if (blocks.length > 0) {
    //             this._decired = { method: LMovingMethod.ToTarget, passageway: blocks[rand.nextIntWithMax(blocks.length)] };
    //             return;
    //         }
    //         else {
    //             this._decired = { method: LMovingMethod.LHRule };
    //             return;
    //         }
    //     }
    //     else {
    //         // 目的地あり 目的地が現在位置でない
    //         // => 目的地に向かう移動 (moveToTarget() で移動)
    //         this._decired = { method: LMovingMethod.ToTarget };
    //         return;
    //     }
    // }
}
