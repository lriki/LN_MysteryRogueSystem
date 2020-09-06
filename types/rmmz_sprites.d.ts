// Type definitions for rmmz_sprites.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace Sprite_Damage.prototype{
	// Sprite_Damage.prototype.createChildSprite.!ret
	
	/**
	 * 
	 */
	interface CreateChildSpriteRet {
				
		/**
		 * 
		 */
		y : number;
				
		/**
		 * 
		 */
		ry : number;
				
		/**
		 * 
		 */
		dy : number;
				
		/**
		 * 
		 */
		x : number;
				
		/**
		 * 
		 */
		bitmap : Bitmap;
	}
}
declare namespace Sprite_Damage.prototype{
	// Sprite_Damage.prototype.updateChild.!0
	
	/**
	 * 
	 */
	interface UpdateChild0 {
				
		/**
		 * 
		 */
		dy : number;
				
		/**
		 * 
		 */
		ry : number;
				
		/**
		 * 
		 */
		y : number;
	}
}
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
declare interface Sprite_Clickable {
		
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
declare interface Sprite_Button {
		
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
 * Sprite_Character
 * 
 * The sprite for displaying a character.
 */
declare interface Sprite_Character {
		
	/**
	 * 
	 * @return  
	 */
	new (): Sprite_Character;
}


/**
 * -----------------------------------------------------------------------------
 * Sprite_Battler
 * 
 * The superclass of Sprite_Actor and Sprite_Enemy.
 */
declare interface Sprite_Battler {
		
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
declare interface Sprite_Actor {
		
	/**
	 * 
	 * @return  
	 */
	new (): Sprite_Actor;
}


/**
 * 
 */
declare namespace Sprite_Actor{
	
	/**
	 * 
	 */
	namespace MOTIONS{
		
		/**
		 * 
		 */
		namespace walk{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace wait{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace chant{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace guard{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace damage{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace evade{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace thrust{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace swing{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace missile{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace skill{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace spell{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace item{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace escape{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace victory{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace dying{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace abnormal{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace sleep{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
		
		/**
		 * 
		 */
		namespace dead{
						
			/**
			 * 
			 */
			export var index : number;
						
			/**
			 * 
			 */
			export var loop : boolean;
		}
	}
}

/**
 * -----------------------------------------------------------------------------
 * Sprite_Enemy
 * 
 * The sprite for displaying an enemy.
 */
declare interface Sprite_Enemy {
		
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
declare interface Sprite_Animation {
		
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
declare interface Sprite_AnimationMV {
		
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
declare interface Sprite_Battleback {
		
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
declare interface Sprite_Damage {
		
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
declare interface Sprite_Gauge {
		
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
declare interface Sprite_Name {
		
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
declare interface Sprite_StateIcon {
		
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
declare interface Sprite_StateOverlay {
		
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
declare interface Sprite_Weapon {
		
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
declare interface Sprite_Balloon {
		
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
declare interface Sprite_Picture {
		
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
declare interface Sprite_Timer {
		
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
declare interface Sprite_Destination {
		
	/**
	 * 
	 * @return  
	 */
	new (): Sprite_Destination;
}


/**
 * -----------------------------------------------------------------------------
 * Spriteset_Base
 * 
 * The superclass of Spriteset_Map and Spriteset_Battle.
 */
declare interface Spriteset_Base {
		
	/**
	 * 
	 * @return  
	 */
	new (): Spriteset_Base;
}


/**
 * -----------------------------------------------------------------------------
 * Spriteset_Map
 * 
 * The set of sprites on the map screen.
 */
declare interface Spriteset_Map {
		
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
 * Spriteset_Battle
 * 
 * The set of sprites on the battle screen.
 */
declare interface Spriteset_Battle {
		
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
