import { MRLively } from "ts/mr/lively/MRLively";
import { TilemapRendererId } from "ts/mr/rmmz/Tilemap";
import { MRSystem } from "ts/mr/system/MRSystem";
import { SMinimapData } from "ts/mr/system/SMinimapData";
import { SView } from "ts/mr/system/SView";

export class VMinimapWindow extends Window_Base {
    private _minimapTilemap: Tilemap;
    private _initialUpdate: boolean;

    constructor(rect: Rectangle) {
        super(rect);
        this.setBackgroundType(2);
        //this._isWindow = false;

        this._initialUpdate = true;

        const width = $dataMap.width ?? 1;
        const height = $dataMap.height ?? 1;
        const depth = 4;
        const minimapData = new Array(width * height * 4);
        const x = 0;
        const y = 0;
        const z = 0;
        minimapData[(z * height + y) * width + x] = Tilemap.TILE_ID_A5 + 1;
        minimapData[(z * height + y) * width + x+1] = Tilemap.TILE_ID_A5 + 1;
        
        this._minimapTilemap = new Tilemap();
        this._minimapTilemap.tileWidth = 12;//$gameMap.tileWidth();
        this._minimapTilemap.tileHeight = 12;//$gameMap.tileHeight();
        //this._minimapTilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
        this._minimapTilemap.setData(width, height, minimapData);
        this._minimapTilemap.horizontalWrap = $gameMap.isLoopHorizontal();
        this._minimapTilemap.verticalWrap = $gameMap.isLoopVertical();
        this._minimapTilemap.y = 0;
        this._minimapTilemap.scale.set(0.75, 0.75);
        //this._spritesetMap._baseSprite.addChild(this._minimapTilemap);

        
        //REVisual.scene._windowLayer.
        this.addChild(this._minimapTilemap);
        this._minimapTilemap.setRendererId(TilemapRendererId.Minimap);

        
        const bitmaps = [];
        const tilesetNames = ["World_A1","RE-Minimap_A2","","","RE-Minimap_A5","World_B","World_C","",""];
        for (const name of tilesetNames) {
            bitmaps.push(ImageManager.loadTileset(name));
        }
        this._minimapTilemap.setBitmaps(bitmaps);
    }

    private get minimapData(): SMinimapData {
        return MRSystem.minimapData;
    }

    override update(): void {
        super.update();
        
        if (MRLively.mapView.currentFloorId.isFieldMap) {
            this._minimapTilemap.visible = false;
        }
        else {
            this._minimapTilemap.visible = true;
            this.updateMinimap();
        }
        this._initialUpdate  = false;
    }

    private updateMinimap(): void {
        const minimap = this.minimapData;
        if (minimap.isTilemapResetNeeded() || this._initialUpdate ) {
            this._minimapTilemap.setData(minimap.width(), minimap.height(), minimap.data());
            minimap.clearTilemapResetNeeded();
        }
        this._minimapTilemap.refresh();

        this._minimapTilemap.selfVisible = SView.getTilemapView().visible;
    }
}

