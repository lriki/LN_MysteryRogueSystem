import { MRSerializable } from "ts/mr/Common";
import { USearch } from "ts/mr/utility/USearch";
import { LEntity } from "../entity/LEntity";

/**
 * LActionDeterminer で有効スキルが発生しなかったため移動処理を行う際に、移動先座標を決定するためのクラス。
 * 
 * 移動先決定は様々なパターンがある。
 * 
 * - 落ちているアイテムへ向かう
 * - 落ちているゴールドへ向かう
 * - アイテムまたはゴールドへ向かう
 * - 食べ物モンスターや土偶へ向かう
 * - 罠へ向かう (罠壊し)
 * - 階段へ向かう (ツッパリ)
 * - (HPが少なくなったら) 水路へ向かう
 * 
 * 今後も多くの追加が予想される。
 * また Behavior 固有ではなく AI として共有されるものであるため、この検索処理を Behavior に実装するのは望ましくない。
 * 
 * さらに AI のアーキテクチャはまだまだ手探り状態。
 * そのためできるだけ細かい粒度で機能を分割 (継承ではなく包含で) しておき、後々のリファクタリングに耐えやすいようにしておく。
 */
@MRSerializable
export class LMovingTargetFinder {
    public decide(self: LEntity): (number[] | undefined) { return undefined; }
}

@MRSerializable
export class LMovingTargetFinder_Item {
    public decide(self: LEntity): (number[] | undefined) {

        const item = USearch.findLatestItemInVisibilityBlocks(self);
        if (item) {
            return [item.mx, item.my];
        }

        return undefined;
    }

    
}



@MRSerializable
export class LMovingTargetFinder_Gold {
    public decide(self: LEntity): (number[] | undefined) {

        const item = USearch.findLatestItemInVisibilityBlocks(self);
        if (item && item.checkLooksLikeGold()) {
            return [item.mx, item.my];
        }

        return undefined;
    }

    
}

