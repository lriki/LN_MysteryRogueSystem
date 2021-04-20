import { DParameterId } from "./predefineds/DBasicParameters";

export type DEnemyId = number;

/**
 * モンスターデータ。
 * 
 * RMMZ の Enemy と同じ意味のデータだが、味方勢力に属することもあるので "Enemy" という言葉の意味とちょっと違くなる。
 * ひとまず "Monster" という言葉を採用。
 * ↑
 * やっぱりナシ。
 * ツクールと連携するので、Enemy という名前の方がデータの対応がわかりやすい。
 */
export interface RE_Data_Monster
{
    /** ID (0 is Invalid). */
    id: DEnemyId;

    key: string;

    /** Name. */
    name: string;

    /** 取得経験値 */
    exp: number;

    /** 各基本パラメータ (index は BasicParameters) */
    idealParams: DParameterId[];

    traits: IDataTrait[];
}

