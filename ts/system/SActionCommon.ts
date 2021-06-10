import { onWalkedOnTopAction, onWalkedOnTopReaction } from "ts/objects/internal";
import { BlockLayerKind } from "ts/objects/LBlockLayer";
import { LEntity } from "ts/objects/LEntity";
import { REGame } from "ts/objects/REGame";
import { SCommandContext } from "./SCommandContext";
import { SEffectSubject } from "./SEffectContext";

export class SActionCommon {
    public static postStepOnGround(context: SCommandContext, entity: LEntity): void {
        const block = REGame.map.block(entity.x, entity.y);
        const layer = block.layer(BlockLayerKind.Ground);
        const reactor = layer.firstEntity();
        if (reactor) {
            context.post(entity, reactor, new SEffectSubject(entity), undefined, onWalkedOnTopAction);
            context.post(reactor, entity, new SEffectSubject(reactor), undefined, onWalkedOnTopReaction);
        }
    }
}
