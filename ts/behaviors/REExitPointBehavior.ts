import { assert } from "ts/Common";
import { ActionId, REData } from "ts/data/REData";
import { REGame_System } from "ts/objects/REGame_System";
import { REGame } from "ts/RE/REGame";
import { REGame_Behavior } from "ts/RE/REGame_Behavior";
import { BlockLayerKind } from "ts/RE/REGame_Block";
import { REGame_Entity } from "ts/RE/REGame_Entity";
import { RECommand, REResponse } from "ts/system/RECommand";
import { RECommandContext } from "ts/system/RECommandContext";
import { RESystem } from "ts/system/RESystem";

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
export class REExitPointBehavior extends REGame_Behavior {
    onQueryProperty(propertyId: number): any {
        if (propertyId == RESystem.properties.homeLayer)
            return BlockLayerKind.Ground;
        else
            super.onQueryProperty(propertyId);
    }

    onQueryActions(): ActionId[] {
        return [REData.ProceedFloorActionId];
    }
    
    onReaction(entity: REGame_Entity, context: RECommandContext, cmd: RECommand): REResponse {

        if (cmd.action().id == REData.ProceedFloorActionId) {
            const event = $gameMap.event(entity.rmmzEventId);
            
            //console.log("transfar", actor);
            console.log("event", event);

            if (event.isREPrefab()) {
                assert(0);  // TODO: Not implemeted.
            }
            else {
                event.start();
            }


        }

        return REResponse.Pass;
    }
}
