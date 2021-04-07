import { assert } from "ts/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FBlockComponent, FExitPont, FMap, FMapBlock, FSector } from "../FMapData";



/**
 * [ランダムマップ用]
 * - 出口の位置を決め、そこからたどることができる Block にマークを付けていく。
 * - AI用の通路目的 Block を決める。 http://shiren2424.blog.fc2.com/blog-entry-119.html
 * 
 * プレイヤーの初期位置などはこのマークのある Block から選択することになる。
 * 
 * 侵入不可能な地形が確定した後に実行するのが望ましい。
 */
export class FEntryPointAndExitPointPass extends FMapBuildPass {
    public execute(map: FMap): void {
        const hasExitPoint = (map.exitPont() != undefined);
        assert(!hasExitPoint);


        // ExitPoint
        {
            const candidates = map.blocks().filter(b => b.isRoom() && b.isContinuation());
            assert(candidates.length > 0);
    
            const block = candidates[map.random().nextIntWithMax(candidates.length)];
            map.setExitPont(new FExitPont(block.x(), block.y()));
        }
    }
}

