
export type DParameterId = number;
export type DXParamId = number;
export type DSParamId = number;

/**
 * Unit(Battler) が持つパラメータ
 * 
 * Property との違いは、戦闘ダメージなどに関係するものを集めたものである、という点。すべて number で表される。
 * 
 * 拡張パラメータ
 * ----------
 * 拡張パラメータはレベルアップに伴い成長することは '無い'。
 * 最低限必要なのは "満腹度"。
 * 
 * サバイバル的な拡張を想定すると、
 * - 水分
 * - 疲労度
 * 
 * あとこれらのターン経過による増減量を決めるためのパラメータ。
 * 
 * - ハラヘリ速度 (SParam) ※SParam は非ダメ側のパラメータと考えるのが良い。ターン経過で World から受ける満腹度へのダメージを抑える、と考える。
 * - HP 回復速度 (SParam)
 * 
 * 
 * [2021/5/17] パラメータは誰が持つ？(特に拡張パラメータ)
 * ----------
 * HPと満腹度。
 * Entity に持たせるか、BattlerBehavior と SurvivorBehavior に分けて持たせるか。
 * 
 * ひとまずは BattlerBehavior でいいかな… 明確に分ける理由が無い。メモリ使用量くらい。
 * 拡張パラメータも含め、すべてのパラメータは "ダメージ計算処理" が適用される仕組みになるので、
 * その辺が共通化できる BattlerBehavior に持たせるのが都合いいかも。
 * 
 * 
 * 
 * [2021/5/16] 
 * ----------
 * エディタからの任意パラメータ追加はいったん見送ろう。
 * まだシステムがばっちり固まってるわけじゃないので、仕様が決めきれない。
 * 
 * 一応のアイデアとしては、パラメータが 0 になったら何かステートを付加して、ペナルティはそっちで付ける、とか。
 */
export interface REData_Parameter
{
    /** ID (0 is Invalid). */
    id: number;

    /** Name */
    name: string;

    /** RMMZ 標準パラメータであるか。敵味方にかかわらず、すべての Battler はこのパラメータインスタンスを持つ。0 は HP. -1 が無効値。 */
    battlerParamId: number;

    /** 拡張パラメータの時の、初期値 */
    initialIdealValue: number;
}
