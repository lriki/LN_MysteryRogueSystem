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
import { REVisual } from "../REVisual";
import { LEntity } from "ts/objects/LEntity";
import { LDirectionChangeActivity } from "ts/objects/activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LPickActivity } from "ts/objects/activities/LPickActivity";

enum UpdateMode {
    Normal,
    DirSelecting,
    DiagonalMoving,
}

export class VManualActionDialogVisual extends VMainDialog {

    private _model: REManualActionDialog;
    private _updateMode: UpdateMode = UpdateMode.Normal;
    private _waitCount: number = 0; // キーボード操作では 1 フレームでピッタリ斜め入力するのが難しいので、最後の入力から少し待てるようにする
    //private _dirSelecting: boolean = false;

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
            const actions = targetEntities.flatMap(x => x.queryReactions());
            if (actions.length > 0) {
                if (actions.includes(DBasics.actions.PickActionId)) {
                    // 歩行移動時に足元に拾えるものがあれば取得試行
                    context.postActivity(entity, new LPickActivity());
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

        switch (this._updateMode) {
            case UpdateMode.Normal:
                this.updateNormal(context, entity);
                break;
            case UpdateMode.DirSelecting:
                this.updateDirSelecting(entity);
                break;
            case UpdateMode.DiagonalMoving:
                this.updateDiagonalMoving(context, entity);
                break;
            default:
                break;
        }
        
    }

    private updateNormal(context: REDialogContext, entity: LEntity): void {
        let dir = Input.dir8;

        if (Input.isPressed("pagedown")) {
            this._updateMode = UpdateMode.DiagonalMoving;
            REVisual.spriteSet2?.directionArrow().setCrossDiagonal(true);
        }
        // 移動
        else if (dir != 0) {
            this.attemptMoveEntity(context, entity, dir);
            return;
        }
        // オートアクション
        else if (Input.isTriggered("ok")) {
            
            // [通常攻撃] スキル発動
            context.commandContext().postPerformSkill(entity, RESystem.skills.normalAttack);
            this._model.close(true);
            return;
        }
        else if (Input.isTriggered("shift")) {
            this._updateMode = UpdateMode.DirSelecting;
            REGame.map.increaseRevision();
            REVisual.guideGrid?.setVisible(true);
        }
        else if (Input.isTriggered("menu")) {
            this.openSubDialog(new VMenuDialog(entity));
            return;
        }
    }

    private updateDirSelecting(entity: LEntity): void {
        assert(REVisual.entityVisualSet);
        assert(REVisual.spriteSet2);
        const visual = REVisual.entityVisualSet.getEntityVisualByEntity(entity);
        const sprite = visual.getRmmzSprite();
        const arrow =  REVisual.spriteSet2.directionArrow();
        //arrow.setPosition(sprite.x, sprite.y);
        arrow.setDirection(entity.dir);

        if (Input.isTriggered("shift")) {
            this._updateMode = UpdateMode.Normal;
            arrow.setDirection(0);
            REVisual.guideGrid?.setVisible(false);
        }
        else if (Input.isTriggered("menu")) {
            this._updateMode = UpdateMode.Normal;
            arrow.setDirection(0);
            REVisual.guideGrid?.setVisible(false);
            this.openSubDialog(new VMenuDialog(entity));
            return;
        }
        else {
            if (this._waitCount > 0) this._waitCount--;
            
            if (this._waitCount <= 0 && Input.dir8 != 0 && Input.dir8 != entity.dir) {
                //context.closeDialog(false); // 行動消費無しで close
                entity.dir = Input.dir8;
                REGame.map.increaseRevision();
                this._waitCount = 10;
            }
        }
    }

    private updateDiagonalMoving(context: REDialogContext,entity: LEntity): void {
        assert(REVisual.entityVisualSet);
        assert(REVisual.spriteSet2);
        const visual = REVisual.entityVisualSet.getEntityVisualByEntity(entity);
        const sprite = visual.getRmmzSprite();
        const arrow =  REVisual.spriteSet2.directionArrow();
        //arrow.setPosition(sprite.x, sprite.y);

        if (Input.isPressed("pagedown")) {
            const dir = Input.dir8;
            if (dir == 1 || dir == 3 || dir == 7 || dir == 9) {
                this.attemptMoveEntity(context, entity, dir);
            }
        }
        else {
            arrow.setCrossDiagonal(false);
            this._updateMode = UpdateMode.Normal;
        }
    }

    private attemptMoveEntity(context: REDialogContext, entity: LEntity, dir: number): boolean {
        if (REGame.map.checkPassage(entity, dir)) {
            if (dir != 0) {
                context.postActivity(entity, (new LDirectionChangeActivity()).setup(dir));
            }
            context.postActivity(entity, (new LMoveAdjacentActivity()).setup(dir));
            this._model.close(true);

            // TODO: test
            //SceneManager._scene.executeAutosave();

            return true;
        }
        else {
            return false;
        }
    }
}

