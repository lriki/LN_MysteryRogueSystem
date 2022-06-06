import { DAction } from "ts/re/data/DAction";
import { REData } from "../data/REData";
import { LEntity } from "../objects/LEntity";
import { SEffectContext } from "./SEffectContext";

/**
 * RECommand の処理結果
 * 
 * 
 *
 * NOTE:
 * Behavior の Command 実行処理は、直前の Behavior の Response 結果にかかわらず呼び出されます。
 * 直前の結果が Pass であるような前提を期待せず、基本的には
 * 「直前の Behavior の処理で Command が失敗したら、この Command も実行しない」といった判定を入れてください。
 * 例外は「武器を振るだけでステータスダウン」のような、Command の成否にかかわらず実行したい処理です。
 * 
 */
export enum SCommandResponse
{
    /** 
     * 目的の処理を、意味のある結果を以って実行し終え、Command は実行済みであることを示します。
     * 
     * Behavior の実装の中でこのコマンドを return した場合、後続の Behavior に Command は通知されません。
     */
    Handled,

    /** RECommand はハンドリングされませんでした。続けて後続の Behavior に RECommand を通知します。 */
    Pass,

    /** 状態異常の制限により、目的の処理を実行できなかったことを示します。後続の Behavior に RECommand は通知されません。 */
    Canceled,

    //Aborted,

    /*
    デフォルトの動作をオーバーライドしたいケース
    - Behavior を additionalBehavior として追加する



    全部 Behavior が Pass を返した場合は？
    - Entity は指定コマンドに対して無関心であるか、処理が想定されていない（未知のアクションである）ということ。
      この場合データ保護の観点から、コマンド発行側は「意味のないことをした」として処理しなければならない。
      例えばアイテムっぽいものを拾おうとしたが、そのアイテムっぽいEntity が
      Pick アクションを処理できない (Pass を返した) 場合は、elona 的な「空気をつかんだ」にする。
    */
}

export enum SPhaseResult {
    /** Behavior Chain の実行を続ける。 */
    Pass,

    /** Behavior Chain の実行を終了する。 */
    Handled,
}

export function checkContinuousResponse(r: SCommandResponse): boolean {
    return r == SCommandResponse.Pass;
}



