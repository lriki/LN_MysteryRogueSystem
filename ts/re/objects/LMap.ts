import { assert } from "../Common";
import { LRoomId, LBlock, TileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { REGame } from "./REGame";
import { Helpers } from "ts/re/system/Helpers";
import { RESystem } from "ts/re/system/RESystem";
import { Vector2 } from "ts/re/math/Vector2";
import { DFloorInfo } from "ts/re/data/DLand";
import { LEntityId, LObject, LObjectType } from "./LObject";
import { LRoom } from "./LRoom";
import { LStructure } from "./structures/LStructure";
import { FItemShopStructure, FMonsterHouseStructure } from "ts/re/floorgen/FStructure";
import { LMonsterHouseStructure } from "./structures/LMonsterHouseStructure";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LFloorId } from "./LFloorId";
import { LLand } from "./LLand";
import { UMovement } from "ts/re/usecases/UMovement";
import { FMap } from "ts/re/floorgen/FMapData";
import { BlockLayerKind } from "./LBlockLayer";
import { LItemShopStructure } from "./structures/LItemShopStructure";

export enum MovingMethod {
    Walk,
    Projectile,
}

/*
    ### ランダムフロアへ移動したときのフロー
    - マップ移動イベントにより、RE-Land マップの (x,0) へ移動
    - FloorInfo を確認。ランダムマップであれば、FMap をランダム構築
    - FMap を使って LMap を setup
    - 

    ### 固定フロアへ移動したときのフロー
    - マップ移動イベントにより、固定マップの任意の座標へ移動
    - FloorInfo を確認。固定マップであれば、$dataMap から FMap を構築
    - FMap を使って LMap を setup

*/

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
export class LMap extends LObject
{
    private _floorId: LFloorId = LFloorId.makeEmpty();
    private _width: number = 0;
    private _height: number = 0;
    private _blocks: LBlock[] = [];
    private _entityIds: LEntityId[] = [];      // マップ内に登場している Entity
    private _rooms: LRoom[] = [];
    private _structures: LStructure[] = [];
    private _mapdataRevision: number = 1;
    private _roundCount: number = 0;

    constructor() {
        super(LObjectType.Map);
    }
    
    public isGCReady(): boolean {
        return false;   // 自動削除しない
    }

    setup(floorId: LFloorId, mapData: FMap) {
        assert(this._entityIds.length == 0);        // 外部で releaseMap してから setup すること
        this._floorId = floorId;
        this.build(mapData);
    }

    public setupForRMMZDefaultMap(floorId: LFloorId):void {
        assert(this._entityIds.length == 0);        // 外部で releaseMap してから setup すること
        this._floorId = floorId;
        this.setupEmptyMap(1, 1);
    }

    public mapdataRevision(): number {
        return this._mapdataRevision;
    }

    public increaseRevision(): void {
        this._mapdataRevision++;
    }

    public roundCount(): number {
        return this._roundCount;
    }

    public increaseRoundCount(): void {
        this._roundCount++;
    }

    private setupEmptyMap(width: number, height: number) {

        this._width = width;
        this._height = height

        const count = this._width * this._height;
        this._blocks = new Array<LBlock>(count);
        for (let i = 0; i < count; i++) {
            const x = Math.trunc(i % this._width);
            const y = Math.trunc(i / this._width);
            this._blocks[i] = new LBlock(x, y);
            this._blocks[i]._tileShape = TileShape.Floor;
        }
    }

    private build(data: FMap): void {
        this._roundCount = 0;
        {
            const width = data.width();
            const height = data.height();
            this.setupEmptyMap(width, height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const dataBlock = data.block(x, y);
                    const mapBlock = this.block(x, y);

                    const kind = dataBlock.tileShape();
                    
                    //const tile = mapBlock.tile();
                    //const attr = tile.findAttribute(RETileAttribute);
                    //assert(attr);
                    //attr.setTileKind(kind);
                    mapBlock._tileShape = kind;

                    mapBlock._roomId = dataBlock.roomId();
                    mapBlock._blockComponent = dataBlock.component();
                    mapBlock._continuation = dataBlock.isContinuation();
                    mapBlock._doorway = dataBlock.isDoorway();
                }
            }

            // Create Rooms
            this._rooms = data.rooms_raw().map(x => {
                const r = new LRoom();
                r.setup(x);
                return r;
            });

            // Create Structures
            this._structures = data.structures().map(x => {
                if (x instanceof FMonsterHouseStructure) {
                    const s = new LMonsterHouseStructure();
                    s.setup(x.roomId(), x.monsterHouseTypeId());
                    return s;
                }
                else if (x instanceof FItemShopStructure) {
                    const s = new LItemShopStructure();
                    s.setup(x.roomId(), x.itemShopTypeId());
                    return s;
                }
                else {
                    throw new Error("Invalid Structure type.");
                }
            });
        }

    }

    releaseMap() {
        this._removeAllEntities();
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    isValid(): boolean {
        return this._floorId.hasAny() && this._width > 0;
    }

    public floorId(): LFloorId {
        return this._floorId;
    }

    public rooms(): readonly LRoom[] {
        return this._rooms;
    }

    public room(roomId: LRoomId): LRoom {
        return this._rooms[roomId];
    }

    public structures(): readonly LStructure[] {
        return this._structures;
    }

    public land2(): LLand {
        return REGame.world.land(this._floorId.landId());
    }

    public floorData(): DFloorInfo {
        return this.land2().landData().floorInfos[this._floorId.floorNumber()];
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    /*
    isFixedMap(): boolean {
        return REData.maps[this._floorId]?.mapKind == REFloorMapKind.FixedMap;
    }

    isRandomMap(): boolean {
        return REData.maps[this._floorId]?.mapKind == REFloorMapKind.RandomMap;
    }
    */

    public blocks(): readonly LBlock[] {
        return this._blocks;
    }

    block(x: number, y: number) : LBlock;
    block(pos: Vector2, _?: any) : LBlock;
    block(a1: any, a2: any) : LBlock {
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

    public tryGetBlock(x: number, y: number): LBlock | undefined {
        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {
            return undefined;
        }
        else {
            return this._blocks[y * this._width + x];
        }
    }

    /**
     * 
     * distance=0 の時は足元。
     * distance=1 の時は外周1マス。
     */
    public getEdgeBlocks(x: number, y: number, distance: number): LBlock[] {
        assert(distance >= 0);
        const result: LBlock[] = [];

        if (distance == 0) {
            const block = this.tryGetBlock(x, y);
            if (block) result.push(block);
        }
        else {
            const x1 = x - distance;
            const y1 = y - distance;
            const x2 = x + distance;
            const y2 = y + distance;
            const count = distance * 2;
    
            /* ↓ここを始点に、時計回りに列挙していく。
             * uuuur
             * l   r
             * l   r
             * l   r
             * ldddd
             */
            for (let i = 0; i < count; i++) {
                const block = this.tryGetBlock(x1 + i, y1);
                if (block) result.push(block);
            }
            for (let i = 0; i < count; i++) {
                const block = this.tryGetBlock(x2, y1 + i);
                if (block) result.push(block);
            }
            for (let i = 0; i < count; i++) {
                const block = this.tryGetBlock(x2 - i, y2);
                if (block) result.push(block);
            }
            for (let i = 0; i < count; i++) {
                const block = this.tryGetBlock(x1, y2 - i);
                if (block) result.push(block);
            }
        }

        return result;
    }



    /** "部屋" 内の "床" である Block を取得する */
    public roomFloorBlocks(): LBlock[] {
        return this._blocks.filter(b => b.isRoom() && b.tileShape() == TileShape.Floor);
    }

    /**
     * NPC や Enemy が出現可能な Block を取得する。
     * 
     * - 既に Unit が存在している Block は対象外。
     * - 地続きではない Block も取得する。(堀内部や埋蔵金部屋)
     */
    public getSpawnableBlocks(layer: BlockLayerKind): LBlock[] {
        return this.roomFloorBlocks().filter(b => !b.layer(layer).isContainsAnyEntity());
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

    /** entity の視界内の Entity を取得する */
    public getInsightEntities(subject: LEntity): LEntity[] {
        if (subject.isOnRoom()) {
            return this.entitiesInRoom(subject.roomId(), true).filter(x => x != subject);
        }
        else {
            return this.entities().filter(entity => Helpers.isAdjacent(entity, subject) && entity != subject);
        }
    }

    // withOuter: 部屋の外周1マスも含むかどうか
    public entitiesInRoom(roomId: LRoomId, withOuter: boolean): LEntity[] {
        if (withOuter) {
            const room = this.room(roomId);
            const outers: LBlock[] = [];
            room.forEachEdgeBlocks(b => outers.push(b));
            return this.entities().filter(entity => this.roomId(entity) == roomId || (outers.find(b => b.x() == entity.x && b.y() == entity.y) != undefined));
        }
        else {
            return this.entities().filter(entity => this.roomId(entity) == roomId);
        }
    }

    _addEntityInternal(entity: LEntity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId.equals(this.floorId()));
        assert(entity.entityId().hasAny());
        assert(!entity.hasParent());

        this._entityIds.push(entity.entityId());
        entity.setParent(this);

        RESystem.integration.entityEnteredMap(entity);
    }

    /**
     * Entity を現在の Floor の指定座標に登場させる。
     * @param entity 
     * @param x 
     * @param y 
     * 既に現在の Floor 上に登場済みの Entity に対してこのメソッドを呼び出すと失敗する。
     */
    appearEntity(entity: LEntity, x: number, y: number, layer?: BlockLayerKind): void {
        assert(entity.floorId.isEmpty());
        entity.floorId = this.floorId();
        UMovement.locateEntity(entity, x, y, layer);
        this._addEntityInternal(entity);
    }

    // appearEntity の、マップ遷移時用
    _reappearEntity(entity: LEntity): void {
        assert(entity.floorId.equals(this.floorId()));
        //assert(!entity.isTile());   // Tile は setup で追加済みのため、間違って追加されないようにチェック
        
        const block = this.block(entity.x, entity.y);
        const layer = entity.getHomeLayer();
        block.addEntity(layer, entity);

        this._addEntityInternal(entity);
    }

    _removeEntity(entity: LEntity): void {
        this._entityIds = this._entityIds.filter(x => !x.equals(entity.entityId()));
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
        //assert(entity.ownerIsMap());
        //entity.clearOwner();

        assert(entity.floorId.equals(this.floorId()));
        
        if (entity.floorId.isRESystem()) {
            const block = this.block(entity.x, entity.y);
            const result = block.removeEntity(entity);
            assert(result);
        }
        else {
            // RESystem 外のマップでは block を作っていないこともある
        }
        
        entity.floorId = LFloorId.makeEmpty();
        entity.clearParent();
        RESystem.integration.entityLeavedMap(entity);
    }

    onRemoveChild(obj: LObject): void {
        if (obj instanceof LEntity) {
            this._removeEntity(obj);
        }
    }



    /**
     * 指定した Block へ Entity が、"歩行" で侵入できるか。
     */
    public canWalkEntering(block: LBlock, entity: LEntity, method: MovingMethod, layer: BlockLayerKind): boolean {
        if (method == MovingMethod.Walk) {
            if (block.checkPurifier(entity)) return false;  // 聖域の巻物とかがある
        }

        // TODO: 壁抜けや浮遊状態で変わる
        return !block.layers()[layer].isOccupied() && block.tileShape() == TileShape.Floor;
    }
    
    canLeaving(block: LBlock, entity: LEntity): boolean {

        // TODO: 壁抜けや浮遊状態で変わる
        return /*!block->isOccupied() &&*/ block.tileShape() == TileShape.Floor;
    }
    
    // NOTE: 斜め移動の禁止は、隣接タイルや Entity が、自分の角を斜め移動可能とするか、で検知したほうがいいかも。
    // シレン5石像の洞窟の石像は、Entity扱いだが斜め移動禁止。
    // ちなみに、丸太の罠等では斜めすり抜けできる。
    // deprecated: use SMomementCommon
    checkPassage(entity: LEntity, dir: number, method: MovingMethod, toLayer?: BlockLayerKind): boolean {
        const offset = Helpers.dirToTileOffset(dir);
        const oldBlock = this.block(entity.x, entity.y);
        const newBlock = this.block(entity.x + offset.x, entity.y + offset.y);
        const layer = (toLayer) ? toLayer : entity.getHomeLayer();

        if (this.canLeaving(oldBlock, entity) && this.canWalkEntering(newBlock, entity, method, layer)) {
            return true;
        }
        else {
            return false;
        }
    }

    /** 指定した Entity が、このマップ上に出現しているかを確認する。 */
    public checkAppearing(entity: LEntity): boolean {
        return this._floorId.equals(entity.floorId) && !entity.isEnteringToFloor();
    }


    public updateLocatedResults(context: SCommandContext): void {
        for (const entity of this.entities()) {
            if (entity._located) {

                for (const s of this._structures) {
                    s.onEntityLocated(context, entity);
                }

                entity._located = false;
            }
        }
    }

    //----------
    // Helpers

    /** 足元の Entity を取得する */
    public firstFeetEntity(entity: LEntity): LEntity | undefined {
        const block = REGame.map.block(entity.x, entity.y);
        const layer = block.layer(BlockLayerKind.Ground);
        return layer.firstEntity();
    }
}

