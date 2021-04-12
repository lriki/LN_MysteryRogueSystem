import { RESystem } from "ts/system/RESystem";
import { VDirectionArrow } from "./VDirectionArrow";
import { VVisibilityShadow } from "./VVisibilityShadow";

export class VSpriteSet {
    private _spritesetMap: Spriteset_Map;
    private _visibilityShadow: VVisibilityShadow;
    private _minimapTilemap: Tilemap;
    private _directionArrow: VDirectionArrow;
    private _initialUpdate: boolean;

    constructor(spritesetMap: Spriteset_Map) {
        this._spritesetMap = spritesetMap;
        this._visibilityShadow = new VVisibilityShadow(spritesetMap);
        this._directionArrow = new VDirectionArrow();
        this._spritesetMap.addChild(this._directionArrow);
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
        this._minimapTilemap._tileWidth = 12;//$gameMap.tileWidth();
        this._minimapTilemap._tileHeight = 12;//$gameMap.tileHeight();
        //this._minimapTilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
        this._minimapTilemap.setData(width, height, minimapData);
        this._minimapTilemap.horizontalWrap = $gameMap.isLoopHorizontal();
        this._minimapTilemap.verticalWrap = $gameMap.isLoopVertical();
        this._spritesetMap._baseSprite.addChild(this._minimapTilemap);

        this._minimapTilemap.setRendererId(2);
        
        const bitmaps = [];
        const tilesetNames = ["World_A1","RE-Minimap_A2","","","RE-Minimap_A5","World_B","World_C","",""];
        for (const name of tilesetNames) {
            bitmaps.push(ImageManager.loadTileset(name));
        }
        this._minimapTilemap.setBitmaps(bitmaps);
    }

    public destroy(): void {
        
    }

    public directionArrow(): VDirectionArrow {
        return this._directionArrow;
    }

    public update(): void {
        
        const minimap = RESystem.minimapData;
        if (minimap.isTilemapResetNeeded() || this._initialUpdate ) {
            this._minimapTilemap.setData(minimap.width(), minimap.height(), minimap.data());
            minimap.clearTilemapResetNeeded();
        }
        this._minimapTilemap.refresh();

        
        this._visibilityShadow._update();
        
        this._initialUpdate  = false;

    }
}

