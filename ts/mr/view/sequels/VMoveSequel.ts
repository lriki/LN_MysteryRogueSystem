import { assert } from "ts/mr/Common";
import { Vector2 } from "ts/mr/math/Vector2";
import { SMotionSequel } from "ts/mr/system/SSequel";
import { VKeyFrameAnimationCurve } from "../animation/VAnimation";
import { VSequel } from "../VSequel";
import { VSequelContext } from "../VSequelContext";
import { VEntity } from "../VEntity";
import { VSequelHelper } from "./VSequelHelper";

/**
 * 倍速移動など、1ターンに複数ブロックを移動する場合、その数だけ Sequel が生成される。
 * そうしないと、途中で立ち寄ったブロックを補完するようなアニメーションが表現できない。
 */
export class REVisualSequel_Move extends VSequel {
    private _curveX: VKeyFrameAnimationCurve | undefined;
    private _curveY: VKeyFrameAnimationCurve | undefined;

    onUpdate(visual: VEntity, context: VSequelContext): void {
        if (context.isFastForward()) {
            // ダッシュ中は座標をそろえて即終了
            context.unlockCamera();
            visual.resetPosition();
            context.end();
        }
        else {
            const sequel = context.sequel() as SMotionSequel;
            if (sequel.isFluidSequence()) {
                const frameCount = context.frameCount();
                if (frameCount == 0) {
                    const moveSpeed = 4;    // RMMZ の基本移動速度
                    const speed = Math.pow(2, moveSpeed) / 256;
                    const totalFrameCount = 1.0 / speed; // 水平1Tile移動に何Frame必要？
                    const oneTileFrameCount = totalFrameCount / (sequel.relatedSequels().length + 1);

                    this._curveX = new VKeyFrameAnimationCurve();
                    this._curveY = new VKeyFrameAnimationCurve();

                    const first = sequel;
                    this._curveX.addFrame(0, first.startX());
                    this._curveY.addFrame(0, first.startY());
                    this._curveX.addFrame(oneTileFrameCount, first.targetX());
                    this._curveY.addFrame(oneTileFrameCount, first.targetY());
                    for (const [index, motion] of sequel.relatedSequels().entries()) {
                        this._curveX.addFrame(oneTileFrameCount * (index + 2), motion.targetX());
                        this._curveY.addFrame(oneTileFrameCount * (index + 2), motion.targetY());
                    }
                }
                assert(this._curveX);
                assert(this._curveY);

                const x = this._curveX.evaluate(frameCount);
                const y = this._curveY.evaluate(frameCount);
                visual.setPosition(new Vector2(x, y));

                if (frameCount >= this._curveX.lastFrameTime()) { 
                    context.end();
                }
            }
            else {


                // $gamePlayer と常時同期
                context.unlockCamera();

                const targetX = sequel.targetX();//entity.x
                const targetY = sequel.targetY();//entity.y

                VSequelHelper.updateStepAnimPattern(visual);
        
                // 移動は直線距離ではなく X Y 個別に計算する。
                // 斜め移動時に速度が上がる問題であるが、複数の Entity が同時に移動するとき、
                // 軸平行・斜め問わず完了までの時間が合うようにしないと、一方の動きが遅延してしまう。
            
                const entity = visual.entity();
                const moveSpeed = 4;    // RMMZ の基本移動速度
                //const moveSpeed = 6;    // 
                const speed = Math.pow(2, moveSpeed) / 256;
                //const frameCount = 1.0 / speed; // 水平1Tile移動に何Frame必要？
        
                const velocity = Vector2.mul(Vector2.sub(new Vector2(targetX, targetY), context.startPosition()), speed);
        
                const diff = Vector2.sub(new Vector2(targetX, targetY), visual.position());
        
                if ((Math.abs(diff.x) <= speed && Math.abs(diff.y) <= speed) ||
                    context.frameCount() > 30) {    // 速度に何か異常があっても、時間経過で必ず終了させる
                    visual.setPosition(new Vector2(targetX, targetY));
                    context.end();
                }
                else {
                    visual.setPosition(Vector2.add(visual.position(), velocity));
                }
            }

        }
    }
}


