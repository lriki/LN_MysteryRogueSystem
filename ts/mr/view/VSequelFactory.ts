
import { VSequel } from "ts/mr/view/VSequel";
import { VCollapseSequel } from "./sequels/VCollapseSequel";
import { VAttackSequel } from "./sequels/AttackSequel";
import { VBlowMoveSequel } from "./sequels/VBlowMoveSequel";
import { REVisualSequel_Move } from "./sequels/VMoveSequel";
import { DSequelId } from "ts/mr/data/DSequel";
import { VIdleSequel } from "./sequels/VIdleSequel";
import { MRData } from "ts/mr/data/MRData";
import { VAsleepSequel } from "./sequels/VAsleepSequel";
import { VCommonStoppedSequel } from "./sequels/VCommonStoppedSequel";
import { VDropSequel } from "./sequels/VDropSequel";
import { VEscapeSequel } from "./sequels/VEscapeSequel";
import { VEarthquake2Sequel } from "./sequels/VEarthquake2Sequel";
import { VUseItemSequel } from "./sequels/VUseItemSequel";
import { VExplosionSequel } from "./sequels/VExplosionSequel";
import { VDownSequel } from "./sequels/VDownSequel";
import { MRBasics } from "../data/MRBasics";
import { VWarpSequel } from "./sequels/VWarpSequel";
import { VStumbleSequel } from "./sequels/VStumbleSequel";
import { VJumpSequel } from "./sequels/VJumpSequel";
import { MRView } from "./MRView";
import { VHelper } from "./VHelper";
import { VCrackSequel } from "./sequels/VCrackSequel";

/**
 */
export class VSequelFactory {
    private _visualSequelFactory: (() => VSequel)[] = [];

    constructor() {
        this._visualSequelFactory[MRBasics.sequels.idle] = () => new VIdleSequel();
        this._visualSequelFactory[MRBasics.sequels.MoveSequel] = () => new REVisualSequel_Move();
        this._visualSequelFactory[MRBasics.sequels.blowMoveSequel] = () => new VBlowMoveSequel();
        this._visualSequelFactory[MRBasics.sequels.dropSequel] = () => new VDropSequel();
        this._visualSequelFactory[MRBasics.sequels.attack] = () => new VAttackSequel();
        this._visualSequelFactory[MRBasics.sequels.CollapseSequel] = () => new VCollapseSequel();
        this._visualSequelFactory[MRBasics.sequels.commonStopped] = () => new VCommonStoppedSequel();
        this._visualSequelFactory[MRBasics.sequels.asleep] = () => new VAsleepSequel();
        this._visualSequelFactory[MRBasics.sequels.escape] = () => new VEscapeSequel();
        this._visualSequelFactory[MRBasics.sequels.earthquake2] = () => new VEarthquake2Sequel();
        this._visualSequelFactory[MRBasics.sequels.useItem] = () => new VUseItemSequel();
        this._visualSequelFactory[MRBasics.sequels.explosion] = () => new VExplosionSequel();
        this._visualSequelFactory[MRBasics.sequels.down] = () => new VDownSequel();
        this._visualSequelFactory[MRBasics.sequels.warp] = () => new VWarpSequel();
        this._visualSequelFactory[MRBasics.sequels.stumble] = () => new VStumbleSequel();
        this._visualSequelFactory[MRBasics.sequels.jump] = () => new VJumpSequel();
        this._visualSequelFactory[MRBasics.sequels.crack] = () => new VCrackSequel();
    }

    public createVisualSequel(sequelId: DSequelId): VSequel {
        const factory = this._visualSequelFactory[sequelId];
        if (factory) {
            return factory();
        }
        else {
            throw new Error(`Visual Sequel not registerd. (id: ${sequelId}, name: ${MRData.sequels[sequelId].name})`);
        }
    }

    public startFloatingAnimation(animationId: number, mx: number, my: number): void {
        const spriteset = MRView.spriteSet2;
        if (spriteset) {
            spriteset.spritesetMap.createMRFloatingAnimationSprite(
                $dataAnimations[animationId],
                VHelper.toScreenX(mx),
                VHelper.toScreenY(my, true));
        }
    }

}

