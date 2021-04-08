
import { DActionId } from "ts/data/DAction";
import { DBasics } from "ts/data/DBasics";
import { CommandArgs, LBehavior, onProceedFloorReaction } from "ts/objects/behaviors/LBehavior";
import { BlockLayerKind } from "ts/objects/REGame_Block";
import { LEntity } from "ts/objects/LEntity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";
import { REEventExecutionDialog } from "ts/dialogs/EventExecutionDialog";

/**
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
export class REExitPointBehavior extends LBehavior {
    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Ground;
        else
            super.onQueryProperty(propertyId);
    }

    onQueryReactions(actions: DActionId[]): DActionId[] {
        return [DBasics.actions.ForwardFloorActionId];
    }
    
    [onProceedFloorReaction](args: CommandArgs, context: RECommandContext): REResponse {
        const entity = args.self;

        context.openDialog(entity, new REEventExecutionDialog(entity.rmmzEventId));

        return REResponse.Succeeded;
    }
    
}
