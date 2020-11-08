import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REGame } from "ts/RE/REGame";
import { BlockLayerKind } from "ts/RE/REGame_Block";
import { REDialogContext } from "../system/REDialog";
import { RE } from "./dialogs/FootingDialogVisual";
import { REDialogVisualWindowLayer } from "./REDialogVisual";

export class REManualActionDialogVisual extends REDialogVisualWindowLayer {

    onUpdate(context: REDialogContext) {
        const entity = context.causeEntity();
        if (!entity) return;
        
        if (entity.immediatelyAfterAdjacentMoving) {
            const block = REGame.map.block(entity.x, entity.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const targetEntities = layer.entities();
            assert(targetEntities.length <= 1);    // TODO: 多種類は未対応
            const targetEntity = targetEntities[0];
            const actions = targetEntities.flatMap(x => x.queryActions());
            if (actions.length > 0) {
                console.log("SceneManager.push(Scene_Footing)", actions);
                this.push(new RE.FootingDialogVisual(targetEntity, actions));
                //SceneManager.push(Scene_Footing);
                return;
            }
        }

        //if (Input.dir8 != 0 && Input.dir8 != entity.dir) {
        //    context.postAction(REData.actions[REData.DirectionChangeActionId], entity, undefined, new REDirectionChangeCommand(Input.dir8));
        //    context.closeDialog(false); // 行動消費無しで close
        //}
        let dir = Input.dir8;
        
        // 移動
        if (dir != 0 && REGame.map.checkPassage(entity, dir)) {
            if (dir != 0) {
                const args: REDirectionChangeArgs = { direction: dir };
                context.postAction(REData.DirectionChangeActionId, entity, undefined, args);
            }
            const args: REMoveToAdjacentArgs = { direction: dir };
            context.postAction(REData.MoveToAdjacentActionId, entity, undefined, args);
            context.closeDialog(true);
            return;
        }
        // オートアクション
        else if (Input.isTriggered("ok")) {
            
            // [通常攻撃] スキル発動
            context.commandContext().postPerformSkill(entity, REData.AttackActionId);
            context.closeDialog(true);
            return;
        }
    }
}

