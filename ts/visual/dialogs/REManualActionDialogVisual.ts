import { REDirectionChangeArgs, REMoveToAdjacentArgs } from "ts/commands/RECommandArgs";
import { assert } from "ts/Common";
import { REData } from "ts/data/REData";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlock";
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
import { REUnitBehavior } from "ts/objects/behaviors/REUnitBehavior";

enum UpdateMode {
    Normal,
    DirSelecting,
    DiagonalMoving,
}

export class VManualActionDialogVisual extends VMainDialog {
    private readonly MovingInputInterval = 5;

    private _model: REManualActionDialog;
    private _updateMode: UpdateMode = UpdateMode.Normal;
    private _waitCount: number = 0; // キーボード操作では 1 フレームでピッタリ斜め入力するのが難しいので、最後の入力から少し待てるようにする
    //private _dirSelecting: boolean = false;
    private _directionButtonPresseCount: number = 0;
    private _moveButtonPresseCount: number = 0;
    private _movingInputWaitCount = -1;

    public constructor(model: REManualActionDialog) {
        super();
        this._model = model;
    }

    private dashButton(): string {
        return "shift";
    }

    private directionButton(): string {
        return "shift";
    }

    private isOffDirectionButton(): boolean {
        return this._directionButtonPresseCount < 0;
    }

    private isDashButtonPressed(): boolean {
        return Input.isPressed(this.dashButton());
    }
    
    private isMoveButtonPressed(): boolean {
        return this._moveButtonPresseCount > 0;
    }

    onUpdate() {
        // Update input
        {
            if (this._directionButtonPresseCount == 0) {
                if (Input.isTriggered(this.directionButton())) {
                    // 向き関係は Dialog が開いた後、初めて押されたら、入力処理を受け付ける。
                    // こうしておかないと、ダッシュでキー押しっぱなし → 離すで向き変更モードに入ってしまう。
                    this._directionButtonPresseCount = 1;
                }
            }
            else {
                if (Input.isPressed(this.directionButton())) {
                    this._directionButtonPresseCount++;
                }
                else if (this._directionButtonPresseCount < 0) {
                    this._directionButtonPresseCount = 1;
                }
                else if (this._directionButtonPresseCount > 1) {
                    this._directionButtonPresseCount = -1;
                }
            }

            if (this._moveButtonPresseCount == 0) {
                if (Input.isTriggered("left") ||
                    Input.isTriggered("right") ||
                    Input.isTriggered("up") ||
                    Input.isTriggered("down")) {
                    this._moveButtonPresseCount = 1;
                }
                if (!Input.isPressed(this.dashButton())) {
                    this._moveButtonPresseCount = 1;
                }
            }
            else {
                if (Input.isTriggered("left") ||
                    Input.isTriggered("right") ||
                    Input.isTriggered("up") ||
                    Input.isTriggered("down")) {
                    this._moveButtonPresseCount++;
                }
            }

            if (this._movingInputWaitCount < 0) {
                if (Input.dir8 != 0) {
                    this._movingInputWaitCount = this.MovingInputInterval;
                }
            }
            else if (Input.dir8 != 0) {
                this._movingInputWaitCount++;
            }
            else {
                this._movingInputWaitCount = 0;
            }
        }





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
                    context.postActivity(LPickActivity.make(entity));
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
        else if (dir != 0 && this._movingInputWaitCount >= this.MovingInputInterval) {
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
        else if (this.isOffDirectionButton()) {
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

        if (this.isOffDirectionButton()) {
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
        if (this.isMoveButtonPressed() &&
            REGame.map.checkPassage(entity, dir)) {

            if (this.isDashButtonPressed()) {
                const behavior = entity.findBehavior(REUnitBehavior);
                assert(behavior);
                behavior._straightDashing = true;
            }

            if (dir != 0) {
                context.postActivity(LDirectionChangeActivity.make(entity, dir));
            }
            context.postActivity(LMoveAdjacentActivity.make(entity, dir));
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

