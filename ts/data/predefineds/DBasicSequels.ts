

export interface BasicSequels {
    /** 移動 */
    MoveSequel: number;

    /** 吹き飛ばされ移動 */
    blowMoveSequel: number;
    
    attack: number;

    /** 
     * 倒されたとき
     * 
     * Sequel はあくまで演出が目的なので、仮に CollapseSequel の発行を忘れたときでも
     * 演出が表示されないだけで Entity は消される等処理される。
     */
    CollapseSequel: number;
}
