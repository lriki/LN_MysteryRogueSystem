// Type definitions for rmmz_sprites.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped


declare namespace Spriteset_Map.prototype{
    // Spriteset_Map.prototype.removeBalloon.!0
    
    /**
     * 
     */
    interface RemoveBalloon0 {
                
        /**
         * 
         */
        targetObject : Game_Event;
    }
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_Clickable
 * 
 * The sprite class with click handling functions.
 */
declare class Sprite_Clickable {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Clickable;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Button
 * 
 * The sprite for displaying a button.
 */
declare class Sprite_Button {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     * @param buttonType 
     */
    initialize(buttonType : any): void;
        
    /**
     * 
     */
    setupFrames(): void;
        
    /**
     * 
     * @return  
     */
    blockWidth(): number;
        
    /**
     * 
     * @return  
     */
    blockHeight(): number;
        
    /**
     * 
     */
    loadButtonImage(): void;
        
    /**
     * 
     */
    buttonData(): void;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     */
    checkBitmap(): void;
        
    /**
     * 
     */
    updateFrame(): void;
        
    /**
     * 
     */
    updateOpacity(): void;
        
    /**
     * 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     */
    setColdFrame(x : number, y : number, width : number, height : number): void;
        
    /**
     * 
     * @param x 
     * @param y 
     * @param width 
     * @param height 
     */
    setHotFrame(x : number, y : number, width : number, height : number): void;
        
    /**
     * 
     * @param method 
     */
    setClickHandler(method : () => void): void;
        
    /**
     * 
     */
    onClick(): void;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Battler
 * 
 * The superclass of Sprite_Actor and Sprite_Enemy.
 */
declare class Sprite_Battler {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Battler;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Actor
 * 
 * The sprite for displaying an actor.
 */
declare class Sprite_Actor {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Actor;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Enemy
 * 
 * The sprite for displaying an enemy.
 */
declare class Sprite_Enemy {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Enemy;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Animation
 * 
 * The sprite for displaying an animation.
 */
declare class Sprite_Animation {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Animation;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_AnimationMV
 * 
 * The sprite for displaying an old format animation.
 */
declare class Sprite_AnimationMV {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_AnimationMV;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Battleback
 * 
 * The sprite for displaying a background image in battle.
 */
declare class Sprite_Battleback {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Battleback;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Damage
 * 
 * The sprite for displaying a popup damage.
 */
declare class Sprite_Damage {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     */
    initialize(): void;
        
    /**
     * 
     * @param options 
     */
    destroy(options : any): void;
        
    /**
     * 
     * @param target 
     */
    setup(target : any): void;
        
    /**
     * 
     */
    setupCriticalEffect(): void;
        
    /**
     * 
     * @return  
     */
    fontFace(): string;
        
    /**
     * 
     */
    fontSize(): void;
        
    /**
     * 
     * @return  
     */
    damageColor(): string;
        
    /**
     * 
     * @return  
     */
    outlineColor(): string;
        
    /**
     * 
     * @return  
     */
    outlineWidth(): number;
        
    /**
     * 
     */
    createMiss(): void;
        
    /**
     * 
     * @param value 
     */
    createDigits(value : any): void;
        
    /**
     * 
     * @param width 
     * @param height 
     * @return  
     */
    createChildSprite(width : number, height : any): Sprite_Damage.prototype.CreateChildSpriteRet;
        
    /**
     * 
     * @param width 
     * @param height 
     * @return  
     */
    createBitmap(width : number, height : any): Bitmap;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     * @param sprite 
     */
    updateChild(sprite : Sprite_Damage.prototype.UpdateChild0): void;
        
    /**
     * 
     */
    updateFlash(): void;
        
    /**
     * 
     */
    updateOpacity(): void;
        
    /**
     * 
     * @return  
     */
    isPlaying(): boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_Gauge
 * 
 * The sprite for displaying a status gauge.
 */
declare class Sprite_Gauge {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Gauge;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Name
 * 
 * The sprite for displaying a status gauge.
 */
declare class Sprite_Name {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Name;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_StateIcon
 * 
 * The sprite for displaying state icons.
 */
declare class Sprite_StateIcon {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     */
    initialize(): void;
        
    /**
     * 
     */
    initMembers(): void;
        
    /**
     * 
     */
    loadBitmap(): void;
        
    /**
     * 
     * @param battler 
     */
    setup(battler : Game_Actor): void;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     * @return  
     */
    animationWait(): number;
        
    /**
     * 
     */
    updateIcon(): void;
        
    /**
     * 
     * @return  
     */
    shouldDisplay(): /* !this._battler */ any;
        
    /**
     * 
     */
    updateFrame(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_StateOverlay
 * 
 * The sprite for displaying an overlay image for a state.
 */
declare class Sprite_StateOverlay {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     */
    initialize(): void;
        
    /**
     * 
     */
    initMembers(): void;
        
    /**
     * 
     */
    loadBitmap(): void;
        
    /**
     * 
     * @param battler 
     */
    setup(battler : any): void;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     * @return  
     */
    animationWait(): number;
        
    /**
     * 
     */
    updatePattern(): void;
        
    /**
     * 
     */
    updateFrame(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_Weapon
 * 
 * The sprite for displaying a weapon image for attacking.
 */
declare class Sprite_Weapon {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     */
    initialize(): void;
        
    /**
     * 
     */
    initMembers(): void;
        
    /**
     * 
     * @param weaponImageId 
     */
    setup(weaponImageId : any): void;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     * @return  
     */
    animationWait(): number;
        
    /**
     * 
     */
    updatePattern(): void;
        
    /**
     * 
     */
    loadBitmap(): void;
        
    /**
     * 
     */
    updateFrame(): void;
        
    /**
     * 
     * @return  
     */
    isPlaying(): boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_Balloon
 * 
 * The sprite for displaying a balloon icon.
 */
declare class Sprite_Balloon {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Balloon;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Picture
 * 
 * The sprite for displaying a picture.
 */
declare class Sprite_Picture {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Picture;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Timer
 * 
 * The sprite for displaying the timer.
 */
declare class Sprite_Timer {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Timer;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Destination
 * 
 * The sprite for displaying the destination place of the touch input.
 */
declare class Sprite_Destination {
        
    /**
     * 
     * @return  
     */
    new (): Sprite_Destination;
}



/**
 * -----------------------------------------------------------------------------
 * Spriteset_Battle
 * 
 * The set of sprites on the battle screen.
 */
declare class Spriteset_Battle {
        
    /**
     * 
     */
    new ();
        
    /**
     * 
     */
    initialize(): void;
        
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
    createBackground(): void;
        
    /**
     * 
     */
    createBattleback(): void;
        
    /**
     * 
     */
    createBattleField(): void;
        
    /**
     * 
     * @return  
     */
    battleFieldOffsetY(): number;
        
    /**
     * 
     */
    update(): void;
        
    /**
     * 
     */
    updateBattleback(): void;
        
    /**
     * 
     */
    createEnemies(): void;
        
    /**
     * 
     * @param a 
     * @param b 
     * @return  
     */
    compareEnemySprite(a : any, b : any): number;
        
    /**
     * 
     */
    createActors(): void;
        
    /**
     * 
     */
    updateActors(): void;
        
    /**
     * 
     * @param target 
     */
    findTargetSprite(target : any): void;
        
    /**
     * 
     * @return  
     */
    battlerSprites(): Array<any>;
        
    /**
     * 
     * @return  
     */
    isEffecting(): boolean;
        
    /**
     * 
     * @return  
     */
    isAnyoneMoving(): boolean;
        
    /**
     * 
     * @return  
     */
    isBusy(): boolean;
        
    /**
     * 
     */
    _battlebackLocated : boolean;
        
    /**
     * 
     */
    _enemySprites : Array<any>;
        
    /**
     * 
     */
    _actorSprites : Array<any>;
}
