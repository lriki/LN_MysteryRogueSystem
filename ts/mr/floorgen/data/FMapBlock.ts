import { DItemShopTypeId } from "ts/mr/data/DItemShop";
import { DMonsterHouseTypeId } from "ts/mr/data/DMonsterHouse";
import { DBlockVisualPartIndex } from "ts/mr/data/DTemplateMap";
import { LTileShape } from "ts/mr/objects/LBlock";
import { FBlockComponent, FRoomId, FSectorId } from "../FMapData";


export class FMapBlock {
    private _mx;
    private _my;
    private _tileShape: LTileShape;
    private _blockComponent: FBlockComponent;
    private _sectorId: FSectorId;
    private _roomId: FRoomId;
    private _doorway: boolean;  // 部屋の入口
    private _continuation: boolean; // ゴールとなる階段から地続きであるか
    private _shapeVisualPartIndex: DBlockVisualPartIndex;
    private _decorationVisualPartIndex: DBlockVisualPartIndex;
    private _fixedMapMonsterHouseTypeId: DMonsterHouseTypeId;   // リージョンを使って MH をマークするために用意したもの。MH である Block をひとつでも含む Room は MH となる。
    private _fixedMapItemShopTypeId: DItemShopTypeId;

    public constructor(mx: number, my: number) {
        this._mx = mx;
        this._my = my;
        this._tileShape = LTileShape.Wall;
        this._blockComponent = FBlockComponent.None;
        this._sectorId = 0;
        this._roomId = 0;
        this._doorway = false;
        this._continuation = false;
        this._shapeVisualPartIndex = 0;
        this._decorationVisualPartIndex = 0;
        this._fixedMapMonsterHouseTypeId = 0;
        this._fixedMapItemShopTypeId = 0;
    }

    public get mx(): number {
        return this._mx;
    }

    public get my(): number {
        return this._my;
    }

    public setTileShape(value: LTileShape): void {
        this._tileShape = value;
    }

    public tileShape(): LTileShape {
        return this._tileShape;
    }

    public setComponent(value: FBlockComponent): void {
        this._blockComponent = value;
    }

    public component(): FBlockComponent {
        return this._blockComponent;
    }

    public setFixedMapMonsterHouseTypeId(value: DMonsterHouseTypeId): void {
        this._fixedMapMonsterHouseTypeId = value;
    }

    public fixedMapMonsterHouseTypeId(): DMonsterHouseTypeId {
        return this._fixedMapMonsterHouseTypeId;
    }

    public setFixedMapItemShopTypeId(value: DItemShopTypeId): void {
        this._fixedMapItemShopTypeId = value;
    }

    public fixedMapItemShopTypeId(): DItemShopTypeId {
        return this._fixedMapItemShopTypeId;
    }
    
    public setSectorId(value: FSectorId): void {
        this._sectorId = value;
    }

    public sectorId(): FSectorId {
        return this._sectorId;
    }

    public setRoomId(value: FRoomId): void {
        this._roomId = value;
    }

    // TODO: 水路かつ部屋、水路かつ通路、みたいなこともあるので分ける必要がある
    public isRoom(): boolean {
        return this._blockComponent == FBlockComponent.Room;
    }
    
    /**
     * 本質的なものとして通行可能であるか。
     * 例えば隠し通路 (通常攻撃で通路が姿を現す) の場合、tileKind は Wall であるが、Component は Passageway となる。
     */
    public isPassagableComponent(): boolean {
        return this._blockComponent == FBlockComponent.Room || this._blockComponent == FBlockComponent.Passageway;
    }

    public roomId(): FRoomId {
        return this._roomId;
    }

    public setDoorway(value: boolean) {
        this._doorway = value;
    }

    public isDoorway(): boolean {
        return this._doorway;
    }

    public setContinuation(value: boolean) {
        this._continuation = value;
    }

    public isContinuation(): boolean {
        return this._continuation;
    }

    public get shapeVisualPartIndex(): DBlockVisualPartIndex {
        return this._shapeVisualPartIndex;
    }

    public setShapeVisualPartIndex(value: DBlockVisualPartIndex) {
        this._shapeVisualPartIndex = value;
    }    

    public get decorationVisualPartIndex(): DBlockVisualPartIndex {
        return this._decorationVisualPartIndex;
    }

    public setDecorationVisualPartIndex(value: DBlockVisualPartIndex) {
        this._decorationVisualPartIndex = value;
    }    
}
