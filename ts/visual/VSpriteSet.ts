import { VDirectionArrow } from "./VDirectionArrow";

export class VSpriteSet {
    private _spritesetMap: Spriteset_Map;
    private _directionArrow: VDirectionArrow;

    constructor(spritesetMap: Spriteset_Map) {
        this._spritesetMap = spritesetMap;
        this._directionArrow = new VDirectionArrow();
        this._spritesetMap.addChild(this._directionArrow);
    }

    public destroy(): void {
        
    }

    public directionArrow(): VDirectionArrow {
        return this._directionArrow;
    }

}

