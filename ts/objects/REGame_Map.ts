import { assert } from "../Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { BlockLayerKind, REGame_Block, TileKind } from "./REGame_Block";
import { REGame_Entity } from "./REGame_Entity";
import { REFloorMapKind, REData, RE_Data_Land } from "../data/REData";
import { REGame } from "./REGame";
import { REMapBuilder } from "../system/REMapBuilder";
import { REEntityFactory } from "../system/REEntityFactory";
import { Helpers } from "ts/system/Helpers";
import { RESequelSet } from "./REGame_Sequel";
import { RESystem } from "ts/system/RESystem";
import { EntityId } from "ts/system/EntityId";
import { Vector2 } from "ts/math/Vector2";




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
    private _entityIds: EntityId[] = [];      // マップ内に登場している Entity
    private _adhocEntityIds: EntityId[] = [];

    private _borderWall: REGame_Block = new REGame_Block(this, -1, -1);   // マップ有効範囲外に存在するダミー要素

    constructor() {
    }

    setup(floorId: number) {
        assert(this._entityIds.length == 0);
        this._floorId = floorId;
        const builder = new REMapBuilder(this);
        RESystem.integration.onLoadFixedMap(builder);
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
            const tile = REEntityFactory.newTile(TileKind.Floor);
            tile.floorId = this._floorId;
            this.markAdhocEntity(tile);
            this._addEntity(tile);
            this._blocks[i].addEntity(BlockLayerKind.Terrain, tile);
        }
    }

    releaseMap() {
        this.destroyAdhocEntities();
        this._removeAllEntities();
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

    land(): RE_Data_Land {
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

    _addEntity(entity: REGame_Entity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId == this.floorId());
        assert(entity._id.index > 0);

        this._entityIds.push(entity._id);

        RESystem.integration.onEntityEnteredMap(entity);
    }

    _removeEntity(entity: REGame_Entity): void {
        assert(entity.floorId == this.floorId());
        this._entityIds = this._entityIds.filter(x => x != entity._id);
        entity.floorId = 0;
        
        RESystem.integration.onEntityLeavedMap(entity);
    }

    /** エンティティを、このマップのみの AdhocEntity としてマークする */
    markAdhocEntity(entity: REGame_Entity) {
        this._adhocEntityIds.push(entity.id());
    }

    destroyAdhocEntities() {
        this._adhocEntityIds.forEach(x => {
            REGame.world.entity(x).destroy();
        })
        this._adhocEntityIds = [];
    }

    _removeAllEntities(): void {
        this._entityIds.forEach(x => {
            const entity = REGame.world.entity(x);
            entity.floorId = 0;
            RESystem.integration.onEntityLeavedMap(entity);
        });

        this._entityIds = [];
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

        console.log("canLeaving?", this.canLeaving(oldBlock, entity));
        console.log("canEntering?", this.canEntering(newBlock, entity, layer));
        console.log("layer", layer);
        console.log("newBlock", newBlock);

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

        console.log("locate:", layer);
        console.log("entity:", entity);

        oldBlock.removeEntity(entity);
        entity.x = x;
        entity.y = y;
        newBlock.addEntity(layer, entity);
    }
}

