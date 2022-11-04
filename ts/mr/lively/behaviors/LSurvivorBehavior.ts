import { MRSerializable, tr2 } from "ts/mr/Common";
import { MRBasics } from "ts/mr/data/MRBasics";
import { paramFPLoss } from "ts/mr/PluginParameters";
import { SPhaseResult } from "ts/mr/system/SCommand";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LEntity } from "../LEntity";
import { MRLively } from "../MRLively";
import { DecisionPhase, LBehavior } from "./LBehavior";

/**
 * 
 */
@MRSerializable
export class LSurvivorBehavior extends LBehavior {

    /*
    [2021/11/18] 拡張に対応できるだろうか？
    ----------
    似たようなサバイバルパラメータとして考えられるのは、
    - 水分
    - 疲労度 (元気度)

    影響を与える要素は、
    - モンスター、罠、アイテムによる回復
    - モンスター、罠、アイテムによる上限の変化
    - モンスター、罠、アイテムによる減少 (ハラヘリー)
    - 減少の防止(ハラヘリ除け) → 上記効果の "減少" 時のみ有効。Cur,Max共に。
    - 減少値の軽減 (皮の盾) → 自動減少にのみ影響
    - 減少値の無効化 (ハラヘラズ)
    - 減少値の増加 (ハラヘリ) → 自動減少にのみ影響

    パラメータを正常値に保つ影響として、
    - HPの自動回復
    この辺りは「ステートの自動付加」で表現するのが妥当だろうか。
    
    パラメータを失った影響として、
    - HPの自動減少
    この辺りは「ステートの自動付加」で表現するのが妥当だろうか。

    ステートやりくりである程度 Behavior に依存せずに処理することもできそうだが、
    それはそれでちょっと複雑になりすぎそう。

    特定のパラメータを「サバイバルパラメータ」としてマークして、それに対して上記を Trait としてカバーするような Behavior にしたほうが、
    ある程度柔軟性を持ちつつわかりやすいかもしれない。
    */

    private _basicLoss = paramFPLoss;
    private _prevFP;

    public constructor() {
        super();
        this._basicLoss = paramFPLoss;
        this._prevFP = Infinity;
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LSurvivorBehavior);
        return b;
    }

    onAttached(self: LEntity): void {
        //const battler = this.ownerEntity().getBehavior(LBattlerBehavior);
        //battler.setupExParam(DBasics.params.fp);
    }

    onDecisionPhase(self: LEntity, cctx: SCommandContext, phase: DecisionPhase): SPhaseResult {
        
        if (phase == DecisionPhase.UpdateState) {
            const fp1 = self.getActualParam(MRBasics.params.fp);
            if (fp1 > this._prevFP) {
                this._prevFP = fp1;
            }
            else {
                var loss = this._basicLoss;
                loss *= self.traitsPi(MRBasics.traits.SurvivalParamLossRate, MRBasics.params.fp);
    
                // FP 減少
                self.gainActualParam(MRBasics.params.fp, -loss, true);
    
                
                const fp2 = self.getActualParam(MRBasics.params.fp);
    
                if (fp1 > 0 && fp2 <= 0) {
                    // 今回の更新で FP が 0 になったのであれば、メッセージを表示する
                    cctx.postMessage(tr2("だめだ、もう倒れそうだ！ 早くなにか食べないと！"));
                }
    
                /*
                switch (self.actualParam(REBasics.params.fp)) {
                    case 3:
                        //cctx.postBalloon(entity, 6, false);
                        cctx.postMessage(tr2("だめだ！ もう倒れそうだ！"));
                        //cctx.postWait(entity, 10);
                        break;
                    case 2:
                        cctx.postMessage(tr2("早く・・・なにか食べないと・・・"))
                        //cctx.postWait(entity, 10);
                        break;
                    case 1:
                        cctx.postMessage(tr2("飢え死にしてしまう！"));
                        //cctx.postWait(entity, 10);
                        break;
                }
                */
    
    
                if (fp2 <= 0) {
                    // 満腹度 0 による HP 減少
                    self.gainActualParam(MRBasics.params.hp, -1, true);
    
                    if (self.isDeathStateAffected()) {
                        cctx.postMessage(tr2("おなかがすいて倒れた・・・"));
                    }
                }
                else {
                    // HP自動回復
                    self.gainActualParam(MRBasics.params.hp, 1, true);
                }
                this._prevFP = fp2;
            }
    

            return SPhaseResult.Pass;
        }
        else {
            return SPhaseResult.Pass;
        }
    }
}
