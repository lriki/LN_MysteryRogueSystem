import { TilemapRendererId } from "ts/mr/rmmz/Tilemap";
import { MRSystem } from "ts/mr/system/MRSystem";
import { MRLively } from "../lively/MRLively";
import { SView } from "../system/SView";
import { VSymmetricFovShadow } from "./fov/VSymmetricFovShadow";
import { VDirectionArrow } from "./VDirectionArrow";
import { VHudWindow } from "./VHudWindow";
import { VVisibilityShadow } from "./VVisibilityShadow";

export class VSpriteSet {
    public readonly spritesetMap: Spriteset_Map;
    private _visibilityShadow: VVisibilityShadow;
    private _symmetricFovShadow: VSymmetricFovShadow;
    private _directionArrow: VDirectionArrow;

    constructor(spritesetMap: Spriteset_Map) {
        this.spritesetMap = spritesetMap;
        this._visibilityShadow = new VVisibilityShadow(spritesetMap);
        this._symmetricFovShadow = new VSymmetricFovShadow(this);
        this._directionArrow = new VDirectionArrow();
        this.spritesetMap.addChild(this._directionArrow);

        this.spritesetMap._tilemap.setRendererId(TilemapRendererId.Default);
            
        

        
    }

    public destroy(): void {
        
    }

    public directionArrow(): VDirectionArrow {
        return this._directionArrow;
    }

    public update(): void {

        
        this._visibilityShadow._update();
        this._symmetricFovShadow.updateShadowTiles();
        

        this.spritesetMap._tilemap.selfVisible = SView.getTilemapView().visible;

        //this._spritesetMap._tilemap.visible = SView.getTilemapView().visible;
        
        //this._spritesetMap._tilemap.setBitmaps([]);
    }
}

