import { RESerializable } from "../Common";
import { REBasics } from "../data/REBasics";
import { SCommandResponse } from "../system/RECommand";
import { SCommandContext } from "../system/SCommandContext";
import { LEnemyBehavior } from "./behaviors/LEnemyBehavior";
import { LEntity } from "./LEntity";
import { LEntityId } from "./LObject";
import { REGame } from "./REGame";


/**
 * マップ上に継続的に何らかの効果を発揮する
 */
export class LFieldEffect {
    /** 指定座標がこの FieldEffect の影響範囲内であるかを確認する。 */
    onCheckIncludes(mx: number, my: number): boolean { return false; }

    /** entity が、指定座標へ歩行による移動ができるか確認する */
    onCheckPossibleMovement(entity: LEntity, mx: number, my: number): boolean { return false; }

    onStabilizeSituation(cctx: SCommandContext): SCommandResponse { return SCommandResponse.Pass; }
}

/** 聖域の効果 */
@RESerializable
export class LSanctuaryFieldEffect extends LFieldEffect {
    private _ownerEntityId: LEntityId;

    public constructor(owner: LEntity) {
        super();
        this._ownerEntityId = owner.entityId().clone();
    }

    public get owner(): LEntity {
        return REGame.world.entity(this._ownerEntityId);
    }
    
    onCheckIncludes(mx: number, my: number): boolean {
        const owner = this.owner;
        return (mx == owner.mx && my == owner.my);
    }

    onCheckPossibleMovement(entity: LEntity, mx: number, my: number): boolean {
        const owner = this.owner;
        if (entity.findEntityBehavior(LEnemyBehavior)) {
            return !(mx == owner.mx && my == owner.my)
        }
        return true;
    }

    // 歩行侵入時に以外にも Block への侵入は様々にあるので、
    // カバーしきれるように onStabilizeSituation() を使う。
    onStabilizeSituation(cctx: SCommandContext): SCommandResponse {
        const owner = this.owner;
        const block = REGame.map.tryGetBlock(owner.mx, owner.my);
        if (block) {
            for (const entity of block.getEntities()) {
                // 戦闘不能ステート 付加
                if (entity.findEntityBehavior(LEnemyBehavior)) {
                    entity.addState(REBasics.states.dead);
                }
            }
        }
        return SCommandResponse.Pass;
    }
}
