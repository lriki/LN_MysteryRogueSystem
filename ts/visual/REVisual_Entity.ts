import { assert } from "ts/Common";
import { DSequel, DSequelId } from "ts/data/DSequel";
import { Vector2 } from "ts/math/Vector2";
import { REGame } from "ts/objects/REGame";
import { LMap } from "ts/objects/LMap";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { REVisualSequelContext } from "ts/visual/REVisualSequelContext";
import { LEntity } from "../objects/LEntity";
import { REVisual } from "./REVisual";
import { SNavigationHelper } from "ts/system/SNavigationHelper";

/**
 * Entity の「見た目」を表現するためのクラス。
 * 
 * RMMZ 向けのこのクラスの実装では、直接 Sprite を出したりするわけではない点に注意。
 * Mnager からのインスタンス生成と同時に、動的に Game_Event が生成され、このクラスはその Game_Event を操作する。
 */
export class REVisual_Entity
{
    private _entity: LEntity; // EntityVisual が存在する間、Entity は必ず存在していると考えてよい
    private _rmmzEventId: number;
    private _rmmzSpriteIndex: number;   // Spriteset_Map._characterSprites の index
    private _sequelContext: REVisualSequelContext;
    private _initialUpdate: boolean = true;

    // 単位は Block 座標と等しい。px 単位ではない点に注意。
    // アニメーションを伴う場合、少数を扱うこともある。
    // 原点は Block の中央とする。
    private _position: Vector2;

    //private _visibilityOpacity: number = 1.0;
    private _visibilityOpacityStart: number = 1.0;
    private _visibilityOpacityTarget: number = 1.0;
    private _visibilityFrame: number = 0;
    private _prevVisibility: boolean = true;

    constructor(entity: LEntity, rmmzEventId: number) {
        this._entity = entity;
        this._rmmzEventId = rmmzEventId;
        this._rmmzSpriteIndex = -1;
        this._sequelContext = new REVisualSequelContext(this);
        this._position = new Vector2(entity.x, entity.y);
    }

    entity(): LEntity {
        return this._entity;
    }

    rmmzEventId(): number {
        return this._rmmzEventId;
    }

    rmmzEvent(): Game_Event {
        return $gameMap.event(this._rmmzEventId);
    }

    public rmmzSpriteIndex(): number {
        return this._rmmzSpriteIndex;
    }

    rmmzSprite(): Sprite_Character | undefined {
        return (REVisual.spriteset) ? REVisual.spriteset._characterSprites[this._rmmzSpriteIndex] : undefined;
    }

    getRmmzSprite(): Sprite_Character {
        const s = this.rmmzSprite();
        assert(s);
        return s;
    }

    public isVisible(): boolean {
        const focusedEntity = REGame.camera.focusedEntity()
        return focusedEntity ? SNavigationHelper.testVisibilityForMinimap(focusedEntity, this._entity) : false;
    }

    position(): Vector2 {
        return this._position;
    }

    setPosition(value: Vector2): void {
        this._position = value;
    }

    resetPosition() {
        this._position.x = this._entity.x;
        this._position.y = this._entity.y;
    }

    sequelContext(): REVisualSequelContext {
        return this._sequelContext;
    }

    getIdleSequelId(): DSequelId {
        return this._entity.queryProperty(RESystem.properties.idleSequel);
    }

    _setSpriteIndex(value: number) {
        this._rmmzSpriteIndex = value;
    }

    _update() {
        assert(REVisual.manager);

        this._sequelContext._update();
        
        if (this._rmmzEventId >= 0) {
            const tileSize = REVisual.manager.tileSize();
            const event = $gameMap.event(this._rmmzEventId);

            // 姿勢同期
            event._x = this._position.x;
            event._y = this._position.y;
            event._realX = this._position.x;//(this._position.x * tileSize.x) + (tileSize.x  / 2);
            event._realY = this._position.y;//(this._position.y * tileSize.y) + (tileSize.y  / 2);
            event.setDirection(this._entity.dir);

            
            const sprite = this.rmmzSprite();
            if (sprite) {
                const entity = this.entity();
                sprite.setStateIcons(entity.states().map(state => state.stateData().iconIndex));

                if (this._initialUpdate) {
                    this._initialUpdate = false;
                    this._prevVisibility = this.isVisible();
                    if (!this._prevVisibility) {
                        event.setOpacity(0);
                    }
                }

                const opacityFrames = 10;
                const visible = this.isVisible();
                if (this._prevVisibility != visible) {
                    this._prevVisibility = visible;
                    if (visible) {
                        // フェードイン
                        this._visibilityOpacityStart = event.opacity();
                        this._visibilityOpacityTarget = 255;
                        this._visibilityFrame = opacityFrames;
                    }
                    else {
                        // フェードアウト
                        this._visibilityOpacityStart = event.opacity();
                        this._visibilityOpacityTarget = 0;
                        this._visibilityFrame = opacityFrames;
                    }
                }

                if (this._visibilityFrame > 0) {
                    this._visibilityFrame--;
                    if (this._visibilityFrame > 0) {
                        event.setOpacity(Helpers.lerp(this._visibilityOpacityTarget, this._visibilityOpacityStart, this._visibilityFrame / opacityFrames));
                    }
                    else {
                        event.setOpacity(this._visibilityOpacityTarget);
                    }
                }
            }
            else {
                console.log("undef??");
            }
        }
        else {
            console.log("vent??");
        }
    }
}

