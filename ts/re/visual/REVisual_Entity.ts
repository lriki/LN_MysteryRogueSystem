import { assert } from "ts/re/Common";
import { DSequelId } from "ts/re/data/DSequel";
import { Vector2 } from "ts/re/math/Vector2";
import { REGame } from "ts/re/objects/REGame";
import { Helpers } from "ts/re/system/Helpers";
import { RESystem } from "ts/re/system/RESystem";
import { REVisualSequelContext } from "ts/re/visual/REVisualSequelContext";
import { LEntity } from "../objects/LEntity";
import { REVisual } from "./REVisual";
import { SNavigationHelper } from "ts/re/system/SNavigationHelper";
import { LUnitBehavior } from "ts/re/objects/behaviors/LUnitBehavior";
import { SEntityVisibility, SView } from "ts/re/system/SView";
import { DPrefabActualImage } from "ts/re/data/DPrefab";
import { REBasics } from "../data/REBasics";

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

    // update 中 (Sequel更新中) のみアクセスできる。
    // update() の他、Sequel更新中にも参照したいので、キャッシングしているもの。
    private _visibility: SEntityVisibility | undefined;
    private _actualImage: DPrefabActualImage | undefined;

    private _sequelOpacity: number;

    constructor(entity: LEntity, rmmzEventId: number) {
        this._entity = entity;
        this._rmmzEventId = rmmzEventId;
        this._rmmzSpriteIndex = -1;
        this._sequelContext = new REVisualSequelContext(this);
        this._position = new Vector2(entity.x, entity.y);
        this._sequelOpacity = 1.0;
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

    x(): number {
        return this._position.x;
    }

    y(): number {
        return this._position.y;
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
        return this._entity.queryIdleSequelId();
    }

    _setSpriteIndex(value: number) {
        this._rmmzSpriteIndex = value;
    }

    public visibility(): SEntityVisibility {
        assert(this._visibility);
        return this._visibility;
    }

    public actualImage(): DPrefabActualImage {
        assert(this._actualImage);
        return this._actualImage;
    }

    // 0~1
    public setOpacity(value: number) {
        this._sequelOpacity = value;
    }

    _update() {
        assert(REVisual.manager);

        
        if (this._rmmzEventId >= 0) {
            //const tileSize = REVisual.manager.tileSize();
            const event = $gameMap.event(this._rmmzEventId);
            const entity = this.entity();


            
            this._visibility = SView.getEntityVisibility(entity);


                
            this._actualImage = this.getCharacterImage(entity, this._visibility);
            if (this._actualImage) {
                event.setImage(this._actualImage.characterName, this._actualImage.characterIndex);

                if (event.isDirectionFixed() != this._actualImage.directionFix) {
                    event.setDirection(this._actualImage.direction);
                    event.setDirectionFix(this._actualImage.directionFix);
                }

                event.setStepAnime(this._actualImage.stepAnime);
                event.setWalkAnime(this._actualImage.walkAnime);
                if (!this._actualImage.stepAnime && !this._actualImage.walkAnime) {
                    event.setPattern(this._actualImage.pattern);
                }
            }

            if (entity._needVisualRefresh) {
                entity._needVisualRefresh = false;
                event.refresh();
            }

            event.setDirection(entity.dir);



            event.setTransparent(!this._visibility.visible);


            // if (Input.isTriggered("ok")) {
            //     console.log("ok");
            //     event.popupDamage_RE(100, 0);
            // }


            // Sequel の更新は、
            // - 表示プロパティの後で行う必要がある。こうしないと、Sequel 更新内での不透明度の調整が効かなくなる。
            // - 姿勢同期の前で行う必要がある。こうしないと、座標更新が1フレーム遅れてカクカクして見えてしまう。
            this._sequelContext._update();

            // 姿勢同期
            event._x = this._position.x;
            event._y = this._position.y;
            event._realX = this._position.x;//(this._position.x * tileSize.x) + (tileSize.x  / 2);
            event._realY = this._position.y;//(this._position.y * tileSize.y) + (tileSize.y  / 2);
            
            if (REVisual._syncCamera) {
                this.updateOpacity(entity, event, this._visibility);
            }


            
            const sprite = this.rmmzSprite();
            if (sprite) {
                const entity = this.entity();

                if (entity.findEntityBehavior(LUnitBehavior)) {
                    sprite.setStateIcons(entity.states().map(state => state.stateData().iconIndex));
                }

            }
        }
    }

    private updateOpacity(entity: LEntity, event: Game_Event, visibility: SEntityVisibility): void {

        // 初回更新時に、現在の表示状態を覚えておく。フェードインを正しく開始できるようにするため。
        if (this._initialUpdate) {
            this._initialUpdate = false;
            this._prevVisibility = this.isVisible();
            if (!this._prevVisibility) {
                event.setOpacity(0);
            }
        }

        // フェードイン・フェードアウトの開始判定。
        const opacityFrames = 10;
        const visible = this.isVisible();
        if (this._prevVisibility != visible) {
            this._prevVisibility = visible;
            if (visible) {
                // フェードイン
                this._visibilityOpacityStart = event.opacity();
                this._visibilityOpacityTarget = this.getActualOpacity(this._entity, visibility);
                this._visibilityFrame = opacityFrames;
            }
            else {
                // フェードアウト
                this._visibilityOpacityStart = event.opacity();
                this._visibilityOpacityTarget = 0;
                this._visibilityFrame = opacityFrames;
            }
        }

        let opacity = 255;
        if (this._visibilityFrame > 0) {
            this._visibilityFrame--;
            if (this._visibilityFrame > 0) {
                opacity = (Helpers.lerp(this._visibilityOpacityTarget, this._visibilityOpacityStart, this._visibilityFrame / opacityFrames));
            }
            else {
                opacity = this._visibilityOpacityTarget;
            }
        }
        else {
            opacity = this.getActualOpacity(entity, visibility);
        }

        event.setOpacity(opacity * this._sequelOpacity);
    }

    public getCharacterImage(entity: LEntity, visibility: SEntityVisibility): DPrefabActualImage | undefined {
        if (visibility.image) {
            return visibility.image;
        }
        
        return entity.getCharacterImage();
    }

    private getActualOpacity(entity: LEntity, visibility: SEntityVisibility): number {
        if (!visibility.visible) return 0;
        if (visibility.translucent) return 127;
        return 255;
        /*
        if (entity.traits(DTraits.Invisible).length > 0) {
            if (REGame.camera.focusedEntityId().equals(entity.entityId())) {
                return 127;
            }
            else {
                return 0;
            }
        }
        else {
            return 255;
        }
        */
    }

    public showEffectResult(): void {
        const result = this.entity()._effectResult;

        if (this._rmmzEventId >= 0) {
            const event = $gameMap.event(this._rmmzEventId);
            const hp = result.paramEffects[REBasics.params.hp];
            if (hp) {
                event.popupDamage_RE(hp.damage, 0);
            }
        }
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

