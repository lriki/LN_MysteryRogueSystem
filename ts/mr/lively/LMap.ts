import { assert, MRSerializable } from "../Common";
import { LBlock, LTileShape } from "./LBlock";
import { LEntity } from "./LEntity";
import { MRLively } from "./MRLively";
import { Helpers } from "ts/mr/system/Helpers";
import { MRSystem } from "ts/mr/system/MRSystem";
import { Vector2 } from "ts/mr/math/Vector2";
import { DFloorInfo } from "ts/mr/data/DLand";
import { LEntityId, LObject, LObjectType } from "./LObject";
import { LRoom } from "./LRoom";
import { LStructure } from "./structures/LStructure";
import { FItemShopStructure, FMonsterHouseStructure } from "ts/mr/floorgen/FStructure";
import { LMonsterHouseStructure } from "./structures/LMonsterHouseStructure";
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { LFloorId } from "./LFloorId";
import { LLand } from "./LLand";
import { UMovement } from "ts/mr/utility/UMovement";
import { FMap } from "ts/mr/floorgen/FMapData";
import { LItemShopStructure } from "./structures/LItemShopStructure";
import { DBlockLayerKind } from "../data/DCommon";
import { UBlock } from "../utility/UBlock";
import { LRoomId } from "./LCommon";
import { USearch } from "../utility/USearch";
import { DUniqueSpawner } from "../data/DSpawner";
import { DEntityId } from "../data/DEntity";

export enum MovingMethod {
    Walk,
    Projectile,
    Penetration,
}

/**
 * マップオブジェクト。
 * 
 * RMMZ のマップに対応するものでは無く、 Floor に対応するものである点に注意。
 * ID は RMMZ のマップ ID ではなく、 FloorId である。
 * 
 * インスタンスは NewGame 時には存在しない。
 * 始めてそのマップへ遷移したときに生成され、以後は World に管理される Object としえ永久的に存在する。
 * これは Game_Actors と同じく、セーブデータの引継ぎに対応するための仕組みである。
 * 
 */
@MRSerializable
export class LMap extends LObject {
    private readonly _floorId: LFloorId = LFloorId.makeEmpty();
    private _width: number = 0;
    private _height: number = 0;
    private _blocks: LBlock[] = [];
    private _entityIds: LEntityId[] = [];      // マップ内に登場している Entity
    private _rooms: LRoom[] = [];
    private _structures: LStructure[] = [];
    private _mapdataRevision: number = 1;
    private _roundCount: number = 0;
    
    public uniqueSpawners: { [key: DEntityId]: DUniqueSpawner };

    // 巻物による気配察知・道具感知効果。
    // Trait とは別物。Trait は腕輪など装備品と共に使うが、こちらは巻物など一度効果を受けたらあとは永続するもの。
    unitClarity = false;
    itemClarity = false;
    trapClarity = false;  // マップ上の罠が見える: 敵味方問わず罠が見えるようになる。
    sightClarity = false;   // 視界明瞭？

    keeperCount: number = 0;
    lastKeeperCount: number = 0;
    
    constructor(floorId: LFloorId) {
        super(LObjectType.Map);
        this._floorId = floorId.clone();
        this.uniqueSpawners = {};
    }
    
    public isGCReady(): boolean {
        return false;   // 自動削除しない
    }

    setup(mapData: FMap) {
        this.uniqueSpawners = {};
        this.unitClarity = false;
        this.itemClarity = false;
        this.trapClarity = false;
        this.sightClarity = false;
        this.build(mapData);
    }

    public setupForRMMZDefaultMap():void {
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

    public get hasMapData(): boolean {
        return this._blocks.length > 0;
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
            this._blocks[i]._tileShape = LTileShape.Floor;
        }
    }

    private build(data: FMap): void {
        this._roundCount = 0;
        {
            const width = data.fullWidth;
            const height = data.fullHeight;
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
                    mapBlock._roomInnerEntrance = dataBlock.isDoorway();
                    mapBlock._shapeVisualPartIndex = dataBlock.shapeVisualPartIndex;
                    mapBlock._decorationVisualPartIndex = dataBlock.decorationVisualPartIndex;
                }
            }

            // Create Rooms
            this._rooms = data.rooms_raw().map(x => {
                const r = new LRoom();
                r.setup(x);
                return r;
            });

            // Create Structures
            this._structures = [new LStructure(0)]; // dummy
            for (const x of data.structures()) {
                if (x instanceof FMonsterHouseStructure) {
                    const s = new LMonsterHouseStructure(this._structures.length);
                    s.setup(x.roomId(), x.monsterHouseTypeId());
                    this._structures.push(s);
                }
                else if (x instanceof FItemShopStructure) {
                    const s = new LItemShopStructure(this._structures.length);
                    s.setup(x.roomId(), x.itemShopTypeId());
                    this._structures.push(s);
                }
                else {
                    throw new Error("Invalid Structure type.");
                }
            }
        }

    }

    releaseMap() {
        this._removeAllEntities();
        this._width = 0;
        this._height = 0;
        this._blocks = [];
    }

    isValid(): boolean {
        return this._floorId.hasAny && this._width > 0;
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

    public get isSingleRoomMap(): boolean {
        // [0] はダミー要素なので、 2 でチェック
        return this._rooms.length == 2;
    }

    public structures(): readonly LStructure[] {
        return this._structures;
    }

    public land2(): LLand {
        return MRLively.world.land(this._floorId.landId);
    }

    public floorData(): DFloorInfo {
        return this.land2().landData().floorInfos[this._floorId.floorNumber];
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
            return MRLively.borderWall;
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
        return this._blocks.filter(b => b.isRoom() && b.tileShape() == LTileShape.Floor);
    }

    /**
     * NPC や Enemy が出現可能な Block を取得する。
     * 
     * - 既に Unit が存在している Block は対象外。
     * - 地続きではない Block も取得する。(堀内部や埋蔵金部屋)
     */
    public getSpawnableBlocks(layer: DBlockLayerKind): LBlock[] {
        return this.roomFloorBlocks().filter(b => !b.layer(layer).isContainsAnyEntity());
    }

    public isValidPosition(x: number, y: number): boolean {
        return 0 <= x && x < this._width && 0 <= y && y < this._height;
        //return (0 <=  x|| x < this._width || 0 <= y || y < this._height);
        //return (x < 0 || this._width <= x || y < 0 || this._height <= y);
    }

    public roomId(x: number, y: number): LRoomId;
    public roomId(entity: LEntity, _?: any): LRoomId;
    public roomId(a1: any, a2: any): LRoomId {
        if (a1 instanceof LEntity) {
            return this.roomId(a1.mx, a1.my);
        }
        else {
            return this.block(a1, a2)._roomId;
        }
    }

    public entities(): LEntity[] {
        return this._entityIds
            .map(id => { return MRLively.world.entity(id); })
            .filter((e): e is LEntity => { return e != undefined; });
    }

    public iterateEntities(func: ((b: LEntity) => void) | ((b: LEntity) => boolean), fromTraits: boolean = false): boolean {
        for (const id of this._entityIds) {
            const entity = MRLively.world.entity(id);
            if (func(entity) === false) return false;
        }
        return true;
    }

    /** entity の視界内の Entity を取得する */
    public getInsightEntities(subject: LEntity): LEntity[] {
        return this.entities().filter(x => USearch.checkInSightEntity(subject, x));
    }

    // withOuter: 部屋の外周1マスも含むかどうか
    // public entitiesInRoom(roomId: LRoomId, withOuter: boolean): LEntity[] {
    //     if (withOuter) {
    //         const room = this.room(roomId);
    //         const outers: LBlock[] = [];
    //         room.forEachEdgeBlocks(b => outers.push(b));
    //         return this.entities().filter(entity => this.roomId(entity) == roomId || (outers.find(b => b.mx == entity.mx && b.my == entity.my) != undefined));
    //     }
    //     else {
    //         return this.entities().filter(entity => this.roomId(entity) == roomId);
    //     }
    // }

    _addEntityInternal(entity: LEntity): void {
        // 新規で追加するほか、マップロード時に、そのマップに存在することになっている Entity の追加でも使うので、
        // floorId は外部で設定済みであることを前提とする。
        assert(entity.floorId.equals(this.floorId()));
        assert(entity.entityId().hasAny());
        assert(!entity.hasParent());

        this._entityIds.push(entity.entityId());
        entity.setParent(this);

        entity.iterateBehaviorsReverse(b => {
            b.onEnteredMap(entity, this);
            return true;
        });

        MRLively.mapView.onEntityEnteredFromMap(entity);
    }

    /**
     * Entity を現在の Floor の指定座標に登場させる。
     * @param entity 
     * @param x 
     * @param y 
     * 既に現在の Floor 上に登場済みの Entity に対してこのメソッドを呼び出すと失敗する。
     */
    appearEntity(entity: LEntity, x: number, y: number, layer?: DBlockLayerKind): void {
        assert(entity.floorId.isEmpty);
        entity.floorId = this.floorId();
        this.locateEntity(entity, x, y, layer);
        this._addEntityInternal(entity);
    }

    // appearEntity の、マップ遷移時用
    // _reappearEntity(entity: LEntity): void {
    //     assert(entity.floorId.equals(this.floorId()));

    //     if (entity.isOnOffstage()) {
    //         // ランダムマップ遷移時、Player などの UniqueEntity はこの状態になる
    //         this._addEntityInternal(entity);
    //     }
    //     else {
    //         const block = this.block(entity.mx, entity.my);
    //         const layer = entity.getHomeLayer();
    //         block.addEntity(layer, entity);
    //         UMovement._postLocate(entity, undefined, block, this, undefined);
    //         this._addEntityInternal(entity);
    //     }
    // }

    _removeEntity(entity: LEntity): void {
        this._entityIds = this._entityIds.filter(x => !x.equals(entity.entityId()));
        this._removeEntityHelper(entity);
    }

    _removeAllEntities(): void {
        this._entityIds.forEach(x => {
            const entity = MRLively.world.entity(x);
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
        
        if (entity.floorId.isTacticsMap2) {
            const block = this.block(entity.mx, entity.my);
            block.removeEntity(entity);
            // MapData 未ロード時には、block には Entity が含まれていないこともあるため、
            // 本当に削除できたかのチェックは不要。
        }
        else {
            // RESystem 外のマップでは block を作っていないこともある
        }
        
        entity.floorId = LFloorId.makeEmpty();
        entity.clearParent();
        MRLively.mapView.onEntityRemovedFromMap(entity);
    }

    onRemoveChild(obj: LObject): void {
        if (obj instanceof LEntity) {
            this._removeEntity(obj);
        }
    }

    /**
     * Entity の位置設定
     * 
     * entity は map に追加済みであること。
     * 
     * - moveEntity() と異なり、移動可能判定を行わずに強制移動する。
     * - マップ生成時の Entity 配置や、ワープ移動などで使用する。
     * - Visual に対して位置合わせを通知するため、歩行などアニメーションを伴う移動での使用は禁止。
     * - 侵入判定を伴う。
     */
     public locateEntity(entity: LEntity, x: number, y: number, toLayer?: DBlockLayerKind): void {
        //const map = MRLively.mapView.currentMap;
        assert(entity.floorId.equals(this.floorId()));

        const oldBlock = this.block(entity.mx, entity.my);
        const newBlock = this.block(x, y);
        assert(newBlock);
        
        const layer = (toLayer) ? toLayer : entity.getHomeLayer();

        oldBlock.removeEntity(entity);
        entity.mx = x;
        entity.my = y;
        newBlock.addEntity(layer, entity);
        newBlock.setFootpoint(entity);
        UMovement._postLocate(entity, oldBlock, newBlock, this, undefined);

        // Located 通知。これはアニメを伴う移動時は通知したくないのでここで行う。
        MRSystem.integration.onEntityLocated(entity);
    }

    /**
     * 指定した Block へ Entity が侵入できるか。
     */
    public canMoveEntering(block: LBlock, entity: LEntity, method: MovingMethod, layer: DBlockLayerKind): boolean {
        if (method == MovingMethod.Walk) {
            if (UBlock.checkPurifier(block, entity)) return false;  // 聖域の巻物とかがある
        }

        switch (method) {
            case MovingMethod.Walk:
                return !block.layers()[layer].isOccupied() && block.tileShape() == LTileShape.Floor;
            case MovingMethod.Projectile:
                return !block.layers()[layer].isOccupied() && !block.isWallLikeShape();
            case MovingMethod.Penetration:
                return !block.layers()[layer].isOccupied();
            default:
                throw new Error("Not implemented.");
        }
    }
    
    canLeaving(block: LBlock, entity: LEntity): boolean {

        // TODO: 壁抜けや浮遊状態で変わる
        return /*!block->isOccupied() &&*/ block.tileShape() == LTileShape.Floor;
    }
    
    // NOTE: 斜め移動の禁止は、隣接タイルや Entity が、自分の角を斜め移動可能とするか、で検知したほうがいいかも。
    // シレン5石像の洞窟の石像は、Entity扱いだが斜め移動禁止。
    // ちなみに、丸太の罠等では斜めすり抜けできる。
    // deprecated: use SMomementCommon
    checkPassage(entity: LEntity, dir: number, method: MovingMethod, toLayer?: DBlockLayerKind): boolean {
        const offset = Helpers.dirToTileOffset(dir);
        const oldBlock = this.block(entity.mx, entity.my);
        const newBlock = this.block(entity.mx + offset.x, entity.my + offset.y);
        const layer = (toLayer) ? toLayer : entity.getHomeLayer();

        if (this.canLeaving(oldBlock, entity) && this.canMoveEntering(newBlock, entity, method, layer)) {
            return true;
        }
        else {
            return false;
        }
    }

    /** 指定した Entity が、このマップ上に出現しているかを確認する。 */
    public checkAppearing(entity: LEntity): boolean {
        return this._floorId.equals(entity.floorId) && !entity.isOnOffstage();
    }


    public updateLocatedResults(cctx: SCommandContext): void {
        for (const entity of this.entities()) {
            if (entity._located) {

                for (const s of this._structures) {
                    s.onEntityLocated(cctx, entity);
                }

                entity._located = false;
            }
        }
    }

    // Map 内に存在するが Block に含まれていない Entity を Block に追加する。
    // これは MapData が無いときに追加された Entity の状態を正常な状態にするために行う。
    public refreshLocateToBlockAllEntites(): void {
        for (const entity of this.entities()) {
            const block = this.block(entity.mx, entity.my);
            assert(block);
            if (!block.containsEntity(entity)) {
                const layer = entity.getHomeLayer();
                block.setFootpoint(entity);
                block.addEntity(layer, entity);
                
                if (!entity.isOnOffstage()) {
                    UMovement._postLocate(entity, undefined, block, this, undefined);
                }
            }
        }
    }

    public needsRebuild(): boolean {
        const info = this._floorId.floorInfo;
        if (info.unique) {
            if (this._blocks.length == 0) {
                return true;
            }
            else {
                return false;
            }
        }
        return true;
    }

    public shouldUnloadAtMapTransferred(): boolean {
        return !this._floorId.floorInfo.unique;
    }

    public updateFootpoints(): void {
        for (const block of this._blocks) {
            block.updateFootpoints();
        }
    }

    //----------
    // Helpers

    /** 足元の Entity を取得する */
    public firstFeetEntity(entity: LEntity): LEntity | undefined {
        const block = this.block(entity.mx, entity.my);
        const layer = block.layer(DBlockLayerKind.Ground);
        return layer.firstEntity();
    }
}

