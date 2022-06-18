import { assert, MRSerializable } from "ts/re/Common";
import { LEntity } from "./LEntity";
import { FBlockComponent } from "ts/re/floorgen/FMapData";
import { REGame } from "./REGame";
import { REBlockLayer } from "./LBlockLayer";
import { LRoom } from "./LRoom";
import { RESystem } from "ts/re/system/RESystem";
import { DBlockLayerKind } from "../data/DCommon";
import { LRoomId } from "./LCommon";
import { DTemplateMapPartIndex } from "../data/DTemplateMap";

/** Tile の本質的な形状 */
export enum LTileShape {
    /** 中空 */
    Void = 0,

    /** 床 */
    Floor = 1,

    /** 壁 */
    Wall = 2,

    /** 壊れない壁 */
    HardWall = 3,

    /** 水路 */
    Water = 4,

//	/** マップの外周の壊せない壁。配列外を示すダミー要素。 */
//	BorderWall,
}

export enum LBlockSystemDecoration {
    None,
    ItemShop,
}

/**
 * GameBlock
 * 
 * Block 内の同一レイヤーには、複数の Entity が同時に存在することがありえる。
 * 貫通属性を持ち、複数同時発射されれる Projectile など。（シレン2のかまいたちの矢等）
 */
 @MRSerializable
export class LBlock {
    // Block は Entity 扱いしない
    // ----------
    // 過去、Entity 扱いしようとしたのでメモ書き。
    // 動機は各種処理の抽象化。たとえば次のような感じ。
    // - 攻撃するときは目の前の Block から相手を探すのではなく、Block に対してスキル効果を発動し、Block 側でしかるべきターゲットを決めようとした
    // - 移動床や壁の再生機能を考えた時、Block 自体が Behavior を持てると都合がよいと考えた
    // 確かに一理あるのだが、次のようなデメリットもある。
    // - Entity の数がとんでもなく多くなる。単純に処理が追い付かない。
    // - 対象のランダム選択攻撃など、攻撃側で Block の中にいる Entity を知りたいことがままある。
    // - 単純に処理が複雑になる。
    // デメリットの方が大きいと判断したため、Block は Entity 扱いしないこととする。


    // 固定マップ等で、決まった ID のタイルを表示した場合はここに値を持たせておく。
    // 常に持たせておくとデータ量もそれなりになるので、今はオプションにしておく。
    // Note: [0] ... 地面 (A タイル)
    // Note: [1,2,3] ... 装飾 (B, C タイル. "自動" モードでは後ろの番号から配置されていく)
    //private _tileIds: (number | undefined)[];

    private _layers: REBlockLayer[];    // 要素番号は BlockLayerKind

    private _mx: number;
    private _my: number;

    _roomId: LRoomId = 0;
    _blockComponent: FBlockComponent = FBlockComponent.None;
    _continuation: boolean = false;
    _doorway: boolean = false;
    _shopkeeperLine: boolean = false;   // 店入口３マス

    _passed: boolean = false;   // 通過フラグ。操作キャラクターが通過したか (Player が一度でも把握したか)
    
    _tileShape: LTileShape = LTileShape.Floor;
    _templatePartIndex: DTemplateMapPartIndex;

    // お店の床など、ゲームシステムとして明示したい装飾
    _systemDecoration: LBlockSystemDecoration = LBlockSystemDecoration.None;

    // 小石など、ゲームシステムとか関係ない装飾
    _visualDecorationType: number = 0;   // 0:invalid
    _visualDecorationIndex: number = 0;  // 0~

    constructor(x: number, y: number) {
        this._mx = x;
        this._my = y;
        this._layers = [new REBlockLayer(), new REBlockLayer(), new REBlockLayer(), new REBlockLayer(), new REBlockLayer()];
        this._templatePartIndex = 0;
    }

    /** 絶対座標 X */
    public get mx(): number {
        return this._mx;
    }

    /** 絶対座標 Y */
    public get my(): number {
        return this._my;
    }

    public room(): LRoom | undefined {
        if (this._roomId > 0)
            return REGame.map.room(this._roomId);
        else
            return undefined;
    }

    /** 表示用 TileId. 通行判定や部屋内判定に使用するものではない点に注意。 */
    //public tileIds(): number[] | undefined {
    //    return this._tileIds;
    //}

    /** 表示用 TileId. 通行判定や部屋内判定に使用するものではない点に注意。 */
    //public setTileIds(z: number, tileId: number): void {
    //    this._tileIds[z] = tileId;
    //    RESystem.integration.onUpdateTile(this._x, this._y, z, tileId);
    //}

    //tile(): LEntity {
    //    return this._layers[BlockLayerKind.Terrain].entities()[0];
    //}

    tileShape(): LTileShape {
        //const attr = this.tile().findAttribute(RETileAttribute);
        //return attr ? attr.tileKind() : TileKind.Void;
        return this._tileShape;
    }

    public get templatePartIndex(): DTemplateMapPartIndex {
        return this._templatePartIndex;
    }

    public setSystemDecoration(value: LBlockSystemDecoration): void {
        this._systemDecoration = value;
        RESystem.integration.onUpdateBlock(this);
    }

    public systemDecoration(): LBlockSystemDecoration {
        return this._systemDecoration;
    }

    public setVisualDecoration(type: number, index: number): void {
        this._visualDecorationType = type;
        this._visualDecorationIndex = index;
    }

    /** 地面上で、歩行による移動が可能であるか。(中空や水地形ではない) */
    public isFloorLikeShape(): boolean {
        return this._tileShape == LTileShape.Floor;
    }

    public isWallLikeShape(): boolean {
        return this._tileShape == LTileShape.Wall || this._tileShape == LTileShape.HardWall;
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

    layer(kind: DBlockLayerKind): REBlockLayer {
        return this._layers[kind];
    }

    addEntity(layerKind: DBlockLayerKind, entity: LEntity) {
        const layer = this._layers[layerKind];
        assert(!layer.isContains(entity));  // 複数追加禁止
        //assert(!layer.isOccupied());        // 既に占有されている時は追加禁止

        if (layerKind == DBlockLayerKind.Terrain) {
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

    aliveEntity(layer: DBlockLayerKind): LEntity | undefined {
        const l = this._layers[layer];
        return l.entities().find(x => x.isAlive());
    }

    /** Block に含まれている Entity を取得する。 layerKind を指定した場合は、 */
    public getEntities(layerKind?: DBlockLayerKind): LEntity[] {
        const result: LEntity[] = [];
        if (layerKind) {
            const layer = this._layers[layerKind];
            for (const entity of layer.entities()) {
                result.push(entity);
            }
        }
        else {
            for (const layer of this._layers) {
                for (const entity of layer.entities()) {
                    result.push(entity);
                }
            }
        }
        return result;
    }

    public getFirstEntity(layerKind?: DBlockLayerKind): LEntity | undefined {
        const entities = this.getEntities(layerKind);
        return entities.length > 0 ? entities[0] : undefined;
    }

    /** Entity が含まれている Layer を検索する */
    public findEntityLayerKind(entity: LEntity): DBlockLayerKind | undefined {
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
}
