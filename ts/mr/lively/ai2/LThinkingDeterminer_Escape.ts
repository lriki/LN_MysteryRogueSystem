import { MRSerializable } from "ts/mr/Common";
import { MRData } from "ts/mr/data/MRData";
import { SAIHelper } from "ts/mr/system/SAIHelper";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { UAction } from "ts/mr/utility/UAction";
import { UBlock } from "ts/mr/utility/UBlock";
import { UMovement } from "ts/mr/utility/UMovement";
import { HMovement } from "../helpers/HMovement";
import { LEntity } from "../entity/LEntity";
import { LMap, MovingMethod } from "../LMap";
import { MRLively } from "../MRLively";
import { LThinkingAction } from "./LThinkingAction";
import { LThinkingActionRatings, LThinkingAgent } from "./LThinkingAgent";
import { LThinkingDeterminer } from "./LThinkingDeterminer";
import { LThinkingHelper } from "./LThinkingHelper";

@MRSerializable
export class LThinkingDeterminer_Escape extends LThinkingDeterminer {

    /*
    逃げの実装に独自の Action を使うべきか？
    ----------
    旧 AI では thinkMove で、Action を挟むことなく即移動処理を行っていた。


    ### 逃げが関係する者として留意が居るのは…？
    - 最優先で逃げる敵
    - 逃げるが、隣接したら攻撃してくる敵（からかいAI）
    - 一定距離を保つ敵 (これは Escape ではないかも？)
    あと、拡張機能として「ホームポジションに戻ろうとする」というのもある。
    やはり普段は「徘徊」あるいは「ホームポジション」に従うが、敵対を見つけた時に「逃げ」という特殊な選択をするものと考えるべきだろう。

    ### LThinkingAgent に TargetPosition を持たせるとしたら…
    - 同様に、他に TargetPosition を設定したい AI (競合する可能性) は無いか？

    ### Action に TargetPosition を持たせるとしたら…
    - 優先度は確定的ではないので注意。
        上記の、とにかく逃げるAIと、からかいAIでは MoveAction の優先度が異なる。

    そうすると、今の徘徊の処理みたいに、Actionの決定と 実際の経路探索処理は別に分けたほうが良いのかもしれない？
    拡張AIを作るとき、いちいち EscapeAI とかを継承して実装するのはなんか面倒。
    考えられる拡張AIとしては「視界内に特定のEntityがあったら逃げる」とかだが、それなら「逃げる」だけ push しておくようにしたいところ。

    ### 「逃げ」Action を作るべきか？
    - 作らない場合は LThinkingAction にフラグを追加することになる。移動専用の情報が増えるのもちょっと気になるが…。
    - 作る場合は… 「逃げ」でも敵対が視界内にいないときは「徘徊」と同じ動きになるので、「移動」とかぶる。
        …まぁ、↑のよりはマシかも？
    
    ただ移動が絡むものとして、ポリゴン系の瞬間移動があるし（これも敵対がいなければ徘徊になる）、拡張ではバックステップのようなものも考えられるかもしれない。
    この場合、「逃げ」や「瞬間移動」にはオプション Target に Entity を入れておくといいかも。
    で、実際の行動時に Target がいなかったりすれば、「移動」にフォールバックする。

    ### ターゲット消失時と移動先
    逃走中は目指している部屋の出口があるはず。
    そこでターゲットが消失した場合、escape として持っている出口へ向かうのか、wandering として持っている出口で向かうのか？
    ターゲット消失時にいきなり移動先が変わって見えるのはちょっと気持ち悪いかもしれない。

    ### 優先度の問題もある
    Move と Escape の優先度をどうしようか？Escape は↑のとおり、通常・最優先の２通りほしい。

    ### Move に集約する？
    escape や瞬間移動は enum で示すとか？

    でも、escape はともかく、瞬間移動を標準の移動メソッドにするのはかなり微妙。バックステップはなおさら。
    仮に集約しても、優先度の異なる Escape の処理にはどのみに優先度というパラメータが必要になる。
    


    */

    override clone(): LThinkingDeterminer_Escape {
        return new LThinkingDeterminer_Escape();
    }

    override onThink(agent: LThinkingAgent, self: LEntity): SPhaseResult {
        const result = LThinkingHelper.decideTargetPosition(agent, self, MRLively.mapView.currentMap);
        if (result) {
            // agent._wanderingTargetX = result.mx;
            // agent._wanderingTargetY = result.my;
            if (result.mx === undefined) {
                const action = new LThinkingAction(
                    { 
                        rating: LThinkingActionRatings.Wait,
                        skillId: MRData.system.skills.wait,
                    },
                    [],
                );
                action.forceMovedDirection = result.dir;
                agent.addCandidateAction(action);
            }
            else {
                
                const action = new LThinkingAction(
                    { 
                        rating: LThinkingActionRatings.Escape,
                        skillId: MRData.system.skills.escape,
                    },
                    [],
                );
                action.priorityTargetX = result.mx;
                action.priorityTargetY = result.my;
                action.forceMovedDirection = result.dir;
                agent.addCandidateAction(action);
            }

        }
    //    this.decideTargetPosition(agent, self, MRLively.mapView.currentMap);
        
        return SPhaseResult.Handled;
    }

    
    
}

