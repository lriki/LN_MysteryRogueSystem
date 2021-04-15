import { REGame } from "ts/objects/REGame";
import { REVisual } from "./REVisual";

const VisibilityShadowTileSize = 48;

export class VVisibilityShadow {
    private _spritesetMap: Spriteset_Map;
    private _visibilityShadowBitmap: Bitmap;
    private _visibilityShadowInnerSprites: Sprite[];
    private _visibilityShadowOuterSprites: Sprite[];

    constructor(spritesetMap: Spriteset_Map) {
        this._spritesetMap = spritesetMap;
        
        this._visibilityShadowBitmap = ImageManager.loadSystem("RE-VisibilityShadow");
        //this._visibilityShadowBitmap = ImageManager.loadSystem("RE-VisibilityShadow-Grid");
        this._visibilityShadowInnerSprites = [];
        this._visibilityShadowInnerSprites[1] = this.createVisibilityShadowPart(16, 0.5, 0.5);
        this._visibilityShadowInnerSprites[2] = this.createVisibilityShadowPart(17, 0.5, 0.5);
        this._visibilityShadowInnerSprites[3] = this.createVisibilityShadowPart(18, 0.5, 0.5);
        this._visibilityShadowInnerSprites[4] = this.createVisibilityShadowPart(11, 0.5, 0.5);
        this._visibilityShadowInnerSprites[6] = this.createVisibilityShadowPart(13, 0.5, 0.5);
        this._visibilityShadowInnerSprites[7] = this.createVisibilityShadowPart(6, 0.5, 0.5);
        this._visibilityShadowInnerSprites[8] = this.createVisibilityShadowPart(7, 0.5, 0.5);
        this._visibilityShadowInnerSprites[9] = this.createVisibilityShadowPart(8, 0.5, 0.5);
        
        // Outer 内側に Anchor をつける
        this._visibilityShadowOuterSprites = [];
        this._visibilityShadowOuterSprites[2] = this.createVisibilityShadowPart(22, 0.5, 0.0);
        this._visibilityShadowOuterSprites[4] = this.createVisibilityShadowPart(10, 1.0, 0.5);
        this._visibilityShadowOuterSprites[6] = this.createVisibilityShadowPart(14, 0.0, 0.5);
        this._visibilityShadowOuterSprites[8] = this.createVisibilityShadowPart(2, 0.5, 1.0);
    }

    _update() {

        const focusedEntity = REGame.camera.focusedEntity();
        if (REVisual.entityVisualSet && focusedEntity) {
            const visual = REVisual.entityVisualSet.findEntityVisualByEntity(focusedEntity);
            if (visual) {
                const event = visual.rmmzEvent();
                const sprite = visual.rmmzSprite();
                if (sprite) {
                    // Tile の中央点
                    const htw = $gameMap.tileWidth() / 2;
    
                    // 部屋ではなくCharacterSpriteにフォーカスしている場合
                    let tx1 = (event.screenX() - htw);// - VisibilityShadowTileSize;  // タイル左辺
                    let tx2 = (event.screenX() - htw) + VisibilityShadowTileSize;  // タイル右辺
                    let ty1 = event.screenY() - VisibilityShadowTileSize;         // タイル上辺
                    let ty2 = event.screenY();         // タイル下辺
    
    
                    // test
                    tx1 -= VisibilityShadowTileSize / 2.0;
                    tx2 += VisibilityShadowTileSize / 2.0;
                    ty1 -= VisibilityShadowTileSize / 2.0;
                    ty2 += VisibilityShadowTileSize / 2.0;
    
                    const roomId = focusedEntity.roomId();
                    if (roomId > 0) {
                        const tw = $gameMap.tileWidth();
                        const room = REGame.map.rooms()[roomId];
                        tx1 = $gameMap.adjustX(room.x1()) * tw;
                        tx2 = $gameMap.adjustX(room.x2()) * tw + tw;
                        ty1 = $gameMap.adjustY(room.y1()) * tw;
                        ty2 = $gameMap.adjustY(room.y2()) * tw + tw;
                    }
    
    
    
    
                    const tw = tx2 - tx1;
                    const th = ty2 - ty1;
    
                    // InnerShadow の 9-Sprites の中心線を表す矩形
                    // Shadow の Sprite は anchor(0.5, 0.5) であるため調整する
                    const sx1 = tx1 - (VisibilityShadowTileSize / 2.0);
                    const sx2 = tx2 + (VisibilityShadowTileSize / 2.0);
                    const sy1 = ty1 - (VisibilityShadowTileSize / 2.0);
                    const sy2 = ty2 + (VisibilityShadowTileSize / 2.0);
    
    
    
    
                    const sw = sx2 - sx1;
                    const sy = sy2 - sy1;
    
                    // center
                    const cx = sx1 + sw / 2.0;
                    const cy = sy1 + sy / 2.0;
                    
    
                    const ox = 0;//-VisibilityShadowTileSize / 2;
                    //this._visibilityShadowInnerSprites[1].x = ox + characterSprite.x - VisibilityShadowTileSize;
                    //this._visibilityShadowInnerSprites[1].y = ox + characterSprite.y + VisibilityShadowTileSize;
                   //this._visibilityShadowInnerSprites[2].position.set(
                    //    ox + x1 + w / 2.0,
                    //    ox + y2);
                    //this._visibilityShadowInnerSprites[3].x = ox + characterSprite.x + VisibilityShadowTileSize;
                    //this._visibilityShadowInnerSprites[3].y = ox + characterSprite.y + VisibilityShadowTileSize;
                    this._visibilityShadowInnerSprites[1].position.set(sx1, sy2);
                    this._visibilityShadowInnerSprites[2].position.set(cx, sy2);
                    this._visibilityShadowInnerSprites[3].position.set(sx2, sy2);
    
                    
                    this._visibilityShadowInnerSprites[4].position.set(sx1, cy);
                    
                    this._visibilityShadowInnerSprites[6].position.set(sx2, cy);
                    
                    this._visibilityShadowInnerSprites[7].position.set(sx1, sy1);
                    this._visibilityShadowInnerSprites[8].position.set(cx, sy1);
                    this._visibilityShadowInnerSprites[9].position.set(sx2, sy1);
                        //x1 - VisibilityShadowTileSize,
                        //ox + y2);
    
                    this._visibilityShadowInnerSprites[2].scale.x = tw / VisibilityShadowTileSize;
                    this._visibilityShadowInnerSprites[4].scale.y = th / VisibilityShadowTileSize;
                    this._visibilityShadowInnerSprites[6].scale.y = th / VisibilityShadowTileSize;
                    this._visibilityShadowInnerSprites[8].scale.x = tw / VisibilityShadowTileSize;
    
    
                    // Outer
                    const osx1 = tx1 - VisibilityShadowTileSize;
                    const osx2 = tx2 + VisibilityShadowTileSize;
                    const osy1 = ty1 - VisibilityShadowTileSize;
                    const osy2 = ty2 + VisibilityShadowTileSize;
                    const osw = (osx2 - osx1);
                    const osh = (osy2 - osy1);
                    this._visibilityShadowOuterSprites[2].position.set(osx1 + osw / 2.0, osy2);
                    this._visibilityShadowOuterSprites[4].position.set(osx1, osy1 + osh / 2.0);
                    this._visibilityShadowOuterSprites[6].position.set(osx2, osy1 + osh / 2.0);
                    this._visibilityShadowOuterSprites[8].position.set(osx1 + osw / 2.0, osy1);
    
                    const scale = 30.0;
                    this._visibilityShadowOuterSprites[2].scale.set(scale * 2, scale);
                    this._visibilityShadowOuterSprites[4].scale.set(scale, osh / VisibilityShadowTileSize);    // 上下と重ならないように縦だけ調整
                    this._visibilityShadowOuterSprites[6].scale.set(scale, osh / VisibilityShadowTileSize);    // 上下と重ならないように縦だけ調整
                    this._visibilityShadowOuterSprites[8].scale.set(scale * 2, scale);
                }
            }
        }
    }
    

    private createVisibilityShadowPart(frame: number, anchorX: number, anchorY: number): Sprite {
        const sprite = new Sprite(this._visibilityShadowBitmap);
        sprite.setFrame((frame % 5) * VisibilityShadowTileSize, Math.floor(frame / 5) * VisibilityShadowTileSize, VisibilityShadowTileSize, VisibilityShadowTileSize);
        sprite.anchor.set(anchorX, anchorY);    // 9sprite で拡大を伴うものがあるため中央にしておいた方が計算しやすい
        this._spritesetMap.addChild(sprite);
        return sprite;
    }

}
