import { assert } from "ts/Common";
import { DSequelId } from "ts/data/DSequel";
import { Vector2 } from "ts/math/Vector2";
import { REGame } from "ts/objects/REGame";
import { Helpers } from "ts/system/Helpers";
import { RESystem } from "ts/system/RESystem";
import { REVisualSequelContext } from "ts/visual/REVisualSequelContext";
import { LEntity } from "../objects/LEntity";
import { REVisual } from "./REVisual";
import { SNavigationHelper } from "ts/system/SNavigationHelper";
import { LUnitBehavior } from "ts/objects/behaviors/LUnitBehavior";
import { LState } from "ts/objects/states/LState";
import { Game_REPrefabEvent } from "ts/rmmz/Game_REPrefabEvent";
import { SEntityVisibility, SView } from "ts/system/SView";
import { DPrefabImage } from "ts/data/DPrefab";
import { LEntityId } from "ts/objects/LObject";

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

    setX(value: number): void {
        this._position.x = value;
    }

    setY(value: number): void {
        this._position.y = value;
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

        
        if (this._rmmzEventId >= 0) {
            //const tileSize = REVisual.manager.tileSize();
            const event = $gameMap.event(this._rmmzEventId) as Game_REPrefabEvent;
            const entity = this.entity();


            
            const visibility = SView.getEntityVisibility(entity);


            const charactorImage = this.getCharacterImage(entity, visibility);
            if (charactorImage) {
                event.setImage(charactorImage.characterName, charactorImage.characterIndex);

                if (event.isDirectionFixed() != charactorImage.directionFix) {
                    event.setDirection(charactorImage.direction);
                    event.setDirectionFix(charactorImage.directionFix);
                }

                event.setStepAnime(charactorImage.stepAnime);
                event.setWalkAnime(charactorImage.walkAnime);
                if (!charactorImage.stepAnime && !charactorImage.walkAnime) {
                    event.setPattern(charactorImage.pattern);
                }
            }

            if (entity._needVisualRefresh) {
                entity._needVisualRefresh = false;
                event.refresh();
            }




            event.setTransparent(!visibility.visible);

            event.setDirection(this._entity.dir);


            // Sequel の更新は、
            // - 表示プロパティの後で行う必要がある。こうしないと、Sequel 更新内での不透明度の調整が効かなくなる。
            // - 姿勢同期の前で行う必要がある。こうしないと、座標更新が1フレーム遅れてカクカクして見えてしまう。
            this._sequelContext._update();

            // 姿勢同期
            event._x = this._position.x;
            event._y = this._position.y;
            event._realX = this._position.x;//(this._position.x * tileSize.x) + (tileSize.x  / 2);
            event._realY = this._position.y;//(this._position.y * tileSize.y) + (tileSize.y  / 2);


            
            const sprite = this.rmmzSprite();
            if (sprite) {
                const entity = this.entity();

                if (entity.findBehavior(LUnitBehavior)) {
                    sprite.setStateIcons(entity.states().map(state => state.stateData().iconIndex));
                }

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
        }
    }

    private getCharacterImage(entity: LEntity, visibility: SEntityVisibility): DPrefabImage | undefined {
        if (visibility.image) {
            return visibility.image;
        }
        
        return entity.getCharacterImage();
    }

/*
    private updateEventPage(event: Game_REPrefabEvent): void {
        const index = this.getEventPageIndex();
        event.setPageIndex(index);
    }
    
    private getEventPageIndex(): number {
        const prefab = this.entity().data().prefab();
        if (prefab.subPages.length > 0) {
            for (const stateId of this.entity()._states) {
                const state = REGame.world.object(stateId) as LState;
                for (const subPage of prefab.subPages) {
                    if (subPage.stateId == state.stateDataId()) {
                        return subPage.rmmzEventPageIndex;
                    }
                }
            }
        }
        return 0;
    }
    */
}

