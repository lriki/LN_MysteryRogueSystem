import { assert } from "../Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { BlockLayerKind, REGame_Block, TileKind } from "./REGame_Block";
import { REGame_Entity } from "./REGame_Entity";
import { REFloorMapKind, REData } from "../data/REData";
import { REGame } from "./REGame";
import { REMapBuilder } from "../system/REMapBuilder";
import { REEntityFactory } from "../system/REEntityFactory";
import { Helpers } from "ts/system/Helpers";
import { RESequelSet } from "./REGame_Sequel";
import { RESystem } from "ts/system/RESystem";
import { Vector2 } from "ts/math/Vector2";
import { DLand } from "ts/data/DLand";
import { eqaulsEntityId, LEntityId } from "./LObject";




// serializable
export interface RE_Game_Data
{

}

/**
 * アクティブなマップオブジェクト。インスタンスは1つだけ存在する。
 * 
 * Map 遷移が行われたとき、World に存在する Entity のうち、
 * この Map 上にいることになっている Entity は、自動的に追加される。
 * 
 * このクラスのメソッドによる登場や移動は Sequel を伴わない。そういったものは Command 処理側で対応すること。
 */
export class REGame_Map
{
    private _floorId: number = 0;
    private _width: number = 0;
    private _height: number = 0;
    private _blocks: REGame_Block[] = [];
    private _entityIds: LEntityId[] = [];      // マップ内に登場している Entity

    private _borderWall: REGame_Block = new REGame_Block(this, -1, -1);   // マップ有効範囲外に存在するダミー要素

    constructor() {
    }

    setup(floorId: number) {
        assert(this._entityIds.length == 0);
        this._floorId = floorId;
        const builder = new REMapBuilder(this);
        REGame.integration.onLoadFixedMap(builder);
    }

    setupEmptyMap(width: number, height: number) {
        assert(this._entityIds.length == 0);        // 外部で releaseMap してから setup すること

        this._width = width;
        this._height = height

        const count = this._width * this._height;
        this._blocks = new Array<REGame_Block>(count);
        for (let i = 0; i < count; i++) {
            const x = Math.trunc(i % this._width);
            const y = Math.trunc(i / this._width);
            this._blocks[i] = new REGame_Block(this, x, y);

            // TileEntity 追加
            const tile = REEntityFactory.newTile(TileKind.Floor);
            tile.floorId = this._floorId;
            tile.x = x;
            tile.y = y;
            this._addEntityInternal(tile);
            this._blocks[i].addEntity(BlockLayerKind.Terrain, tile);
        }
    }

    releaseMap() {
        this._removeAllEntities();
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    isValid(): boolean {
        return this._floorId > 0 && this._width > 0;
    }

    floorId(): number {
        return this._floorId;
    }

    land(): DLand {
        return REData.lands[REData.floors[this._floorId].landId];
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    isFixedMap(): boolean {
        return REData.floors[this._floorId]?.mapKind == REFloorMapKind.FixedMap;
    }

    isRandomMap(): boolean {
        return REData.floors[this._floorId]?.mapKind == REFloorMapKind.RandomMap;
    }

    block(x: number, y: number) : REGame_Block;
    block(pos: Vector2, _?: any) : REGame_Block;
    block(a1: any, a2: any) : REGame_Block {
        let x, y;
        if (a1 instanceof Vector2) {
            x = a1.x;
            y = a1.y;
        }
        else {
            x = a1;
            y = a2;
        }

        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {
            return this._borderWall;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }

    entities(): REGame_Entity[] {
        return this._entityIds
            .map(id => { return REGame.world.entity(id); })
            .filter((e): e is REGame_Entity => { return e != undefined; });
    }

    _addEntityInternal(entity: REGame_Entity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId == this.floorId());
        assert(entity.id().index > 0);
        assert(!entity.hasParent());

        this._entityIds.push(entity.id());
        entity.setParentMap(this);

        REGame.integration.onEntityEnteredMap(entity);
    }

    /**
     * Entity を現在の Floor の指定座標に登場させる。
     * @param entity 
     * @param x 
     * @param y 
     * 既に現在の Floor 上に登場済みの Entity に対してこのメソッドを呼び出すと失敗する。
     */
    appearEntity(entity: REGame_Entity, x: number, y: number, layer?: BlockLayerKind): void {
        assert(entity.floorId == 0);
        entity.floorId= this.floorId();
        this.locateEntity(entity, x, y, layer);
        this._addEntityInternal(entity);
    }

    // appearEntity の、マップ遷移時用
    _reappearEntity(entity: REGame_Entity): void {
        assert(entity.floorId == this.floorId());
        assert(!entity.isTile());   // Tile は setup で追加済みのため、間違って追加されないようにチェック
        
        const block = this.block(entity.x, entity.y);
        const layer = entity.queryProperty(RESystem.properties.homeLayer);
        block.addEntity(layer, entity);

        this._addEntityInternal(entity);
    }

    _removeEntity(entity: REGame_Entity): void {
        this._entityIds = this._entityIds.filter(x => !eqaulsEntityId(x, entity.id()));
        this._removeEntityHelper(entity);
    }

    _removeAllEntities(): void {
        this._entityIds.forEach(x => {
            const entity = REGame.world.entity(x);
            this._removeEntityHelper(entity);
            //_removeEntity(entity);
            //entity.floorId = 0;
            //REGame.integration.onEntityLeavedMap(entity);
        });

        this._entityIds = [];
    }

    private _removeEntityHelper(entity: REGame_Entity) {
        assert(entity.parentIsMap());
        entity.clearParent();

        assert(entity.floorId == this.floorId());
        entity.floorId = 0;

        const block = this.block(entity.x, entity.y);
        const result = block.removeEntity(entity);
        assert(result);
        
        REGame.integration.onEntityLeavedMap(entity);
    }





    canEntering(block: REGame_Block, entity: REGame_Entity, layer: BlockLayerKind): boolean {
        // TODO: 壁抜けや浮遊状態で変わる
        return !block.layers()[layer].isOccupied() && block.tileKind() == TileKind.Floor;
    }
    
    canLeaving(block: REGame_Block, entity: REGame_Entity): boolean {
        // TODO: 壁抜けや浮遊状態で変わる
        return /*!block->isOccupied() &&*/ block.tileKind() == TileKind.Floor;
    }
    
    // NOTE: 斜め移動の禁止は、隣接タイルや Entity が、自分の角を斜め移動可能とするか、で検知したほうがいいかも。
    // シレン5石像の洞窟の石像は、Entity扱いだが斜め移動禁止。
    // ちなみに、丸太の罠等では斜めすり抜けできる。
    checkPassage(entity: REGame_Entity, dir: number, toLayer?: BlockLayerKind): boolean {
        const offset = Helpers.dirToTileOffset(dir);
        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(entity.x + offset.x, entity.y + offset.y);
        const layer = (toLayer) ? toLayer : entity.queryProperty(RESystem.properties.homeLayer);

        if (this.canLeaving(oldBlock, entity) && this.canEntering(newBlock, entity, layer)) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * 移動可能判定を伴うタイル間移動
     * 
     * 指定位置の Block と Entity のみをもとに、移動可否判定を行いつつ移動する。
     * 
     * 他の Entity から移動の割り込みを受けるようなケースでは、moveEntity() の呼び出し元の Command ハンドリング側で対応すること。
     */
    moveEntity(entity: REGame_Entity, x: number, y: number, toLayer: BlockLayerKind): boolean {
        assert(entity.floorId == this.floorId());
        
        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(x, y);

        if (this.canLeaving(oldBlock, entity) && this.canEntering(newBlock, entity, toLayer)) {
            oldBlock.removeEntity(entity);
            entity.x = x;
            entity.y = y;
            newBlock.addEntity(toLayer, entity);
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Entity の位置設定
     * 
     * moveEntity() と異なり、移動可能判定を行わずに強制移動する。
     * マップ生成時の Entity 配置や、ワープ移動などで使用する。
     */
    locateEntity(entity: REGame_Entity, x: number, y: number, toLayer?: BlockLayerKind): void {
        assert(entity.floorId == this.floorId());

        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(x, y);
        
        const layer = (toLayer) ? toLayer : entity.queryProperty(RESystem.properties.homeLayer);

        oldBlock.removeEntity(entity);
        entity.x = x;
        entity.y = y;
        newBlock.addEntity(layer, entity);
    }
}

