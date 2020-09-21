import { MapDataProvidor } from "./MapDataProvidor";
import { REGame_Map } from "./REGame_Map";

/**
 * GameBlock
 *
 * GameBlock 自体は単なる入れ物。
 * これは、例えば壁堀りなどで Tile への更新通知を特別扱いしないようにするための対策。
 * アクション発動側は、壁堀り属性の付いた「攻撃コマンド」を「GameBlock」へ送信するだけでよい。
 * GameBlock 内にいるエンティティに順番にコマンドを送っていき、Wall な Block がいたらそれを取り除いたりする。
 *
 * 階段、壁、Item などを Block の中へ入れていくイメージ。
 *
 * @note
 *			なお、このシステムを作るのに参考にした caves-of-zircon-tutorial では、
 *			Tile はキャラクターの見た目である記号や色を持つため、Lumino でいうところのスプライトと考えられる。
 *
 * @note Layer
 * - アイテムとキャラクターは同じマスの上に乗ることができる。
 * - キャラクターがすり抜け状態であれば、壁Entityと同じマスに乗ることができる。
 * - アイテム・ワナ・階段は同じマスの上に乗ることはできない。
 * - キャラクター・土偶は同じマスに乗ることはできない。
 * - アイテムや階段は壁に埋まった状態で存在できる。（埋蔵金・黄金の階段）
 * 単純に BlockOccupierAttribute で他 Entity を侵入できないようにするだけでは足りない。グループ化の仕組みが必要。
 * また攻撃 Action などは基本的に、Block 内に複数の Entity がある場合は「上」から処理していく。
 * 例えば、アイアンハンマーを装備して、ワナの上にいるモンスターに攻撃すると、ワナは壊れずモンスターにダメージが行く。
 * 単純に Entity のリストを持っているだけだと、並べ替えなどを考慮しなければならなくなる。
 * これらをグループ化するために、Layer という仕組みを使ってみる。
 *
 * - 主に SafetyArea においてマップ移動や通行禁止の Event を、"すり抜け" 属性 ON で置けるようにするため、ひとつの Layer には複数の Entity が入れる。
 *
 * [2020/9/6] 壁も Entity にしたほうがいいの？
 * ----------
 * しておいた方がいろいろ拡張しやすい。
 * 例えば自動修復する壁とかも作れる。
 * elona みたいに固定マップの壊した壁が一定時間すると復活するようなものを実装するには必要になる。
 * 
 */
export class REGame_Block
{
    // 固定マップ等で、決まった ID のタイルを表示した場合はここに値を持たせておく。
    // 常に持たせておくとデータ量もそれなりになるので、今はオプションにしておく。
    // Note: [0] ... 地面 (A タイル)
    // Note: [1,2,3] ... 装飾 (B, C タイル. "自動" モードでは後ろの番号から配置されていく)
    private _tileIds: number[] | undefined;

    private _x: number;
    private _y: number;

    constructor(map: REGame_Map, x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    x(): number {
        return this._x;
    }

    y(): number {
        return this._y;
    }

    tileIds(): number[] | undefined {
        return this._tileIds;
    }

    setTileIds(tileIds: number[]): void {
        this._tileIds = tileIds;
        MapDataProvidor.onUpdateBlock(this);
    }
}
