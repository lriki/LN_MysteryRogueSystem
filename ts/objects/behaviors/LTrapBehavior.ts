import { assert, tr } from "ts/Common";
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { REData } from "ts/data/REData";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { SEffectContext, SEffectIncidentType, SEffectorFact } from "ts/system/SEffectContext";
import { RESystem } from "ts/system/RESystem";
import { CommandArgs, LBehavior, onWalkedOnTopReaction } from "./LBehavior";
import { LItemBehavior } from "./LItemBehavior";
import { DEffectCause } from "ts/data/DEffect";
import { LEntity } from "../LEntity";
import { LUnitBehavior } from "./LUnitBehavior";
import { REGame } from "../REGame";


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

    onAttached(): void {
        assert(this.ownerEntity().findBehavior(LItemBehavior));
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


        const trapItem = this.ownerEntity().getBehavior(LItemBehavior);
        const itemData = trapItem.itemData();
        const effect = itemData.effectSet.effect(DEffectCause.Affect);

        if (effect) {
            const subject = new SEffectorFact(e.self, effect, SEffectIncidentType.IndirectAttack);
            const effectContext = new SEffectContext(subject);

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

