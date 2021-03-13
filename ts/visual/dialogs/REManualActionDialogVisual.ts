import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { RESystem } from "ts/system/RESystem";
import { REDialogContext } from "../../system/REDialog";
import { VFeetDialog } from "./VFeetDialog";
import { VMenuDialog } from "./VMenuDialog";
import { DBasics } from "ts/data/DBasics";
import { VMainDialog } from "./VMainDialog";
import { REManualActionDialog } from "ts/dialogs/REManualDecisionDialog";

export class VManualActionDialogVisual extends VMainDialog {

    private _model: REManualActionDialog;

    public constructor(model: REManualActionDialog) {
        super();
        this._model = model;
    }

    onUpdate() {
        const context = RESystem.dialogContext;
        const entity = context.causeEntity();
        if (!entity) return;
        
        if (entity.immediatelyAfterAdjacentMoving) {
            const block = REGame.map.block(entity.x, entity.y);
            const layer = block.layer(BlockLayerKind.Ground);
            const targetEntities = layer.entities();
            assert(targetEntities.length <= 1);    // TODO: 多種類は未対応
            const targetEntity = targetEntities[0]; // 足元
            const actions = targetEntities.flatMap(x => x.queryActions());
            if (actions.length > 0) {
                if (actions.includes(DBasics.actions.PickActionId)) {
                    // 歩行移動時に足元に拾えるものがあれば取得試行
                    context.postAction(DBasics.actions.PickActionId, entity, undefined);
                    // 行動を消費せずに、一度 Dialog を終了する。
                    // 終了しないと、post したコマンドチェーンがうごかない。
                    this._model.close(false);
                }
                else {
                    this.openSubDialog(new VFeetDialog(targetEntity, actions));
                }
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
                context.postAction(DBasics.actions.DirectionChangeActionId, entity, undefined, args);
            }
            const args: REMoveToAdjacentArgs = { direction: dir };
            context.postAction(DBasics.actions.MoveToAdjacentActionId, entity, undefined, args);
            this._model.close(true);
            //SceneManager._scene.executeAutosave();
            return;
        }
        // オートアクション
        else if (Input.isTriggered("ok")) {
            
            // [通常攻撃] スキル発動
            context.commandContext().postPerformSkill(entity, RESystem.skills.normalAttack);
            this._model.close(true);
            return;
        }

        if (Input.isTriggered("menu")) {
            this.openSubDialog(new VMenuDialog(entity));
            return;
        }
    }
}

