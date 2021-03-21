import { assert } from "../Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { BlockLayerKind, LRoomId, REGame_Block, TileKind } from "./REGame_Block";
import { LEntity } from "./LEntity";
import { REFloorMapKind, REData } from "../data/REData";
import { REGame } from "./REGame";
import { REEntityFactory } from "../system/REEntityFactory";
import { Helpers } from "ts/system/Helpers";
import { RESequelSet } from "./REGame_Sequel";
import { RESystem } from "ts/system/RESystem";
import { Vector2 } from "ts/math/Vector2";
import { DLand } from "ts/data/DLand";
import { eqaulsEntityId, LEntityId } from "./LObject";
import { FMap } from "ts/floorgen/FMapData";
import { FMapBuilder } from "ts/floorgen/FMapBuilder";
import { DBasics } from "ts/data/DBasics";
import { RoomEventArgs } from "ts/data/predefineds/DBasicEvents";
import { LRoom, MonsterHouseState } from "./LRoom";
import { LUnitAttribute } from "./attributes/LUnitAttribute";
import { EmitFlags } from "typescript";
import { LStructure } from "./structures/LStructure";
import { FMonsterHouseStructure } from "ts/floorgen/FStructure";
import { LMonsterHouseStructure } from "./structures/LMonsterHouseStructure";
import { RECommandContext } from "ts/system/RECommandContext";




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
    private _rooms: LRoom[] = [];
    private _structures: LStructure[] = [];


    constructor() {
    }

    setup(floorId: number) {
        assert(this._entityIds.length == 0);
        this._floorId = floorId;
        this.build();
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
            this._blocks[i] = new REGame_Block(x, y);

            // TileEntity 追加
            //const tile = REEntityFactory.newTile(TileKind.Floor);
            //tile.floorId = this._floorId;
            //tile.x = x;
            //tile.y = y;
            //this._addEntityInternal(tile);
            //this._blocks[i].addEntity(BlockLayerKind.Terrain, tile);
            this._blocks[i]._tileKind = TileKind.Floor;
        }
    }

    private build(): void {
        const data = new FMap(this._floorId);
        REGame.integration.onLoadFixedMapData(data);
        const builder = new FMapBuilder();
        builder.build(data, this);

        {
            const width = data.width();
            const height = data.height();
            this.setupEmptyMap(width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dataBlock = data.block(x, y);
                    const mapBlock = this.block(x, y);

                    const kind = dataBlock.tileKind();
                    
                    //const tile = mapBlock.tile();
                    //const attr = tile.findAttribute(RETileAttribute);
                    //assert(attr);
                    //attr.setTileKind(kind);
                    mapBlock._tileKind = kind;

                    mapBlock._roomId = dataBlock.roomId();
                    mapBlock._blockComponent = dataBlock.component();
                }
            }

            // Create Rooms
            this._rooms = data.rooms().map(x => {
                const r = new LRoom();
                r.setup(x);
                return r;
            });

            // Create Structures
            this._structures = data.structures().map(x => {
                if (x instanceof FMonsterHouseStructure) {
                    const s = new LMonsterHouseStructure();
                    s.setup(x);
                    return s;
                }
                else {
                    throw new Error("Invalid Structure type.");
                }
            });
        }

        REGame.integration.onLoadFixedMapEvents();
    }

    releaseMap() {
        this._removeAllEntities();
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    isValid(): boolean {
        //console.log("isValid?", this._floorId, this._width);
        return this._floorId > 0 && this._width > 0;
    }

    floorId(): number {
        return this._floorId;
    }

    public rooms(): LRoom[] {
        return this._rooms;
    }

    public room(roomId: LRoomId): LRoom {
        return this._rooms[roomId];
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
            return REGame.borderWall;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }

    public tryGetBlock(x: number, y: number): REGame_Block | undefined {
        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {
            return undefined;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }

    public isValidPosition(x: number, y: number): boolean {
        return (0 <=  x|| x < this._width || 0 <= y || y < this._height);
        //return (x < 0 || this._width <= x || y < 0 || this._height <= y);
    }

    public roomId(x: number, y: number): LRoomId;
    public roomId(entity: LEntity, _?: any): LRoomId;
    public roomId(a1: any, a2: any): LRoomId {
        if (a1 instanceof LEntity) {
            return this.roomId(a1.x, a1.y);
        }
        else {
            return this.block(a1, a2)._roomId;
        }
    }

    public entities(): LEntity[] {
        return this._entityIds
            .map(id => { return REGame.world.entity(id); })
            .filter((e): e is LEntity => { return e != undefined; });
    }

    public entitiesInRoom(roomId: LRoomId): LEntity[] {
        return this.entities().filter(entity => this.roomId(entity) == roomId);
    }

    _addEntityInternal(entity: LEntity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId == this.floorId());
        assert(entity.id().index > 0);
        assert(!entity.hasOwner());

        this._entityIds.push(entity.id());
        entity.setOwnerMap(this);

        REGame.integration.onEntityEnteredMap(entity);
    }

    /**
     * Entity を現在の Floor の指定座標に登場させる。
     * @param entity 
     * @param x 
     * @param y 
     * 既に現在の Floor 上に登場済みの Entity に対してこのメソッドを呼び出すと失敗する。
     */
    appearEntity(entity: LEntity, x: number, y: number, layer?: BlockLayerKind): void {
        assert(entity.floorId == 0);
        entity.floorId= this.floorId();
        this.locateEntity(entity, x, y, layer);
        this._addEntityInternal(entity);
    }

    // appearEntity の、マップ遷移時用
    _reappearEntity(entity: LEntity): void {
        assert(entity.floorId == this.floorId());
        //assert(!entity.isTile());   // Tile は setup で追加済みのため、間違って追加されないようにチェック
        
        const block = this.block(entity.x, entity.y);
        const layer = entity.queryProperty(RESystem.properties.homeLayer);
        block.addEntity(layer, entity);

        this._addEntityInternal(entity);
    }

    _removeEntity(entity: LEntity): void {
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

    private _removeEntityHelper(entity: LEntity) {
        assert(entity.ownerIsMap());
        entity.clearOwner();

        assert(entity.floorId == this.floorId());
        entity.floorId = 0;

        const block = this.block(entity.x, entity.y);
        const result = block.removeEntity(entity);
        assert(result);
        
        REGame.integration.onEntityLeavedMap(entity);
    }





    canEntering(block: REGame_Block, layer: BlockLayerKind): boolean {
        // TODO: 壁抜けや浮遊状態で変わる
        return !block.layers()[layer].isOccupied() && block.tileKind() == TileKind.Floor;
    }
    
    canLeaving(block: REGame_Block, entity: LEntity): boolean {

        // TODO: 壁抜けや浮遊状態で変わる
        return /*!block->isOccupied() &&*/ block.tileKind() == TileKind.Floor;
    }
    
    // NOTE: 斜め移動の禁止は、隣接タイルや Entity が、自分の角を斜め移動可能とするか、で検知したほうがいいかも。
    // シレン5石像の洞窟の石像は、Entity扱いだが斜め移動禁止。
    // ちなみに、丸太の罠等では斜めすり抜けできる。
    checkPassage(entity: LEntity, dir: number, toLayer?: BlockLayerKind): boolean {
        const offset = Helpers.dirToTileOffset(dir);
        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(entity.x + offset.x, entity.y + offset.y);
        const layer = (toLayer) ? toLayer : entity.queryProperty(RESystem.properties.homeLayer);

        if (this.canLeaving(oldBlock, entity) && this.canEntering(newBlock, layer)) {
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
    // deprecated
    moveEntity(entity: LEntity, x: number, y: number, toLayer: BlockLayerKind): boolean {
        assert(entity.floorId == this.floorId());

        if (!this.isValidPosition(x, y)) {
            return false;   // マップ外への移動
        }
        
        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(x, y);

        if (this.canLeaving(oldBlock, entity) && this.canEntering(newBlock, toLayer)) {
            oldBlock.removeEntity(entity);
            entity.x = x;
            entity.y = y;
            newBlock.addEntity(toLayer, entity);
            this._postLocate(entity, oldBlock, newBlock);
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
    locateEntity(entity: LEntity, x: number, y: number, toLayer?: BlockLayerKind): void {
        assert(entity.floorId == this.floorId());

        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(x, y);
        
        const layer = (toLayer) ? toLayer : entity.queryProperty(RESystem.properties.homeLayer);

        oldBlock.removeEntity(entity);
        entity.x = x;
        entity.y = y;
        newBlock.addEntity(layer, entity);
        this._postLocate(entity, oldBlock, newBlock);
    }

    private _postLocate(entity: LEntity, oldBlock: REGame_Block, newBlock: REGame_Block) {
        if (oldBlock._roomId != newBlock._roomId) {
            const args: RoomEventArgs = {
                entity: entity,
                newRoomId: newBlock._roomId,
                oldRoomId: oldBlock._roomId,
            };

            REGame.eventServer.send(DBasics.events.roomEnterd, args);
            REGame.eventServer.send(DBasics.events.roomLeaved, args);
        }
    }

    public updateLocatedResults(context: RECommandContext): void {
        for (const entity of this.entities()) {
            if (entity._located) {

                for (const s of this._structures) {
                    s.onEntityLocated(context, entity);
                }

                entity._located = false;
            }
        }
    }
}

