import { tr2 } from "ts/re/Common";
import { SCommandResponse } from "ts/re/system/SCommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LEntity } from "../LEntity";
import { REGame } from "../REGame";
import { CommandArgs, LBehavior, onEffectResult } from "./LBehavior";
import { MRBasics } from "ts/re/data/MRBasics";
import { LActivity } from "../activities/LActivity";
import { REData } from "ts/re/data/REData";

/**
 */
export class LSelfExplosionBehavior extends LBehavior {

    /*
    自爆はステート？
    ----------
    ステートにしておくと、グラフィックの変更を GUI で指定しやすくなる。


    爆発効果
    ----------
    - 味方は割合ダメージを受ける
    - モンスターは消滅する。(味方モンスターも同様)
    - 自爆能力を持つモンスターは誘爆する。
    - アイテムは消滅する。
    - 地雷罠は誘爆する。

    当初は爆発スキル側で相手に応じて効果を変えようとしていたが、
    効果の発動側が相手の種類を気にするのはやはり拡張性の点からよろしくない。

    爆発ひとつとっても、「HP半分」「HP1/4」「HP1」「定数ダメージ」など様々ある。
    しかし誘爆はこれらすべてで同一。
    設定をそれぞれの爆発効果スキルに行うのは手間がかかるしミスも増える。

    少なくとも誘爆の処理は地雷Behaviorや自爆Behavior側で行うべき。
    そうすると「消滅」は「爆発に分類された効果」を受けた時のアイテム・モンスター側の都合なので、
    それぞれのBehavior側で実装するのがいいかも。

    ### 攻撃属性として "爆発" を特殊扱いする？

    NG. 即死しない爆発もある。
    これに対しては普通の爆発耐性を考慮してダメージを減らしたりできる。

    攻撃属性に "爆発" "即死爆発" を用意する？
    複数用意すると耐性設定するときにミスにつながるので避けたいところ。

    ### ダメージ効果に対して "タグ" を設定する


    */


    public constructor() {
        super();
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = REGame.world.spawn(LSelfExplosionBehavior);
        return b;
    }
    

    [onEffectResult](args: CommandArgs, cctx: SCommandContext): SCommandResponse {
        const self = args.self;

        // 既に戦闘不能なら処理不要
        if (self.isDeathStateAffected()) return SCommandResponse.Pass;

        const mhp = self.idealParam(MRBasics.params.hp);
        const hp = self.actualParam(MRBasics.params.hp);
        if (hp < 10) {          // 残り1桁で爆発
            const skill = REData.getSkill("kSkill_大爆発");
            cctx.postActivity(LActivity.makePerformSkill(self, skill.id));
            cctx.postCall(() => cctx.postDestroy(self));
            return SCommandResponse.Handled;
        }
        if (hp < mhp * 0.5) {   // 残り 50% で着火状態
            const stateId = REData.getState("kState_UT自爆着火").id;
            if (!self.hasState(stateId)) {
                self.addState(stateId);
            }
            return SCommandResponse.Handled;
        }
        
        return SCommandResponse.Pass;
    }
}

