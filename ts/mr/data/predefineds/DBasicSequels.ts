import { DSequelId } from "../DSequel";


export interface BasicSequels {
    idle: number;

    /** 移動 */
    MoveSequel: number;

    /** 吹き飛ばされ移動 */
    blowMoveSequel: number;

    dropSequel: number;
    
    attack: number;

    /** 
     * 倒されたとき
     * 
     * Sequel はあくまで演出が目的なので、仮に CollapseSequel の発行を忘れたときでも
     * 演出が表示されないだけで Entity は消される等処理される。
     */
    CollapseSequel: number;

    /** デフォルトの行動制限状態 */
    commonStopped: number;

    /** 睡眠状態 (浅い眠り、特殊な浅い眠り、睡眠、バクスイ) */
    asleep: number;

    escape: DSequelId;

    earthquake2: DSequelId;

    useItem: DSequelId;

    explosion: DSequelId;

    down: DSequelId;

    warp: DSequelId;

    stumble: DSequelId;
    jump: DSequelId;
    crack: DSequelId;
}
