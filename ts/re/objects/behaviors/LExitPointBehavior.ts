
import { DActionId } from "ts/re/data/DAction";
import { REBasics } from "ts/re/data/REBasics";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/re/objects/behaviors/LBehavior";
import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SEventExecutionDialog } from "ts/re/system/dialogs/SEventExecutionDialog";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { RESerializable } from "ts/re/Common";
import { DBlockLayerKind } from "ts/re/data/DCommon";

/**
 * [2021/8/14] 「戻る」の実装について
 * ----------
 * 
 * まず制約として、階段の外見を変更できるようにする必要がある。
 * これを実現する一番手っ取り早い&ツクールの仕組みで頑張るなら、スイッチによるイベントページの切り替え。
 * SFCトルネコでは特定アイテムの所持で方向が変わるが、これはそのままツクールのイベントの[条件]を使えばよいだろう。
 * 
 * 
 * 
 * [2020/11/1] NOTE: Player が乗ったときの UI 表示タイミング
 * ----------
 * 乗った瞬間ではなく、乗った次のターンの Dialog 表示時である点に注意。
 * ただ、これはアイテムなど「あしもと」に対して行う表示と同様のシステムになりそう。
 * - アイテムを拾うのは手番内。
 * - アイテムに「のった」表示も手番内。
 * - お店のアイテムにのったときの UI 表示は次のターン。
 * 
 * あとこれはコアシステムとして必須の機能ではなくて、ユーザビリティのための便利機能。
 * 
 * Dialog 側で足元の Entty の種別をみて Window 表示とかやると、また拡張性が微妙になる。
 * できれば Item や階段の Behavior 側の「乗られた」Reaction で、
 * 「次の Player Dialog Open時に表示したいユーザビリティアクション」みたいなものを、PlayerEntity の set して実現したいところ。
 * set はしてるけど、次に Player が行動不能だったりしたら破棄するだけ。
 * 
 * …と考えてみたが、階段上へ移動 → モンスターの吹き飛ばしで階段上以外へ移動 → そのあとは UI 表示しない といこともあるので、この対策が何か必要。
 * 
 * HC4 の時に実装したリアクションコマンド形式がいいかも。
 * Behavior に問い合わせ用のメソッド追加する必要があるけど、Entity に対してどんなアクションをとれるか聞く仕組みがあると自然。
 */
@RESerializable
export class LExitPointBehavior extends LBehavior {

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LExitPointBehavior);
        return b;
    }

    queryHomeLayer(): DBlockLayerKind | undefined {
        return DBlockLayerKind.Ground;
    }

    onQueryReactions(actions: DActionId[]): void {
        actions.splice(0);
        actions.push(REBasics.actions.ForwardFloorActionId);
    }
    
    [onProceedFloorReaction](args: CommandArgs, context: SCommandContext): SCommandResponse {
        const entity = args.self;

        context.openDialog(entity, new SEventExecutionDialog(entity.rmmzEventId, entity), false);

        return SCommandResponse.Handled;
    }
    
}
