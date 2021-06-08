import { assert } from "ts/Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { LEntity } from "./LEntity";
import { LMap } from "./LMap";
import { FBlockComponent } from "ts/floorgen/FMapData";
import { LEntityId } from "./LObject";
import { REGame } from "./REGame";
import { LEnemyBehavior } from "./behaviors/LEnemyBehavior";
import { LSanctuaryBehavior } from "./behaviors/LSanctuaryBehavior";
import { BlockLayerKind, REBlockLayer } from "./LBlockLayer";

export type LRoomId = number;


/** Tile の本質的な形状 */
export enum TileShape {
    /** 中空 */
    Void,

    /** 床 */
    Floor,

    /** 壁 */
    Wall,

    /** 壊れない壁 */
    HardWall,

    /** 水路 */
    Water,

//	/** マップの外周の壊せない壁。配列外を示すダミー要素。 */
//	BorderWall,
}

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
 * Block 内の同一レイヤーには、複数の Entity が同時に存在することがありえる。
 * 貫通属性を持ち、複数同時発射されれる Projectile など。（シレン2のかまいたちの矢等）
 * 
 *
 * [2020/12/13] やっぱり Block も Entity にしたほうがいい？
 * ----------
 * アイテム投げなどで、「今いる場所から除外する」という処理を抽象化したい。
 * - アイテムがインベントリにあれば、インベントリから取り除く
 * - アイテムが床にあれば、床 (Block) から取り除く
 * 
 * この「Entity を保持する人」と Entity は QObject みたいな親子関係を持つ。
 * 子から見たら親は常に1つ。
 * 参照はセーブデータに保存することもあるので EntityID で。
 * いずれの親からも参照されていない Entity は GC の対象となる。
 * 
 * でもそう考えると、Unique Entity は World が親となる。
 * World を Entity にするのはなんか違う。
 * 
 * 除外することは、親と子の間のやり取りだけでは済まない。
 * 手放せずの土偶があるようなときは、インベントリからの除外はできなくなる。
 * 
 * シレン5の動く床では、乗っている Entity を移動させるよりは
 * Block 自体を移動してしまった方が都合がよい。
 * - やりすごしの壺状態や、張り付いた聖域の巻物はそのまま移動する。
 * - でも浮遊状態の Entity は移動しないので注意が必要か？
 * 
 * 
 *
 * [2020/9/28-2] 「Block から離れるAction」「Blockに入るAction」を分けて考える？
 * ----------
 * 再考。Block の Entity 化とは別件なので。
 * 
 * タイガーウッホ系の投擲を考えるときは必須になりそう。これはたんなるBlock 間移動では済まない。
 * [Block から離れる] は他と共通でいいが、[Blockへ向かって投げる] は他のひまガッパ系と同様のルーチンを使う。
 * またはね返しの盾ではね返せるので、必ず先方Blockに着地できないケースも出てくる。
 * 一時的に、いずれの Block にも属していないような状態を考える必要がある。
 * 
 * 2段階にすることのメリットは、状態異常からではなく、別 Entity から Unit へ、行動制限等がかけられる、ということ。
 * ステートレスなトラップ、というより拡張的なギミックを作るのに利用できる。
 * 
 * 周囲の Block に存在する Unit を束縛するような土偶とかが考えられるか。
 * トラバサミ状態ではなく、Unit は自分から土偶を壊すこともできる。壊した瞬間解放されるが、状態異常ではないので、
 * Unit に Behavior を Attach/Detach する必要もない。(相手側に状態を持たせる必要がない)
 * 
 * [2020/9/28] Block も Entity としてみる？
 * ----------
 * ひとまず "しない" 方向で行ってみる。
 * 
 * もともとトラバサミの検討中に出てきたアイデアで、「Block から離れるAction」「Blockに入るAction」を分けて考えようとしていた。
 * Block 内の地形、アイテム、ワナEntityを Blockの関係 Entity とすることで Command の送信側としては相手が何かを考えず 「blockへpost」すればいいことにしてみたい。
 * 
 * ただこれを実装するとなると、2つの Action が結果の依存関係を持って連続実行されることになるため、
 * 最初の Action の結果を 後続に通知する必要がある。
 * 今は Command 単位ではその仕組みがあるが、さらに Action 単位でも持たせる必要があり、複雑になる。
 * 
 * Note:
 * もしこの仕組みで行く場合、Block は例えば「Block に入る Action」によって送信されてくる onPreReaction, onReaction を、
 * "send" で関係 Entity に橋渡しする必要がある。"post" だと Action4Command の実行順のつじつまが合わなくなるのでNG。
 * 
 * ### 何か拡張 Action を作るときは、Block が Entity になっていた方が便利か？
 * 
 * Unit を捕まえた後投げるような、シレン2のタイガーウッホ系を考えてみる。
 * 特技によって Unit を任意の Block に「落とす」Action が必要になってくるが、この時の reactor を検索する処理が、Enemyの Behavior 側に必要となる。
 * Behavior 側に定型的な処理がたくさん書かれることになるので、Block に対して postAction 出来ればかなり楽なのだが…。
 * 
 * ただこれは、「reactor が何かは考えずにとりあえず Block に対して post したい」ケースがほとんどなので、
 * reactor を指定しない postActionToBlock とかを作ってもいいかもしれない。
 * 
 * 
 * [2020/9/6] Layer
 * ----------
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
export class LBlock// extends LObject
{
    // 固定マップ等で、決まった ID のタイルを表示した場合はここに値を持たせておく。
    // 常に持たせておくとデータ量もそれなりになるので、今はオプションにしておく。
    // Note: [0] ... 地面 (A タイル)
    // Note: [1,2,3] ... 装飾 (B, C タイル. "自動" モードでは後ろの番号から配置されていく)
    private _tileIds: number[] | undefined;

    private _layers: REBlockLayer[];    // 要素番号は BlockLayerKind

    private _x: number;
    private _y: number;

    _roomId: LRoomId = 0;
    _blockComponent: FBlockComponent = FBlockComponent.None;
    _continuation: boolean = false;
    _doorway: boolean = false;

    _passed: boolean = false;   // 通過フラグ。操作キャラクターが通過したか (Player が一度でも把握したか)
    
    _tileShape: TileShape = TileShape.Floor;


    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
        this._layers = [new REBlockLayer(), new REBlockLayer(), new REBlockLayer(), new REBlockLayer(), new REBlockLayer()];
    }

    x(): number {
        return this._x;
    }

    y(): number {
        return this._y;
    }

    /** 表示用 TileId. 通行判定や部屋内判定に使用するものではない点に注意。 */
    public tileIds(): number[] | undefined {
        return this._tileIds;
    }

    /** 表示用 TileId. 通行判定や部屋内判定に使用するものではない点に注意。 */
    public setTileIds(tileIds: number[]): void {
        this._tileIds = tileIds;
        MapDataProvidor.onUpdateBlock(this);
    }

    //tile(): LEntity {
    //    return this._layers[BlockLayerKind.Terrain].entities()[0];
    //}

    tileShape(): TileShape {
        //const attr = this.tile().findAttribute(RETileAttribute);
        //return attr ? attr.tileKind() : TileKind.Void;
        return this._tileShape;
    }

    public isFloorLikeShape(): boolean {
        return this._tileShape == TileShape.Floor;
    }

    public isWallLikeShape(): boolean {
        return this._tileShape == TileShape.Wall || this._tileShape == TileShape.HardWall;
    }

    /** 部屋内のブロックであるか */
    public isRoom(): boolean {
        return this._roomId > 0;
    }

    /** 通路あるか */
    public isPassageway(): boolean {
        return !this.isRoom();
    }

    public isContinuation(): boolean {
        return this._continuation;
    }

    /** 部屋の入口であるか */
    public isDoorway(): boolean {
        return this._doorway;
    }

    layers(): readonly REBlockLayer[] {
        return this._layers;
    }

    layer(kind: BlockLayerKind): REBlockLayer {
        return this._layers[kind];
    }

    addEntity(layerKind: BlockLayerKind, entity: LEntity) {
        const layer = this._layers[layerKind];
        assert(!layer.isContains(entity));  // 複数追加禁止
        assert(!layer.isOccupied());        // 既に占有されている時は追加禁止

        if (layerKind == BlockLayerKind.Terrain) {
            // Tile Layer への複数追加は禁止
            assert(this._layers[layerKind].entities().length == 0);
        }

        layer.addEntity(entity);
    }

    removeEntity(entity: LEntity): boolean {
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i].removeEntity(entity)) {
                return true;
            }
        }
        return false;
    }

    removeAllEntites() {
        for (let i = 0; i < this._layers.length; i++) {
            this._layers[i].removeAllEntites();
        }
    }

    aliveEntity(layer: BlockLayerKind): LEntity | undefined {
        const l = this._layers[layer];
        return l.entities().find(x => x.isAlive());
    }

    /** Entity が含まれている Layer を検索する */
    public findEntityLayerKind(entity: LEntity): BlockLayerKind | undefined {
        const index = this._layers.findIndex(x => x.isContains(entity));
        if (index >= 0)
            return index;
        else
            return undefined;
    }
    
    /** Entity が含まれている Layer を検索する */
    public findEntity(predicate: (entity: LEntity) => boolean): LEntity | undefined {
        for (const layer of this._layers) {
            for (const id of layer.entityIds()) {
                const entity = REGame.world.entity(id);
                if (predicate(entity)) return entity;
            }
        }
        return undefined;
    }

    /** 指定した Entity がこの Block に含まれているか */
    public containsEntity(entity: LEntity): boolean {
        return this.findEntityLayerKind(entity) != undefined;
    }

    /** 指定した Entity にとって、この Block が浄化属性 (聖域の巻物) となるか */
    public checkPurifier(entity: LEntity): boolean {
        // FIXME: とりあえず決め打ちで、Enemy に対する SanctuaryBehavior のみチェックする
        if (entity.findBehavior(LEnemyBehavior)) {
            const sanctuary = this.findEntity(e => !!e.findBehavior(LSanctuaryBehavior));
            if (sanctuary) {
                // TODO: 張り付き？
                return true;
            }
        }
        return false;
    }
}
