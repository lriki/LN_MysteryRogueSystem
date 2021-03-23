import { FBlockComponent } from "ts/floorgen/FMapData";
import { REGame } from "ts/objects/REGame";
import { REGame_Map } from "ts/objects/REGame_Map";
import { Helpers } from "ts/system/Helpers";
import { REVisual } from "./REVisual";

const StartETileId = 768;

export class VMapGuideGrid {
    private _mapData: number[] = [];
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _visible: boolean = false;
    private _mapdataRevision: number = 0;

    public setVisible(v: boolean): void {
        this._visible = v;
        REVisual.spriteset?._tilemap.refresh();
    }

    public isVisible(): boolean {
        return this._visible;
    }

    public update(): void {
        if (this._mapdataRevision != REGame.map.mapdataRevision()) {
            this.refresh();
            this._mapdataRevision = REGame.map.mapdataRevision();
        }
    }

    public readMapData(x: number, y: number): number {
        return this._mapData[(y * this._mapWidth) + x];
    }

    private setMapData(x: number, y: number, value: number): void {
        this._mapData[(y * this._mapWidth) + x] = value;
    }
    
    private refresh(): void {
        this._mapWidth = $gameMap.width();
        this._mapHeight = $gameMap.height();
        const len = this._mapWidth * this._mapHeight;
        if (!this._mapData || this._mapData.length < len) {
            this._mapData = new Array<number>(len);
        }

        const map = REGame.map;
        for (let y = 0; y < this._mapHeight; y++) {
            for (let x = 0; x < this._mapWidth; x++) {
                const block = map.block(x, y);
                

                //if ($gameMap.checkPassage(x, y, 0xF)) {
                if (block._blockComponent != FBlockComponent.None) {
                    this.setMapData(x, y, StartETileId + 1);
                }
                else {
                    this.setMapData(x, y, 0);
                }
            }
        }

        const entity = REGame.camera.focusedEntity();
        if (entity) {
            for (let i = 0; i < 100; i++) {
                const offset = Helpers._dirToTileOffsetTable[entity.dir];
                const x = entity.x + offset.x * i;
                const y = entity.y + offset.y * i;
                const block = map.tryGetBlock(x, y);
                if (block && block._blockComponent != FBlockComponent.None) {
                    this.setMapData(x, y, StartETileId + 2);
                }
                else {
                    break;
                }
            }
        }
        
        REVisual.spriteset?._tilemap.refresh();
    }
}
