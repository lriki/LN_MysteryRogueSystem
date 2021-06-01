import { assert, tr2 } from "ts/Common";
import { REGame } from "ts/objects/REGame";
import { BlockLayerKind } from "ts/objects/LBlock";
import { RESystem } from "ts/system/RESystem";
import { DBasics } from "ts/data/DBasics";
import { REManualActionDialog } from "ts/system/dialogs/REManualDecisionDialog";
import { REVisual } from "../REVisual";
import { LEntity } from "ts/objects/LEntity";
import { LDirectionChangeActivity } from "ts/objects/activities/LDirectionChangeActivity";
import { LMoveAdjacentActivity } from "ts/objects/activities/LMoveAdjacentActivity";
import { LPickActivity } from "ts/objects/activities/LPickActivity";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { SDialogContext } from "ts/system/SDialogContext";
import { LFeetDialog } from "ts/system/dialogs/LFeetDialog";
import { LMainMenuDialog } from "ts/system/dialogs/LMainMenuDialog";
import { VDialog } from "./VDialog";
import { DialogSubmitMode } from "ts/system/SDialog";
import { SMovementCommon } from "ts/system/SMovementCommon";
import { LDecisionBehavior } from "ts/objects/behaviors/LDecisionBehavior";
import { LTrapBehavior } from "ts/objects/behaviors/LTrapBehavior";

enum UpdateMode {
    Normal,
    DirSelecting,
    DiagonalMoving,
}

export class VManualActionDialogVisual extends VDialog {
    private readonly MovingInputInterval = 5;

    private _model: REManualActionDialog;
    private _updateMode: UpdateMode = UpdateMode.Normal;
    private _waitCount: number = 0; // キーボード操作では 1 フレームでピッタリ斜め入力するのが難しいので、最後の入力から少し待てるようにする
    //private _dirSelecting: boolean = false;
    private _directionButtonPresseCount: number = 0;
    private _moveButtonPresseCount: number = 0;
    private _movingInputWaitCount = -1;

    private _crossDiagonalCount: number = 0;    // 

    public constructor(model: REManualActionDialog) {
        super(model);
        this._model = model;
    }

    private actionButton(): string {
        return "ok";
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

    onStop() {
        this.endDirectionSelecting();
    }

    onUpdate() {
        this.updateInput();


        const context = RESystem.dialogContext;
        const entity = context.causeEntity();
        if (!entity) return;

        // 足踏み
        if (Input.isPressed(this.directionButton()) && Input.isPressed(this.actionButton())) {
            entity.getBehavior(LUnitBehavior)._fastforwarding = true;
            this._model.consumeAction();
            this._model.submit();
            return;
        }


        
        if (entity.immediatelyAfterAdjacentMoving) {
            entity.immediatelyAfterAdjacentMoving = false;

            const targetEntity = REGame.map.firstFeetEntity(entity);
            if (targetEntity && !targetEntity.findBehavior(LTrapBehavior)) {
                const actions = targetEntity.queryReactions();
                if (actions.length > 0) {
                    if (actions.includes(DBasics.actions.PickActionId)) {
    
                        if (this._model.dashingEntry) {
                            context.commandContext().postMessage(tr2("%1 に乗った。").format(REGame.identifyer.makeDisplayText(targetEntity)));
                        }
                        else {
                            // 歩行移動時に足元に拾えるものがあれば取得試行
                            context.postActivity(LPickActivity.make(entity));
                        }
    
    
                        // コマンドチェーンを動かす
                        context.postReopen();
                    }
                    else {
                        this.openSubDialog(new LFeetDialog(targetEntity), d => {
                            if (d.isSubmitted()) this._model.submit();
                        });
                    }
                    return;
                }
            }
        }

        switch (this._updateMode) {
            case UpdateMode.Normal:
                this.updateNormal(context, entity);
                break;
            case UpdateMode.DirSelecting:
                this.updateDirSelecting(context, entity);
                break;
            case UpdateMode.DiagonalMoving:
                this.updateDiagonalMoving(context, entity);
                break;
            default:
                break;
        }
        
    }

    private updateInput(): void {

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

        // 斜め移動ボタン押しっぱなしの時は常時 DiagonalMoving にする。
        // 以前は updateNormal() の中で行っていたが、そこだと最初の onUpdate() で updateDiagonalMoving() に流れないため、移動がカクカクする。
        if (Input.isPressed("pagedown")) {
            this._updateMode = UpdateMode.DiagonalMoving;
        }
    }

    private updateNormal(context: SDialogContext, entity: LEntity): void {
        let dir = Input.dir8;

        // 移動
        if (dir != 0 && this._movingInputWaitCount >= this.MovingInputInterval) {
            this.attemptMoveEntity(context, entity, dir);
            return;
        }
        // アクション
        else if (Input.isTriggered(this.actionButton())) {
            this.attemptFrontAction(context, entity);
            return;
        }
        else if (this.isOffDirectionButton()) {
            this._updateMode = UpdateMode.DirSelecting;
            REGame.map.increaseRevision();
            REVisual.guideGrid?.setVisible(true);
            entity.dir = SMovementCommon.getNextAdjacentEntityDirCW(entity);
        }
        else if (Input.isTriggered("menu")) {
            SoundManager.playOk();
            this.openSubDialog(new LMainMenuDialog(entity), d => {
                if (d.isSubmitted()) this._model.submit(DialogSubmitMode.ConsumeAction);
            });
            return;
        }
    }

    private endDirectionSelecting(): void {
        assert(REVisual.spriteSet2);
        const arrow =  REVisual.spriteSet2.directionArrow();
        REVisual.guideGrid?.setVisible(false);
        this._updateMode = UpdateMode.Normal;
        arrow.setDirection(0);
    }

    private updateDirSelecting(context: SDialogContext, entity: LEntity): void {
        assert(REVisual.entityVisualSet);
        assert(REVisual.spriteSet2);
        const visual = REVisual.entityVisualSet.getEntityVisualByEntity(entity);
        const sprite = visual.getRmmzSprite();
        const arrow =  REVisual.spriteSet2.directionArrow();
        //arrow.setPosition(sprite.x, sprite.y);
        arrow.setDirection(entity.dir);

        // アクション
        if (Input.isTriggered("ok")) {
            this.attemptFrontAction(context, entity);
            this.endDirectionSelecting();
            return;
        }
        else if (this.isOffDirectionButton()) {
            this.endDirectionSelecting();
        }
        else if (Input.isTriggered("menu")) {
            this.endDirectionSelecting();
            this.openSubDialog(new LMainMenuDialog(entity), d => {
                if (d.isSubmitted()) this._model.submit(DialogSubmitMode.ConsumeAction);
            });
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

    private updateDiagonalMoving(context: SDialogContext,entity: LEntity): void {
        assert(REVisual.entityVisualSet);
        assert(REVisual.spriteSet2);
        const visual = REVisual.entityVisualSet.getEntityVisualByEntity(entity);
        const sprite = visual.getRmmzSprite();
        const arrow =  REVisual.spriteSet2.directionArrow();
        //arrow.setPosition(sprite.x, sprite.y);

        this._crossDiagonalCount++;
        if (this._crossDiagonalCount > 3) {
            REVisual.spriteSet2?.directionArrow().setCrossDiagonal(true);
        }

        if (Input.isPressed("pagedown")) {
            const dir = Input.dir8;
            if (dir == 1 || dir == 3 || dir == 7 || dir == 9) {
                this.attemptMoveEntity(context, entity, dir);
                arrow.setCrossDiagonal(false);
                this._crossDiagonalCount = 0;
            }
        }
        else {
            arrow.setCrossDiagonal(false);
            this._crossDiagonalCount = 0;
            this._updateMode = UpdateMode.Normal;
        }
    }

    private attemptMoveEntity(context: SDialogContext, entity: LEntity, dir: number): boolean {

        // 向きは移動成否にかかわらず変える
        if (dir != 0) {
            // postActivity(LDirectionChangeActivity) で向きを変更する場合、コマンドチェーンを実行する必要がある。
            // 今はそこまで必要ではないので、直接変更してしまう。
            entity.dir = dir;
        }

        if (this.isMoveButtonPressed() &&
            SMovementCommon.checkPassageToDir(entity, dir)) {

            if (this.isDashButtonPressed()) {
                const behavior = entity.findBehavior(LUnitBehavior);
                assert(behavior);
                behavior._straightDashing = true;
            }

            context.postActivity(LMoveAdjacentActivity.make(entity, dir));
            this._model.consumeAction();
            this._model.submit();

            // TODO: test
            //SceneManager._scene.executeAutosave();

            return true;
        }
        else {
            return false;
        }
    }

    private attemptFrontAction(context: SDialogContext, entity: LEntity): boolean {
        // TODO: NPC 話かけ
        
        // [通常攻撃] スキル発動
        context.commandContext().postPerformSkill(entity, RESystem.skills.normalAttack);
        this._model.consumeAction();
        this._model.submit();
        
        return true;
    }
}

