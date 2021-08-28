
import { Helpers } from "ts/system/Helpers";
import { SPhaseResult } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntity } from "./LEntity";
import { REGame } from "./REGame";

/*

    [2021/8/24] タグのような仕組みを使うのはどうだろう
    ----------
    タイプタグとか。これは Behavior の方にも流用できそうな感じ。

    とりあえず AI で考えると、

    - entity.getAITagList() で、Behavior をなめて AITag リストを取り出す。
    - AITag は Normal, Escape, Confuse, ShopKeeper

    いやタグだけじゃ足りないかも。
    状態を持っておく構造体が必要になる。

    そうするとやっぱりクラスを返す、で十分な気が…。



    ----------

    - 逃げるAIは全く別の CharacterAI作ったほうがいいかもしれない。
    - 隣接していても必ず矢を撃ってくるAI

    敵に支援杖を振るモンスター
    ----------
    これはタイミングを慎重に考える必要がある。
    まず、Minor 時点で杖を振るか否かは「ドラフト行動」として決める。これは攻撃するかどうかを決めるのと同じタイミング。
    しかし実際に杖を振るタイミングは Major フェーズなので、対象として決めた相手が移動した結果、効果範囲外に出てしまうこともある。
    そうしたときは、Major でもう一度 Minor の思考処理を回す。
    シレン２でバッドカンガルー系がワンテンポ遅れて移動することがあるのは多分このため。

    射程内であれば、必ずとくぎを使うモンスター
    ----------
    矢を撃つモンスターなど。
    これは、行動パターンのレーティング 9 を特殊扱いしてみる？

    非隣接時の歩行確率から考えたほうが良いか？(elonaはこれ)
    - elona のアルゴリズムだと、全く移動しないこともある。不思議のダンジョンとしては微妙かも？

    「歩行」もアクションの１つとして扱ってみるとか？
    - 最初の候補アクション導出時に、隣接攻撃可能対象がいるなら、「歩行」を候補アクションリストから外す。
    - そのうえで、レーティング 9 を特殊扱い

    [2021/8/17] AI の変更・包含(合成)
    ----------
    - ステート"恐怖"などで Entity はそのまま、ステート要因で逃げAIがアクティブになることがある。
    - 混乱、目つぶし
    - 店主は、攻撃対象 Entity がいる場合は通常の敵と同じように行動する。

    やっぱり Behavior ごとに実装してオーバーライドがベターかな…。
    もし AI も拡張可能にする、を考えるとこれしかないかも。


*/



/**
 * Run のマージにより 1Run 内に複数回行動する場合、まず thinkMoving() が
 * 複数回呼ばれ、そのあと Token が残っている分だけ thinkAction() が呼ばれる。
 */
export abstract class LCharacterAI {
    public abstract clone(): LCharacterAI;

    public abstract thinkMoving(context: SCommandContext, self: LEntity): SPhaseResult;
    
    public abstract thinkAction(context: SCommandContext, self: LEntity): SPhaseResult;

    /**
     * self の視界内にいる敵対 Entity のうち、一番近いものを検索する。
     */
    protected findInSightNearlyHostileEntity(self: LEntity): LEntity | undefined {
        return REGame.map.getVisibilityEntities(self)
                .filter(e => Helpers.isHostile(self, e))
                .immutableSort((a, b) => Helpers.getDistance(self, a) - Helpers.getDistance(self, b))
                .find(e => Helpers.isHostile(self, e));
    }
}
