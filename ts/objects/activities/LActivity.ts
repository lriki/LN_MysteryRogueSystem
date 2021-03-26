
/**
 * 主に GUI 上から選択できる各種行動
 * 
 * Command のように利用できるが、Activity は必ず Dialog から post される。
 * 大方針として、プレイヤー操作などコマンドチェーンの外側から実行される Command を表すものであり、
 * 行動履歴として記録される。シリアライズされ、ファイルに保存される。
 */
export class LActivity {

}

