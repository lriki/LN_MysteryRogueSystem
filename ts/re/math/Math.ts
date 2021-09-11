/**
 * 補間関数の定義。
 * 各関数の引数は、t:現在時間(0.0～d) b:開始値 c:値の変化量 (目標値-開始値) d:変化にかける時間。
 */

export function linear(t: number, b: number, c: number, d: number)
{
    return c * (t / d) + b;
};
