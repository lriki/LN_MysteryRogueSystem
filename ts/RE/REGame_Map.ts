import { assert } from "../Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { BlockLayerKind, REGame_Block, TileKind } from "./REGame_Block";
import { REGame_Entity } from "./REGame_Entity";
import { REFloorMapKind, REData } from "../data/REData";
import { REGame } from "./REGame";
import { REMapBuilder } from "../system/REMapBuilder";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { Helpers } from "ts/system/Helpers";
import { RESequelSet } from "./REGame_Sequel";
import { RESystem } from "ts/system/RESystem";




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
    private _entityIds: number[] = [];      // マップ内に登場している Entity
    private _adhocEntityIds: number[] = [];

    private _borderWall: REGame_Block = new REGame_Block(this, -1, -1);   // マップ有効範囲外に存在するダミー要素

    /** Entity が Map に入った時に呼び出される。 */
    public signalEntityEntered: ((entity: REGame_Entity) => void) | undefined;

    /** Entity が Map から離れた時に呼び出される。 */
    public signalEntityLeaved: ((entity: REGame_Entity) => void) | undefined;

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
        assert(this._adhocEntityIds.length == 0);   // 外部で releaseMap してから setup すること

        this._width = width;
        this._height = height;

        const count = this._width * this._height;
        this._blocks = new Array<REGame_Block>(count);
        for (let i = 0; i < count; i++) {
            this._blocks[i] = new REGame_Block(this, i % this._width, i / this._width);

            // TileEntity 追加
            const tile = REGame_EntityFactory.newTile(TileKind.Floor);
            tile.floorId = this._floorId;
            this.markAdhocEntity(tile);
            this._addEntity(tile);
            this._blocks[i].addEntity(BlockLayerKind.Terrain, tile);
        }
    }

    releaseMap() {
        this.destroyAdhocEntities();
        this._removeAllEntities();
    }

    /**
     * 現在の $dataMap の情報をもとに、固定マップを作る。
     */
    setupFixedMap(floorId: number): void {
        this._floorId = floorId;
        this.setupEmptyMap($dataMap.width ?? 1, $dataMap.height ?? 1);
        
        this._blocks.forEach(block => {
            block.setTileIds(MapDataProvidor.tileIds(block.x(), block.y()));
        });
    }

    clear(): void {
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    isValid(): boolean {
        return this._width > 0;
    }

    floorId(): number {
        return this._floorId;
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

    block(x: number, y: number) : REGame_Block {
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

    _addEntity(entity: REGame_Entity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId == this.floorId());
        assert(entity._id > 0);

        this._entityIds.push(entity._id);

        if (this.signalEntityEntered) {
            this.signalEntityEntered(entity);
        }
    }

    _removeEntity(entity: REGame_Entity): void {
        assert(entity.floorId == this.floorId());
        this._entityIds = this._entityIds.filter(x => x != entity._id);
        entity.floorId = 0;
        
        if (this.signalEntityLeaved) {
            this.signalEntityLeaved(entity);
        }
    }

    /** エンティティを、このマップのみの AdhocEntity としてマークする */
    markAdhocEntity(entity: REGame_Entity) {
        this._adhocEntityIds.push(entity.id());
    }

    destroyAdhocEntities() {
        this._adhocEntityIds.forEach(x => {
            REGame.world.entity(x).destroy();
        })
    }

    _removeAllEntities(): void {
        this._entityIds.forEach(x => {
            const entity = REGame.world.entity(x);
            entity.floorId = 0;

            if (this.signalEntityLeaved) {
                this.signalEntityLeaved(entity);
            }
        });

        this._entityIds = [];
    }

    // TODO: Fuzzy とかで、x, y に配置できなければ周辺を探すとか
    _locateEntityFuzzy(entity: REGame_Entity, x: number, y: number): void {
        assert(entity.floorId == this.floorId());
        entity.x = x;
        entity.y = y;
    }


    canEntering(block: REGame_Block, entity: REGame_Entity, layer: BlockLayerKind): boolean {
        // TODO: 壁抜けや浮遊状態で変わる
        return !block.layers()[layer].isOccupied() && block.tileKind() == TileKind.Floor;
    }
    
    canLeaving(block: REGame_Block, entity: REGame_Entity): boolean {
        // TODO: 壁抜けや浮遊状態で変わる
        return /*!block->isOccupied() &&*/ block.tileKind() == TileKind.Floor;
    }
    
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
     * タイル間移動
     * 
     * 指定位置の Tile と Entity のみをもとに、移動可否判定を行いつつ移動する。
     * 他の Entity から移動の割り込みを受けるようなケースでは、moveEntity() の呼び出し元の Command ハンドリング側で対応すること。
     */
    moveEntity(entity: REGame_Entity, x: number, y: number, toLayer: BlockLayerKind): boolean {
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
}

