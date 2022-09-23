import { assert, tr2 } from "ts/mr/Common";
import { REGame } from "ts/mr/lively/REGame";
import { RESystem } from "ts/mr/system/RESystem";
import { MRBasics } from "ts/mr/data/MRBasics";
import { SManualActionDialog } from "ts/mr/system/dialogs/SManualDecisionDialog";
import { REVisual } from "../REVisual";
import { LEntity } from "ts/mr/lively/LEntity";
import { LUnitBehavior } from "ts/mr/lively/behaviors/LUnitBehavior";
import { SDialogContext } from "ts/mr/system/SDialogContext";
import { SFeetDialog } from "ts/mr/system/dialogs/SFeetDialog";
import { SMainMenuDialog } from "ts/mr/system/dialogs/SMainMenuDialog";
import { VDialog } from "./VDialog";
import { UMovement } from "ts/mr/usecases/UMovement";
import { LTrapBehavior } from "ts/mr/lively/behaviors/LTrapBehavior";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { UName } from "ts/mr/usecases/UName";
import { Helpers } from "ts/mr/system/Helpers";
import { LActionTokenType } from "ts/mr/lively/LActionToken";
import { LEquipmentUserBehavior } from "ts/mr/lively/behaviors/LEquipmentUserBehavior";
import { LActionTokenConsumeType } from "ts/mr/lively/LCommon";
import { MRData } from "ts/main";

enum UpdateMode {
    Normal,
    DirSelecting,
    DiagonalMoving,
}

export class VManualActionDialogVisual extends VDialog {
    private readonly MovingInputInterval = 5;

    private _model: SManualActionDialog;
    private _updateMode: UpdateMode = UpdateMode.Normal;
    private _waitCount: number = 0; // キーボード操作では 1 フレームでピッタリ斜め入力するのが難しいので、最後の入力から少し待てるようにする
    //private _dirSelecting: boolean = false;
    private _directionButtonPresseCount: number = 0;
    private _moveButtonPresseCount: number = 0;
    private _movingInputWaitCount = -1;

    private _crossDiagonalCount: number = 0;    // 

    public constructor(model: SManualActionDialog) {
        super(model);
        this._model = model;
    }

    private actionButton(): string {
        return "ok";
    }

    private shortcutButton(): string {
        return "pageup";
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
            entity.getEntityBehavior(LUnitBehavior)._fastforwarding = true;
            this.dialogContext().postActivity(LActivity.make(entity).withConsumeAction(LActionTokenConsumeType.MajorActed));
            this._model.submit();
            return;
        }

        
        // if (entity.immediatelyAfterAdjacentMoving) {
        //     entity.immediatelyAfterAdjacentMoving = false;

        //     const targetEntity = REGame.map.firstFeetEntity(entity);
        //     if (targetEntity && !targetEntity.findEntityBehavior(LTrapBehavior)) {
        //         const actions = targetEntity.queryReactions();
        //         if (actions.length > 0) {

        //             if (actions.includes(REBasics.actions.PickActionId) &&
        //                 !targetEntity._shopArticle.isSalling()) {
    
        //                 if (this._model.dashingEntry) {
        //                     context.commandContext().postMessage(tr2("%1 に乗った。").format(UName.makeNameAsItem(targetEntity)));
        //                 }
        //                 else {
        //                     // 歩行移動時に足元に拾えるものがあれば取得試行
        //                     context.postActivity(LActivity.makePick(entity));
        //                 }
    
    
        //                 // コマンドチェーンを動かす
        //                 //context.postReopen();
        //             }
        //             else {
        //                 this.openSubDialog(new LFeetDialog(targetEntity), d => {
        //                     if (d.isSubmitted()) this._model.submit();
        //                 });
        //             }
        //             return;
        //         }
        //     }
        // }

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
        else if (Input.isTriggered(this.shortcutButton())) {
            this.attemptShortcutAction(context, entity);
            return;
        }
        else if (this.isOffDirectionButton()) {
            this._updateMode = UpdateMode.DirSelecting;
            REGame.map.increaseRevision();
            REVisual.guideGrid?.setVisible(true);
            context.postActivity(LActivity.makeDirectionChange(entity, UMovement.getNextAdjacentEntityDirCW(entity)));
        }
        else if (Input.isTriggered("menu")) {
            SoundManager.playOk();
            this.openSubDialog(new SMainMenuDialog(entity), (d: SMainMenuDialog) => {
                if (d.isSubmitted) {
                    //this.dialogContext().postActivity(LActivity.make(entity).withConsumeAction(LActionTokenType.Major));
                    //this._model.submit();
                }
                return false;
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
        else if (Input.isTriggered(this.shortcutButton())) {
            this.attemptShortcutAction(context, entity);
            return;
        }
        else if (this.isOffDirectionButton()) {
            this.endDirectionSelecting();
        }
        else if (Input.isTriggered("menu")) {
            this.endDirectionSelecting();
            this.openSubDialog(new SMainMenuDialog(entity), (d: SMainMenuDialog) => {
                if (d.isSubmitted) {
                    //this.dialogContext().postActivity(LActivity.make(entity).withConsumeAction(LActionTokenType.Major));
                    //this._model.submit();
                }
                return false;
            });
            return;
        }
        else {
            if (this._waitCount > 0) this._waitCount--;
            
            if (this._waitCount <= 0 && Input.dir8 != 0 && Input.dir8 != entity.dir) {
                //context.closeDialog(false); // 行動消費無しで close
                context.postActivity(LActivity.makeDirectionChange(entity, Input.dir8));
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
            context.postActivity(LActivity.makeDirectionChange(entity, dir));
        }

        if (this.isMoveButtonPressed() &&
            UMovement.checkPassageToDir(entity, dir)) {

            const activity = LActivity.makeMoveToAdjacent(entity, dir).withConsumeAction(LActionTokenConsumeType.MinorActed);
            
            if (this.isDashButtonPressed()) {
                //const behavior = entity.findBehavior(LUnitBehavior);
                //assert(behavior);
                //behavior._straightDashing = true;
                activity.withFastForward();
            }

            context.postActivity(activity);

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

        // 正面に、少なくとも敵対していない Entity がいれば、話しかけてみる
        const frontTarget = UMovement.getFrontBlock(entity).getFirstEntity();
        if (frontTarget && !Helpers.isHostile(entity, frontTarget)) {
            if (!!frontTarget.queryReactions().find(x => x.actionId == MRBasics.actions.talk)) {
                context.postActivity(LActivity.makeTalk(entity).withConsumeAction(LActionTokenConsumeType.MajorActed));
                this._model.submit();
                return true;
            }
        }
        
        // [通常攻撃] スキル発動
        context.postActivity(LActivity.makePerformSkill(entity, MRData.system.skills.normalAttack).withConsumeAction(LActionTokenConsumeType.MajorActed));
        this._model.submit();
        
        return true;
    }

    private attemptShortcutAction(context: SDialogContext, entity: LEntity): boolean {

        const equipmentUser = entity.getEntityBehavior(LEquipmentUserBehavior);
        const item = equipmentUser.shortcutItem;
        if (item) {
            const activity1 = LActivity.makePrimaryUse(entity, item).withConsumeAction();
            context.postActivity(activity1);
            this._model.submit();
        }
        
        return true;
    }
}

