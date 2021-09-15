import { assert, tr } from "ts/re/Common";
import { DActionId } from "ts/re/data/DAction";
import { DBasics } from "ts/re/data/DBasics";
import { REData } from "ts/re/data/REData";
import { REResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEffectContext, SEffectIncidentType } from "ts/re/system/SEffectContext";
import { RESystem } from "ts/re/system/RESystem";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { DEventId, SkillEmittedArgs } from "ts/re/data/predefineds/DBasicEvents";
import { LEventResult } from "../LEventServer";
import { UMovement } from "ts/re/usecases/UMovement";
import { SEffectorFact } from "ts/re/system/SEffectApplyer";
import { DEffectCause } from "ts/re/data/DEmittor";


/**
 * 
 * [2021/5/26]
 * ----------
 * - 全ての Unit は罠にかかる可能性を持っている。
 * - 仲間 Unit は TrapThrough Trait を持たせて、一切かからないようにしてみる。仲間システム作ったら。
 * - Trap は中立勢力にする。今のところ敵対でも問題ないかもしれないけど、多分中立の方が自然。
 *   - 条件によってはモンスターに対して効果発動することもあるし
 *   - 範囲攻撃巻物の対象外にしやすいし
 *   - ミニマップ表示やりやすいし
 * - Trap は罠にかけたい勢力を持っている (デフォルトは Player)
 * - 罠にかけたい勢力側に TrapMaster がいたら、その敵対勢力を罠にかけるようにする。
 * - 両方の勢力に TrapMaster がいたら、何もしない。
 */
export class LTrapBehavior extends LBehavior {
    private _exposed: boolean = false;

    constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LTrapBehavior);
        b._exposed = this._exposed;
        return b
    }

    /**
     * 露出しているかどうか。
     * 罠が踏まれたり、空振りや魔法弾の通過で発見された状態で、勢力に関わらず可視である。
     */
    public exposed(): boolean {
        return this._exposed;
    }

    
    onQueryReactions(actions: DActionId[]): void {
        actions.mutableRemove(x => x == DBasics.actions.PickActionId);
    }

    onAttached(self: LEntity): void {
        assert(this.ownerEntity().findEntityBehavior(LItemBehavior));
        REGame.eventServer.subscribe(DBasics.events.skillEmitted, this);
    }

    onDetached(self: LEntity): void {
        REGame.eventServer.unsubscribe(DBasics.events.skillEmitted, this);
    }

    onEvent(context: SCommandContext, eventId: DEventId, args: any): LEventResult {
        if (eventId == DBasics.events.skillEmitted) {
            const entity = this.ownerEntity();
            const e = args as SkillEmittedArgs;
            if (this.checkValidTarget(e.performer) &&           // 攻撃者はこの罠にかかることができる？
                e.skillId == RESystem.skills.normalAttack &&    // 通常攻撃？
                e.targets.length == 0 &&                        // 攻撃対象がない？（明示的な空振り）
                !UMovement.checkDiagonalWallCornerCrossing(e.performer, e.performer.dir) &&  // 壁角チェック
                UMovement.getFrontBlock(e.performer).containsEntity(entity)) {     // 目の前にこの罠がある？
                // 空振りによる発見
                this._exposed = true;
            }
        }
        return LEventResult.Pass;
    }
    
    private checkValidTarget(entity: LEntity): boolean {
        return entity.getOutwardFactionId() === REData.system.trapTargetFactionId;
    }
    
    [onWalkedOnTopReaction](e: CommandArgs, context: SCommandContext): REResponse {
        const self = this.ownerEntity();
        const target = e.sender;

        // この罠にかかることができる？
        if (!this.checkValidTarget(target)) return REResponse.Pass;

        this._exposed = true;


        context.postMessage(tr("{0} を踏んだ！", self.getDisplayName().name));


        //const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        //const itemData = trapItem.itemData();
        const emittors = self.data().emittorSet.emittors(DEffectCause.Affect);
        assert(emittors.length == 1);   // TODO: とりあえず

        const emittor = emittors[0];

        if (emittor) {
            const subject = new SEffectorFact(e.self, emittor.effectSet, SEffectIncidentType.IndirectAttack, target.dir);
            const effectContext = new SEffectContext(subject, context.random());

            //console.log(result);


            context.postAnimation(e.sender, 35, true);

            // TODO: ここでラムダ式も post して apply したい。

            context.postCall(() => {
                effectContext.applyWithWorth(context, [target]);
            });



            //context.postMessage(tr("しかし ワナには かからなかった。"));
        }



        
        return REResponse.Pass;
    }
}

