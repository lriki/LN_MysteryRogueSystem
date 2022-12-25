import { FBlockComponent } from "ts/mr/floorgen/FMapData";
import { MRLively } from "ts/mr/lively/MRLively";
import { Helpers } from "ts/mr/system/Helpers";
import { MRView } from "./MRView";

const StartETileId = 768;

export class VMapGuideGrid {
    private _mapData: number[] = [];
    private _mapWidth: number = 0;
    private _mapHeight: number = 0;
    private _visible: boolean = false;
    private _mapdataRevision: number = 0;
    private _entityDir: number = 0;

    public setVisible(v: boolean): void {
        this._visible = v;
        MRView.spriteset?._tilemap.refresh();
    }

    public isVisible(): boolean {
        return this._visible;
    }

    public update(): void {
        let refresh = false;

        const entity = MRLively.mapView.focusedEntity();
        if (this._mapdataRevision != MRLively.mapView.currentMap.mapdataRevision()) {
            this._mapdataRevision = MRLively.mapView.currentMap.mapdataRevision();
            refresh = true;
        }

        if (entity && this._entityDir != entity.dir) {
            this._entityDir = entity.dir;
            refresh = true;
        }

        if (refresh) {
            this.refresh();
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

        const map = MRLively.mapView.currentMap;
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

        const entity = MRLively.mapView.focusedEntity();
        if (entity) {
            for (let i = 0; i < 100; i++) {
                const offset = Helpers._dirToTileOffsetTable[entity.dir];
                const x = entity.mx + offset.x * i;
                const y = entity.my + offset.y * i;
                const block = map.tryGetBlock(x, y);
                if (block && block._blockComponent != FBlockComponent.None) {
                    this.setMapData(x, y, StartETileId + 2);
                }
                else {
                    break;
                }
            }
        }
        
        MRView.spriteset?._tilemap.refresh();
    }
}
