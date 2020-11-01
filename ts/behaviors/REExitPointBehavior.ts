import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";

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
 */
export class REExitPointBehavior extends REGame_Behavior {
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {
        console.log("REExitPointBehavior.onReaction")
        return REResponse.Pass;
    }
}
