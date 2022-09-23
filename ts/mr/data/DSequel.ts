
export type DSequelId = number;

/**
 * DSequel
 *
 * シミュレーション進行中に発生した、VisualAction を、View に伝えるためのデータ構造。
 * これ自体が具体的なスプライトの動作を定義するわけではない。
 * 「歩行」を再生するべき、「攻撃」を再生するべき、といったタイミングで作られる。
 * 
 * なお、歩行は複数アクターが並列で再生できる仕組みを作るのには、イベント発生タイミングを直接 View が
 * 購読してアニメ開始する方法では不可能。（Schedular が View の visualRunning() を監視している都合上不可能）
 * なので、アニメ再生系のイベントは一度キューに入れておいて、全アクターの歩行の処理が完了したら
 * 一斉にアニメーションさせるような流れを組む必要がある。
 * そのキューに入れる単位が DSequel.
 */
export interface DSequel
{
    /** ID (0 is Invalid). */
    id: DSequelId;

    /** Name */
    name: string;

    parallel: boolean;

    /** 一度の Flush で複数あるとき、マージするか */
    fluidSequence: boolean,
}
