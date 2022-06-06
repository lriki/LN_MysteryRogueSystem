import { REGame } from "ts/re/objects/REGame";
import { VAnimation, VAnimationInstance, VEasingAnimationCurve } from "./animation/VAnimation";
import { easing } from "./animation/VEasing";
import { REVisual } from "./REVisual";

const VisibilityShadowTileSize = 48;

export class VVisibilityShadow {
    private _spritesetMap: Spriteset_Map;
    private _visibilityShadowBitmap: Bitmap;
    private _visibilityShadowInnerSprites: Sprite[];
    private _visibilityShadowOuterSprites: Sprite[];
    private _mx1: number;
    private _my1: number;
    private _mx2: number;
    private _my2: number;
    private _inRoom: Boolean;
    private _mx1Animation: VAnimationInstance | undefined;
    private _my1Animation: VAnimationInstance | undefined;
    private _mx2Animation: VAnimationInstance | undefined;
    private _my2Animation: VAnimationInstance | undefined;

    constructor(spritesetMap: Spriteset_Map) {
        this._spritesetMap = spritesetMap;
        
        this._visibilityShadowBitmap = ImageManager.loadSystem("MR-VisibilityShadow");
        //this._visibilityShadowBitmap = ImageManager.loadSystem("MR-VisibilityShadow-Grid");

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

        this._mx1 = -1000;
        this._my1 = -1000;
        this._mx2 = -1000;
        this._my2 = -1000;
        this._inRoom = false;
    }

    _update() {
        const spritesVisible = !REGame.map.sightClarity;
        for (const s of this._visibilityShadowInnerSprites) {
            if (s) s.visible = spritesVisible;
        }
        for (const s of this._visibilityShadowOuterSprites) {
            if (s) s.visible = spritesVisible;
        }

        if (REGame.map.sightClarity) {
            return;
        }

        const focusedEntity = REGame.camera.focusedEntity();
        if (REVisual.entityVisualSet && focusedEntity) {
            const visual = REVisual.entityVisualSet.findEntityVisualByEntity(focusedEntity);
            if (visual) {
                const unit = $gamePlayer;
                const sprite = visual.rmmzSprite();
                if (sprite) {
    
                    let tx1 = 0;  // タイル左辺
                    let tx2 = 0;  // タイル右辺
                    let ty1 = 0;  // タイル上辺
                    let ty2 = 0;  // タイル下辺
    
                    const unitRealX = unit._realX;
                    const unitRealY = unit._realY;

                    // LRoom は四捨五入した値から得るようにすると、部屋に入った時滑らかに影を動かせる
                    const unitX = Math.round(unitRealX);
                    const unitY = Math.round(unitRealY);
                    const room = REGame.map.rooms().find(room => room.contains(unitX, unitY));
                    if (room) {
                        tx1 = $gameMap.adjustX(room.mx1);
                        tx2 = $gameMap.adjustX(room.mx2);
                        ty1 = $gameMap.adjustY(room.my1);
                        ty2 = $gameMap.adjustY(room.my2);
                    }
                    else {
                        tx1 = $gameMap.adjustX(unitRealX);
                        tx2 = $gameMap.adjustX(unitRealX);
                        ty1 = $gameMap.adjustY(unitRealY);
                        ty2 = $gameMap.adjustY(unitRealY);
                    }

                    if (this._inRoom != (!!room)) {
                        this.animateVisibleAreaRect(tx1, ty1, tx2, ty2);
                        this._inRoom = (!!room);
                    }

                    if (this._mx1Animation && !this._mx1Animation.isFinished()) {
                        (this._mx1Animation.curve as VEasingAnimationCurve)._targetValue = tx1;
                    }
                    else {
                        this._mx1 = tx1;
                    }
                    if (this._my1Animation && !this._my1Animation.isFinished()) {
                        (this._my1Animation.curve as VEasingAnimationCurve)._targetValue = ty1;
                    }
                    else {
                        this._my1 = ty1;
                    }
                    if (this._mx2Animation && !this._mx2Animation.isFinished()) {
                        (this._mx2Animation.curve as VEasingAnimationCurve)._targetValue = tx2;
                    }
                    else {
                        this._mx2 = tx2;
                    }
                    if (this._my2Animation && !this._my2Animation.isFinished()) {
                        (this._my2Animation.curve as VEasingAnimationCurve)._targetValue = ty2;
                    }
                    else {
                        this._my2 = ty2;
                    }

                    this.updateVisibleAreaRect();
                }
            }
        }
    }

    private animateVisibleAreaRect(mx1: number, my1: number, mx2: number, my2: number) {
        if (this._mx1 <= -1000) {
            this._mx1 = mx1;
            this._my1 = my1;
            this._mx2 = mx2;
            this._my2 = my2;
        }
        else {
            const base = this._visibilityShadowInnerSprites[1];
            this._mx1Animation = VAnimation.startAt(base, "mx1", this._mx1, mx1, 0.1, easing.outQuad, v => { this._mx1 = v; });
            this._my1Animation = VAnimation.startAt(base, "my1", this._my1, my1, 0.1, easing.outQuad, v => { this._my1 = v; });
            this._mx2Animation = VAnimation.startAt(base, "mx2", this._mx2, mx2, 0.1, easing.outQuad, v => { this._mx2 = v; });
            this._my2Animation = VAnimation.startAt(base, "my2", this._my2, my2, 0.1, easing.outQuad, v => { this._my2 = v; });
        }
    }
    
    private updateVisibleAreaRect(): void {
        const tileWidth = $gameMap.tileWidth();
        const tileHeight = $gameMap.tileHeight();
    
        const tx1 = this._mx1 * tileWidth;
        const tx2 = this._mx2 * tileWidth + tileWidth;
        const ty1 = this._my1 * tileHeight;
        const ty2 = this._my2 * tileHeight + tileHeight;

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

        this._visibilityShadowInnerSprites[1].position.set(sx1, sy2);
        this._visibilityShadowInnerSprites[2].position.set(cx, sy2);
        this._visibilityShadowInnerSprites[3].position.set(sx2, sy2);
        this._visibilityShadowInnerSprites[4].position.set(sx1, cy);
        this._visibilityShadowInnerSprites[6].position.set(sx2, cy);
        this._visibilityShadowInnerSprites[7].position.set(sx1, sy1);
        this._visibilityShadowInnerSprites[8].position.set(cx, sy1);
        this._visibilityShadowInnerSprites[9].position.set(sx2, sy1);

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

    private createVisibilityShadowPart(frame: number, anchorX: number, anchorY: number): Sprite {
        const sprite = new Sprite(this._visibilityShadowBitmap);
        sprite.setFrame((frame % 5) * VisibilityShadowTileSize, Math.floor(frame / 5) * VisibilityShadowTileSize, VisibilityShadowTileSize, VisibilityShadowTileSize);
        sprite.anchor.set(anchorX, anchorY);    // 9sprite で拡大を伴うものがあるため中央にしておいた方が計算しやすい
        this._spritesetMap.addChild(sprite);
        return sprite;
    }

}
