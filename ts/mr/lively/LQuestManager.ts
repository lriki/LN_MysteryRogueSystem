import { MRSerializable } from "../Common";

/**
 * 発生している・請けているクエストを管理する
 * 
 * クエストを受けるのは Unit ではなく Player 自身である。
 * ゲーム中に1つのインスタンスが存在する。
 * 操作キャラを切り替えても、クエストノートは共有する感じ。
 */
@MRSerializable
export class LQuestManager {

}

