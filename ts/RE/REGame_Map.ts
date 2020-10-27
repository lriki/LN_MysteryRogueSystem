import { assert } from "../Common";
import { MapDataProvidor } from "./MapDataProvidor";
import { REGame_Block } from "./REGame_Block";
import { REGame_Entity } from "./REGame_Entity";
import { REFloorMapKind, REData } from "./REData";
import { REGame } from "./REGame";
import { REMapBuilder } from "./REMapBuilder";




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

    private _borderWall: REGame_Block = new REGame_Block(this, -1, -1);   // マップ有効範囲外に存在するダミー要素

    /** Entity が Map に入った時に呼び出される。 */
    public signalEntityEntered: ((entity: REGame_Entity) => void) | undefined;

    /** Entity が Map から離れた時に呼び出される。 */
    public signalEntityLeaved: ((entity: REGame_Entity) => void) | undefined;

    constructor() {
    }

    setup(floorId: number) {
        this._floorId = floorId;
        const builder = new REMapBuilder(this);
        REGame.integration.onLoadFixedMap(builder);
    }

    setupEmptyMap(width: number, height: number) {
        this._width = width;
        this._height = height;

        const count = this._width * this._height;
        this._blocks = new Array<REGame_Block>(count);
        for (let i = 0; i < count; i++) {
            this._blocks[i] = new REGame_Block(this, i % this._width, i / this._width);
        }
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
        assert(entity.floorId != this.floorId());
        this._entityIds.push(entity._id);
        entity.floorId = this.floorId();

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

    // TODO: Fuzzy とかで、x, y に配置できなければ周辺を探すとか
    _locateEntityFuzzy(entity: REGame_Entity, x: number, y: number): void {
        assert(entity.floorId == this.floorId());
        entity.x = x;
        entity.y = y;
    }
}

