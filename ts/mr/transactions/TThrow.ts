import { tr2 } from "../Common";
import { LEntity } from "../lively/LEntity";
import { onPreThrowReaction, onThrowReaction } from "../lively/behaviors/LBehavior";
import { SCommandContext } from "../system/SCommandContext";
import { SEffectSubject } from "../system/SEffectContext";
import { UName } from "../utility/UName";

export class TThrow {
    
    public static throwAllStack(cctx: SCommandContext, actor: LEntity, subject: LEntity, item: LEntity): void {
        
        // [投げる] は便利コマンドのようなもの。
        // 具体的にどのように振舞うのか (直線に飛ぶのか、放物線状に動くのか、転がるのか) を決めるのは相手側
        
        const effectSubject = new SEffectSubject(subject);

        cctx.post(item, actor, effectSubject, undefined, onPreThrowReaction)
        .then(() => {
            //itemEntity.callRemoveFromWhereabouts(cctx);

            item.removeFromParent();
            item.mx = actor.mx;
            item.my = actor.my;

            /*
            let actual: LEntity;
            if (itemEntity.isStacked()) {
                // スタックされていれば減らして新たな entity を生成
                actual = itemEntity.decreaseStack();
                //console.log("self.floorId", self.floorId);
                //REGame.world._transferEntity(actual, self.floorId, self.x, self.y);
            }
            else {
                // スタックされていなければそのまま打ち出す
                itemEntity.removeFromParent();
                actual = itemEntity;
            }

            actual.x = self.x;
            actual.y = self.y;
            */


            cctx.post(item, actor, effectSubject, undefined, onThrowReaction)
                .then(() => {
                    cctx.postMessage(tr2("%1を投げた。").format(UName.makeNameAsItem(item)));
                    return true;
                });
            return true;
        });
    }

    public static throwSingleStack(cctx: SCommandContext, actor: LEntity, subject: LEntity, item: LEntity): void {
        
        const effectSubject = new SEffectSubject(subject);

        cctx.post(item, actor, effectSubject, undefined, onPreThrowReaction)
        .then(() => {
            let actual: LEntity;
            if (item.isStacked()) {
                // スタックされていれば減らして新たな entity を生成
                actual = item.decreaseStack();
                //console.log("self.floorId", self.floorId);
                //REGame.world._transferEntity(actual, self.floorId, self.x, self.y);
            }
            else {
                // スタックされていなければそのまま打ち出す
                item.removeFromParent();
                actual = item;
            }

            actual.mx = actor.mx;
            actual.my = actor.my;


            cctx.post(actual, actor, effectSubject, undefined, onThrowReaction)
                .then(() => {
                    cctx.postMessage(tr2("%1を撃った".format(UName.makeNameAsItem(actual))));
                    return true;
                });

            return true;
        });
    }
}
