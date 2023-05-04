import { assert, MRSerializable, tr } from "ts/mr/Common";
import { DPrefabMoveType } from "ts/mr/data/DPrefab";
import { DUniqueSpawnerMoveType } from "ts/mr/data/DSpawner";
import { MRData } from "ts/mr/data/MRData";
import { Helpers } from "ts/mr/system/Helpers";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SEmittorPerformer } from "ts/mr/system/SEmittorPerformer";
import { UAction } from "ts/mr/utility/UAction";
import { UEffect } from "ts/mr/utility/UEffect";
import { UMovement } from "ts/mr/utility/UMovement";
import { LActivity } from "../activities/LActivity";
import { LMovingMethod, LUpdateMovingTargetResult } from "../ai/LMoveDeterminer";
import { HMovement } from "../helpers/HMovement";
import { LBlock } from "../LBlock";
import { LActionTokenConsumeType } from "../LCommon";
import { LEntity } from "../entity/LEntity";
import { LEntityId } from "../LObject";
import { LRandom } from "../LRandom";
import { MRLively } from "../MRLively";
import { LMinorActionExecutor } from "./LMinorActionExecutor";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingContext } from "./LThinkingContext";
import { LThinkingDeterminer } from "./LThinkingDeterminer";

export class LThinkingActionRatings {
    /*
    優先度の考え方
    ----------
    「ある Action を、優先度 XX で許可する」という考えて扱うのがいいのかも。
    */

    public static readonly Max = 1000;
    public static readonly Normal = 3;
    public static readonly Moving = -100;
    public static readonly Wait = -200;
    public static readonly Escape = 100;

    public static readonly Restriction1 = 200;
    public static readonly Restriction2 = 200;

    public static readonly BasicActionsBegin = 0;
    public static readonly BasicActionsEnd = 20;

    public static readonly ValidRatingRange = 10;
}

@MRSerializable
export class LThinkingAgent {
    /*
    なんで新AIにしたの？
    ----------
    旧AIの問題は、
    - CharacterAI の独立性が高いので、実際に行動決定する人 (CharacterAI の中の Detaminator) の優先度がコントロールできなかった。
      そのため AI が後勝ちになり、後から追加されたステートによって行動が変わることがあった。
    - 拡張が非常にやりづらい。
      例えば 通常移動と逃げを判断する CharacterAI が分かれているので、
      「基本の移動処理は踏襲しつつ、視界内に罠があったらそちらに移動する」みたいな処理を追加できない。
      強引にやるなら、StandardAI と EscapeAI 双方を継承してそれぞれ用の拡張が要る。
    
    対策として、最初に LThinkingAgent に行動候補をすべて集め、LThinkingAgent が最終的な決定を行うようにした。
    */


    // 徘徊移動ターゲットとなる座標。
    // _primaryTargetEntity ではなく、部屋の入り口などを示すこともある。
    public _wanderingTargetX: number = -1;
    public _wanderingTargetY: number = -1;
    public _noActionTurnCount: number = 0;
    public _decired: LUpdateMovingTargetResult = { method: LMovingMethod.LHRule };

    public _movingTargetX: number;
    public _movingTargetY: number;
    


    private _priority: number;
    private _determiners: LThinkingDeterminer[];
    private _candidateActions: LThinkingAction[];

    
    
    // 最初のフェーズで決定する、メインの行動対象 Entity.
    // 基本的に敵対 Entity であり、移動処理のために使用する。
    // 通常の AI はここに向かって移動する。
    // 逃げ AI はここから離れるように移動する。
    //
    // 対象決定の処理自体は共通なものなので、 Agent 側で行っておく。
    private _primaryTargetEntityId: LEntityId = LEntityId.makeEmpty();

    // デバッグ用の強制移動や、逃げAIでの逃走先(特に、追い詰められて部屋の入り口ではなく壁を目指す場合)を指定するための座標。
    // private _priorityTargetX: number | undefined;
    // private _priorityTargetY: number | undefined;
    
    // スキル適用対象。
    // 味方に回復や支援を行うモンスターは、_primaryTargetEntity で敵の方向に向かいつつ、
    // 範囲内にいる味方はこの値でターゲットする。
    // 最初のフェーズで決定したあと実査には Major フェーズで行動を起こすが、
    // そのときこの値でターゲットした対象が効果範囲を外れていた場合はもう一度 Minor と同じ試行処理を回す。
    //private _attackTargetEntityId: LEntityId = LEntityId.makeEmpty();
    private _requiredSkillAction: LThinkingAction | undefined;

    private _minorActionExecutor: LMinorActionExecutor;

    public constructor(priority: number, determiners: LThinkingDeterminer[]) {
        this._movingTargetX = -1;
        this._movingTargetY = -1;
        this._priority = priority;
        this._determiners = determiners;
        this._candidateActions = [];
        this._minorActionExecutor = new LMinorActionExecutor();
    }

    public clone(): LThinkingAgent {
        const i = new LThinkingAgent(this._priority, this._determiners.map(x => x.clone()));
        i._wanderingTargetX = this._wanderingTargetX;
        i._wanderingTargetY = this._wanderingTargetY;
        i._noActionTurnCount = this._noActionTurnCount;
        i._decired = { ...this._decired };
        i._movingTargetX = this._movingTargetX;
        i._movingTargetY = this._movingTargetY;
        i._candidateActions = this._candidateActions.map(x => x.clone());
        i._primaryTargetEntityId = this._primaryTargetEntityId;
        i._requiredSkillAction = this._requiredSkillAction;
        i._minorActionExecutor = this._minorActionExecutor.clone();
        return i;
    }

    public get priority(): number {
        return this._priority;
    }

    public get determiners(): readonly LThinkingDeterminer[] {
        return this._determiners;
    }
    
    public get candidateSctions(): readonly LThinkingAction[] {
        return this._candidateActions;
    }

    public get requiredSkillAction(): LThinkingAction | undefined {
        return this._requiredSkillAction;
    }
    
    public get rand(): LRandom {
        return MRLively.world.random();
    }

    public get hasPrimaryTarget(): boolean {
        return this._primaryTargetEntityId.hasAny();
    }

    public get primaryTargetEntityId(): LEntityId {
        return this._primaryTargetEntityId;
    }

    public get primaryTarget(): LEntity {
        return MRLively.world.entity(this._primaryTargetEntityId);
    }

    public addDeterminer(determiner: LThinkingDeterminer): void {
        this._determiners.push(determiner);
    }

    public clearCandidateSctions(): void {
        this._candidateActions.length = 0;
    }

    public addCandidateAction(action: LThinkingAction): void {
        // 重複排除・上書き
        const index = this._candidateActions.findIndex((x) => x.action.skillId === action.action.skillId);
        if (index >= 0) {
            if (this._candidateActions[index].action.rating <= action.action.rating) {
                this._candidateActions[index] = action;
            }
        }
        else {
            this._candidateActions.push(action);
        }
    }
    
    // 目的地あり？
    public hasWanderingDestination(): boolean {
        return this._wanderingTargetX >= 0 && this._wanderingTargetY >= 0;
    }

    public hasTargetDestination(): boolean {
        return this._movingTargetX >= 0 && this._movingTargetY >= 0;
    }

    public clearTargetPosition(): void {
        this._wanderingTargetX = -1;
        this._wanderingTargetY = -1;
    }

    public get skipCoun(): number {
        return this._noActionTurnCount;
    }

    public clearSkipCount(): void {
        this._noActionTurnCount = 0;
    }
    public increaseSkipCount(): void {
        this._noActionTurnCount++;
    }


    public think(self: LEntity): void {
        // 敵対の PrimaryTarget を探す。
        // 
        // http://twist.jpn.org/sfcsiren/index.php?%E3%82%BF%E3%83%BC%E3%83%B3%E3%81%AE%E9%A0%86%E7%95%AA
        // の移動目標位置決定はもう少し後の Phase なのだが、敵対 Entity への移動目標位置決定はこの Phase で行う。
        // こうしておかないと、Player の移動を追うように Enemy が移動できなくなる。
        {
            // 視界内にいる敵対 Entity のうち、一番近い Entity を検索
            const target = UAction.findInSightNearlyHostileEntity(self);
            if (target) {
                this._primaryTargetEntityId = target.entityId().clone();

                
                // TODO: 仮
                const dir = SAIHelper.entityDistanceToDir(self, target);
                self.dir = dir;
            }
            else {
                //console.log("NotImplemented.");
                //this._targetPositionX = -1;
                //this._targetPositionY = -1;
                this._primaryTargetEntityId = LEntityId.makeEmpty();
            }
        }

        // 行動候補を集める
        {
            // 基本の onThink
            this._determiners.forEach((determiner) => {
                determiner.onThink(this, self);
            });
            // 拡張 onThink
            self.iterateBehaviorsReverse((behavior) => {
                behavior.onThink(self, this);
            });
        }

        // MajorAction を行いたいときは MinorAction は全部除外
        // const hasMajorAction = this._candidateSctions.some((x) => x.isMajor);
        // if (hasMajorAction) {
        //     this._candidateSctions.mutableRemove(x => x.isMinor);
        // }

        // 行動候補からランダムに選択
        const skillAction = UEffect.selectRating(this.rand, this._candidateActions, x => x.action.rating);
        //const skillAction = this.rand.selectOrUndefined(candidates);
        if (skillAction) {
            this._requiredSkillAction = skillAction;
        }
        else {
            this._requiredSkillAction = undefined;
        }

        if (self.mx == 19 && self.my == 13) {
            console.log("debug");
        }

        // 移動先決定
        [this._movingTargetX, this._movingTargetY] = this.selectMovingTargetPosition(self);
    }

    private selectMovingTargetPosition(self: LEntity): [number, number] {
        const spawner = self.getUniqueSpawner();

        if (this._requiredSkillAction && this._requiredSkillAction.priorityMovingDirection) {
            // 移動スキルに優先移動先が設定されている場合は、その方向に移動する
            const d = HMovement.directionToOffset(this._requiredSkillAction.priorityMovingDirection);
            return [self.mx + d.x, self.my + d.y];
        }
        else if (this._requiredSkillAction && this._requiredSkillAction.priorityTargetX !== undefined && this._requiredSkillAction.priorityTargetY !== undefined) {
            return [this._requiredSkillAction.priorityTargetX, this._requiredSkillAction.priorityTargetY];
        }
        else if (this.hasPrimaryTarget) {
            // 攻撃対象が設定されていれば、常に目標座標を更新し続ける
            const target = this.primaryTarget;
            return [target.mx, target.my];
        }
        else if (spawner && spawner.moveType == DUniqueSpawnerMoveType.Homecoming) {
            return [spawner.mx, spawner.my];
        }
        //else if (prevHasPrimaryTarget != this._actionDeterminer.hasPrimaryTarget()) {
            // decide() によってこれまでの PrimaryTarget を見失った
            //this._moveDeterminer.setTargetPosition(-1, -1);
            // ↑見失った場合、Footpoint などを考慮して選択済みの移動目標を維持したいので、コメントアウトして様子を見る。
        //}
        return [this._wanderingTargetX, this._wanderingTargetY];
    }

    public get isMinorActionRequired(): boolean {
        assert(this._requiredSkillAction !== undefined);
        return this._requiredSkillAction.isMinor;
    }

    public get isMajorActionRequired(): boolean {
        assert(this._requiredSkillAction !== undefined);
        return this._requiredSkillAction.isMajor;
    }

    // public think(self: LEntity): SPhaseResult {
    //     this._thinkingContext.reset();

    //     self.iterateBehaviorsReverse((behavior) => {
    //         behavior.onThink(self, this._thinkingContext);
    //     });
        
    //     return SPhaseResult.Handled;
    // }

    public executeMinorActionIfNeeded(cctx: SCommandContext, self: LEntity): SPhaseResult {
        return this._minorActionExecutor.executeMinorActionIfNeeded(cctx, this, self);
    }

    // Major で行動消費しても、この関数自体は呼び出されるので注意。
    public executeMajorActionIfNeeded(cctx: SCommandContext, self: LEntity): SPhaseResult {
        //if (this._attackTargetEntityId.hasAny()) {
            if (this.isMajorActionRequired) {
                assert(this._requiredSkillAction);

                //// 通常攻撃
                {
                    //const target = REGame.world.entity(this._attackTargetEntityId);
                    // 発動可否チェック。本当に隣接している？
                    //let valid = false;
                    //if (Helpers.checkAdjacent(self, target)) {
                    //    valid = true;
                    //}
    
                    // 対象決定フェーズで予約した対象が、視界を外れたりしていないかを確認する
                    const targetEntites = this._requiredSkillAction.targets.map(e => MRLively.world.entity(e));
                    if (UAction.checkEntityWithinSkillActionRange(self, MRData.skills[this._requiredSkillAction.action.skillId], false, targetEntites)) {
                        
                        // AI は移動後に PrimaryTarget の方向を向くようになっているため、
                        // このままスキルを発動しようとすると空振りしてしまう。
                        // ここで向きを Target の方向に向けておく。
                        const pos = UMovement.getCenter(targetEntites);
                        self.dir = UMovement.getLookAtDirFromPos(self.mx, self.my, pos.x, pos.y);
                        
                        SEmittorPerformer.makeWithSkill(self, self, this._requiredSkillAction.action.skillId).perform(cctx);
                        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
                        
                        return SPhaseResult.Handled;
                    }
                    else {
                        // 別の Unit のアクションでマップ上から対象が消えた、など
                        cctx.postConsumeActionToken(self, LActionTokenConsumeType.MajorActed);
                       
                        return SPhaseResult.Handled;
                    }
                    
                }
    
    
            }
            else {
    
            }
        return SPhaseResult.Pass;
    
    }


}

