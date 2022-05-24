import { assert } from "ts/re/Common";
import { FMapBuildPass } from "./FMapBuildPass";
import { FExitPont, FMap } from "../FMapData";



/**
 */
export class FEntryPointAndExitPointPass extends FMapBuildPass {
    public execute(map: FMap): void {
        const hasExitPoint = (map.exitPont() != undefined);
        assert(!hasExitPoint);


        // ExitPoint
        {
            const candidates = map.innerBlocks.filter(b => b.isRoom() && b.isContinuation());
            assert(candidates.length > 0);
    
            const block = candidates[map.random().nextIntWithMax(candidates.length)];
            map.setExitPont(new FExitPont(block.mx, block.my));
        }
    }
}


/*
NOTE: 埋蔵金部屋を作る場合
- 通路を引く前に、部屋の接続情報をいじって独立させる必要がある。
    - 後から通路を埋めるより、こちらの方が自然。特に、水路を経て独立させる場合、通通路を埋めるときに壁を使うか水路を使うか判断しなければならなくなる。
- 地形生成後、アイテムを配置する。

NOTE: 部屋を横断する水路を作る場合
- 水路は水路レイヤーにひく。
- 通路を引いた後、水路を引こうとする部屋の一方の入口から、他方の入口へ到達するルートがあるか確認して引く。
- 横断水路を引くかどうかはオプションにしたい。

NOTE: 二択屋を作る場合
- 
*/