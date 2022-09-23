import * as PIXI from "pixi.js";

declare global {

/**
 * -----------------------------------------------------------------------------
 * Spriteset_Base
 * 
 * The superclass of Spriteset_Map and Spriteset_Battle.
 */
export class Spriteset_Base extends Sprite {

    _effectsContainer: Tilemap;
    _effectSprites: Sprite[];
    _animationSprites: (Sprite_Animation | Sprite_AnimationMV)[];
        
    constructor();

    initialize(): void;

    loadSystemImages(): void;

    createLowerLayer(): void;
    createUpperLayer(): void;

    update(): void;

    createBaseSprite(): void;
    createBaseFilters(): void;

    createPictures(): void;
    pictureContainerRect(): Rectangle;

    createTimer(): void;

    createOverallFilters(): void;

    updateBaseFilters(): void;
    updateOverallFilters(): void;

    updatePosition(): void;

    //findTargetSprite(target: T): S;

    updateAnimations(): void;
    processAnimationRequests(): void;
    createAnimation(): void;
    createAnimationSprite(): void;

    isMVAnimation(animation: IDataAnimation): boolean;

    //makeTargetSprites(targets: T[]): S[];

    lastAnimationSprite(): Sprite_Animation | Sprite_AnimationMV;
    //isAnimationForEach(animation: RPG.DataAnimation): boolean;

    animationBaseDelay(): number;
    animationNextDelay(): number;

    animationShouldMirror(target: Game_Battler): boolean;

    removeAnimation(sprite: Sprite_Animation | Sprite_AnimationMV): void;
    removeAllAnimations(): void;

    isAnimationPlaying(): boolean;
}


/**
 * -----------------------------------------------------------------------------
 * Spriteset_Map
 * 
 * The set of sprites on the map screen.
 */
export class Spriteset_Map extends Spriteset_Base {
    
    _parallax: TilingSprite;
    _parallaxName: string;
    _tilemap: Tilemap;
    _tileset: IDataTileset;
    _characterSprites: Sprite_Character[];
    _shadowSprite: Sprite;
    _destinationSprite: Sprite_Destination;
    _weather: Weather;
    _baseSprite: Sprite;

    /**
     * 
     */
    constructor();
        
    /**
     * 
     * @param options 
     */
    destroy(options : any): void;
        
    /**
     * 
     */
    loadSystemImages(): void;
        
    /**
     * 
     */
    createLowerLayer(): void;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     */
    hideCharacters(): void;
        
    /**
     * 
     */
    createParallax(): void;
        
    /**
     * 
     */
    createTilemap(): void;
        
    /**
     * 
     */
    loadTileset(): void;
        
    /**
     * 
     */
    createCharacters(): void;
        
    /**
     * 
     */
    createShadow(): void;
        
    /**
     * 
     */
    createDestination(): void;
        
    /**
     * 
     */
    createWeather(): void;
        
    /**
     * 
     */
    updateTileset(): void;
        
    /**
     * 
     */
    updateParallax(): void;
        
    /**
     * 
     */
    updateTilemap(): void;
        
    /**
     * 
     */
    updateShadow(): void;
        
    /**
     * 
     */
    updateWeather(): void;
        
    /**
     * 
     */
    updateBalloons(): void;
        
    /**
     * 
     */
    processBalloonRequests(): void;
        
    /**
     * 
     * @param request 
     */
    createBalloon(request : /* Spriteset_Map.prototype.createBalloon.!0 */ any): void;
        
    /**
     * 
     * @param sprite 
     */
    removeBalloon(sprite : Spriteset_Map.prototype.RemoveBalloon0): void;
        
    /**
     * 
     */
    removeAllBalloons(): void;
        
    /**
     * 
     * @param target 
     */
    findTargetSprite(target : Game_Player): void;
        
    /**
     * 
     * @return  
     */
    animationBaseDelay(): number;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Character
 * 
 * The sprite for displaying a character.
 */
export class Sprite_Character extends Sprite {
    _character: Game_CharacterBase;
        
    constructor(character?: Game_CharacterBase);
    initialize(character?: Game_CharacterBase): void;
    setCharacter(character: Game_CharacterBase): void;
    initMembers(): void;
    checkCharacter():boolean;
    characterPatternX(): number;
    characterPatternY(): number;

    widthHeight(): number;
    patternHeight(): number;
    patternWidth(): number;
    patternHeight(): number;
    characterBlockX(): number;
    characterBlockY(): number;

}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Damage
 * 
 * The sprite for displaying a popup damage.
 */
 export class Sprite_Damage extends Sprite {
    constructor();
    initialize(): void;
    destroy(options : any): void;
    setup(target : any): void;
    setupCriticalEffect(): void;
    fontFace(): string;
    fontSize(): void;
    damageColor(): string;
    outlineColor(): string;
    outlineWidth(): number;
    createMiss(): void;
    createDigits(value : any): void;
    createChildSprite(width : number, height : any): Sprite_Damage.prototype.CreateChildSpriteRet;
    createBitmap(width : number, height : any): Bitmap;
    update(): void;
    updateChild(sprite : Sprite_Damage.prototype.UpdateChild0): void;
    updateFlash(): void;
    updateOpacity(): void;
    isPlaying(): boolean;

    _duration: number;
    _flashColor: number[];
    _flashDuration: number;
    _colorType: number;
}

}
