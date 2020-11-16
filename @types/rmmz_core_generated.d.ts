
// Type definitions for rmmz_core.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace Array.prototype{
	// Array.prototype.equals.!0
	type Equals0 = Array<any>;
}
declare namespace Array.prototype{
	// Array.prototype.remove.!ret
	type RemoveRet = Array<any>;
}
declare namespace Bitmap.prototype{
	// Bitmap.prototype._onXhrLoad.!0
	
	/**
	 * 
	 */
	interface _onXhrLoad0 {
				
		/**
		 * 
		 */
		responseType : string;
				
		/**
		 * 
		 */
		onload(): void;
				
		/**
		 * 
		 */
		onerror(): void;
	}
}
declare namespace Tilemap
{
	// Tilemap.FLOOR_AUTOTILE_TABLE.<i>
	type FLOOR_AUTOTILE_TABLEI = Array<Array<number>>;
}
declare namespace Tilemap
{
	// Tilemap.WALL_AUTOTILE_TABLE.<i>
	type WALL_AUTOTILE_TABLEI = Array<Array<number>>;
}
declare namespace Tilemap
{
	// Tilemap.WALL_AUTOTILE_TABLE.<i>
	type WATERFALL_AUTOTILE_TABLE = Array<Array<Array<number>>>;
}
declare namespace ColorFilter.prototype{
	// ColorFilter.prototype.setColorTone.!0
	type SetColorTone0 = Array<number>;
}
declare namespace ColorFilter.prototype{
	// ColorFilter.prototype.setBlendColor.!0
	type SetBlendColor0 = Array<number>;
}
declare namespace WebAudio.prototype{
	// WebAudio.prototype.addLoadListener.!0
	type AddLoadListener0 = (() => void);
}
declare namespace WebAudio.prototype{
	// WebAudio.prototype._onXhrLoad.!0
	
	/**
	 * 
	 */
	interface _onXhrLoad0 {
				
		/**
		 * 
		 */
		responseType : string;
				
		/**
		 * 
		 */
		onload(): void;
				
		/**
		 * 
		 */
		onerror(): void;
	}
}
declare namespace Input{
	// Input._gamepadStates.<i>
	type _gamepadStatesI = Array<boolean>;
}
declare namespace JsonEx{
	// JsonEx.stringify.!0
	
	/**
	 * 
	 */
	interface Stringify0 {
	}
}
declare namespace JsonEx{
	// JsonEx._encode.!ret
	
	/**
	 * 
	 */
	interface _encodeRet {
	}
}
declare namespace JsonEx{
	// JsonEx._decode.!0
	
	/**
	 * 
	 */
	interface _decode0 {
	}
}

/**
 * The static class that defines utility methods.
 * 
 * @namespace
 */
declare interface Utils {
		
	/**
	 * 
	 * @return  
	 */
	new (): Utils;
}


/**
 * 
 */
declare namespace Utils{
		
	/**
	 * The name of the RPG Maker. "MZ" in the current version.
	 * 
	 * @type string
	 * @constant
	 */
	export var RPGMAKER_NAME : string;
		
	/**
	 * The version of the RPG Maker.
	 * 
	 * @type string
	 * @constant
	 */
	export var RPGMAKER_VERSION : string;
		
	/**
	 * Checks whether the current RPG Maker version is greater than or equal to
	 * the given version.
	 * 
	 * @param {string} version - The "x.x.x" format string to compare.
	 * @returns {boolean} True if the current version is greater than or equal
	 *                    to the given version.
	 * @param version 
	 * @return  
	 */
	function checkRMVersion(version : string): boolean;
		
	/**
	 * Checks whether the option is in the query string.
	 * 
	 * @param {string} name - The option name.
	 * @returns {boolean} True if the option is in the query string.
	 * @param name 
	 * @return  
	 */
	function isOptionValid(name : string): boolean;
		
	/**
	 * Checks whether the platform is NW.js.
	 * 
	 * @returns {boolean} True if the platform is NW.js.
	 * @return  
	 */
	function isNwjs(): boolean;
		
	/**
	 * Checks whether the platform is a mobile device.
	 * 
	 * @returns {boolean} True if the platform is a mobile device.
	 * @return  
	 */
	function isMobileDevice(): boolean;
		
	/**
	 * Checks whether the browser is Mobile Safari.
	 * 
	 * @returns {boolean} True if the browser is Mobile Safari.
	 * @return  
	 */
	function isMobileSafari(): boolean;
		
	/**
	 * Checks whether the browser is Android Chrome.
	 * 
	 * @returns {boolean} True if the browser is Android Chrome.
	 * @return  
	 */
	function isAndroidChrome(): boolean;
		
	/**
	 * Checks whether the browser is accessing local files.
	 * 
	 * @returns {boolean} True if the browser is accessing local files.
	 * @return  
	 */
	function isLocal(): boolean;
		
	/**
	 * Checks whether the browser supports WebGL.
	 * 
	 * @returns {boolean} True if the browser supports WebGL.
	 * @return  
	 */
	function canUseWebGL(): boolean;
		
	/**
	 * Checks whether the browser supports Web Audio API.
	 * 
	 * @returns {boolean} True if the browser supports Web Audio API.
	 * @return  
	 */
	function canUseWebAudioAPI(): boolean;
		
	/**
	 * Checks whether the browser supports CSS Font Loading.
	 * 
	 * @returns {boolean} True if the browser supports CSS Font Loading.
	 * @return  
	 */
	function canUseCssFontLoading(): boolean;
		
	/**
	 * Checks whether the browser supports IndexedDB.
	 * 
	 * @returns {boolean} True if the browser supports IndexedDB.
	 * @return  
	 */
	function canUseIndexedDB(): boolean;
		
	/**
	 * Checks whether the browser can play ogg files.
	 * 
	 * @returns {boolean} True if the browser can play ogg files.
	 * @return  
	 */
	function canPlayOgg(): boolean;
		
	/**
	 * Checks whether the browser can play webm files.
	 * 
	 * @returns {boolean} True if the browser can play webm files.
	 * @return  
	 */
	function canPlayWebm(): boolean;
		
	/**
	 * Encodes a URI component without escaping slash characters.
	 * 
	 * @param {string} str - The input string.
	 * @returns {string} Encoded string.
	 * @param str 
	 * @return  
	 */
	function encodeURI(str : string): string;
		
	/**
	 * Escapes special characters for HTML.
	 * 
	 * @param {string} str - The input string.
	 * @returns {string} Escaped string.
	 * @param str 
	 * @return  
	 */
	function escapeHtml(str : string): string;
		
	/**
	 * Checks whether the string contains any Arabic characters.
	 * 
	 * @returns {boolean} True if the string contains any Arabic characters.
	 * @param str 
	 * @return  
	 */
	function containsArabic(str : string): boolean;
		
	/**
	 * Sets information related to encryption.
	 * 
	 * @param {boolean} hasImages - Whether the image files are encrypted.
	 * @param {boolean} hasAudio - Whether the audio files are encrypted.
	 * @param {string} key - The encryption key.
	 * @param hasImages 
	 * @param hasAudio 
	 * @param key 
	 */
	function setEncryptionInfo(hasImages : boolean, hasAudio : boolean, key : string): void;
		
	/**
	 * [Note] This function is implemented for module independence.
	 */
	export var _hasEncryptedImages : boolean;
		
	/**
	 * 
	 */
	export var _hasEncryptedAudio : boolean;
		
	/**
	 * 
	 */
	export var _encryptionKey : string;
		
	/**
	 * Checks whether the image files in the game are encrypted.
	 * 
	 * @returns {boolean} True if the image files are encrypted.
	 * @return  
	 */
	function hasEncryptedImages(): /* !this._hasEncryptedImages */ any;
		
	/**
	 * Checks whether the audio files in the game are encrypted.
	 * 
	 * @returns {boolean} True if the audio files are encrypted.
	 * @return  
	 */
	function hasEncryptedAudio(): /* !this._hasEncryptedAudio */ any;
		
	/**
	 * Decrypts encrypted data.
	 * 
	 * @param {ArrayBuffer} source - The data to be decrypted.
	 * @returns {ArrayBuffer} The decrypted data.
	 * @param source 
	 * @return  
	 */
	function decryptArrayBuffer(source : ArrayBuffer): ArrayBuffer;
}

/**
 * The static class that carries out graphics processing.
 * 
 * @namespace
 */
declare interface Graphics {
		
	/**
	 * 
	 * @return  
	 */
	new (): Graphics;
}


/**
 * 
 */
declare namespace Graphics{
		
	/**
	 * Initializes the graphics system.
	 * 
	 * @returns {boolean} True if the graphics system is available.
	 * @return  
	 */
	function initialize(): boolean;
		
	/**
	 * 
	 */
	export var _width : number;
		
	/**
	 * 
	 */
	export var _height : number;
		
	/**
	 * 
	 */
	export var _defaultScale : number;
		
	/**
	 * 
	 */
	export var _realScale : number;
		
	/**
	 * 
	 * @param deltaTime 
	 */
	function _tickHandler(deltaTime : any): void;
		
	/**
	 * 
	 */
	export var _fpsCounter : Graphics.FPSCounter;
	
	/**
	 * 
	 */
	var _loadingSpinner : {
				
		/**
		 * 
		 */
		id : string;
	}
		
	/**
	 * 
	 */
	export var _stretchEnabled : boolean;
		
	/**
	 * 
	 */
	export var _wasLoading : boolean;
		
	/**
	 * The total frame count of the game screen.
	 * 
	 * @type number
	 * @name Graphics.frameCount
	 */
	export var frameCount : number;
		
	/**
	 * The width of the window display area.
	 * 
	 * @type number
	 * @name Graphics.boxWidth
	 */
	export var boxWidth : number;
		
	/**
	 * The height of the window display area.
	 * 
	 * @type number
	 * @name Graphics.boxHeight
	 */
	export var boxHeight : number;
		
	/**
	 * Register a handler for tick events.
	 * 
	 * @param {function} handler - The listener function to be added for updates.
	 * @param handler 
	 */
	function setTickHandler(handler : () => void): void;
		
	/**
	 * Starts the game loop.
	 */
	function startGameLoop(): void;
		
	/**
	 * Stops the game loop.
	 */
	function stopGameLoop(): void;
		
	/**
	 * Sets the stage to be rendered.
	 * 
	 * @param {Stage} stage - The stage object to be rendered.
	 * @param stage 
	 */
	function setStage(stage : () => void): void;
		
	/**
	 * Shows the loading spinner.
	 */
	function startLoading(): void;
		
	/**
	 * Erases the loading spinner.
	 * 
	 * @returns {boolean} True if the loading spinner was active.
	 * @return  
	 */
	function endLoading(): boolean;
		
	/**
	 * Displays the error text to the screen.
	 * 
	 * @param {string} name - The name of the error.
	 * @param {string} message - The message of the error.
	 * @param {Error} [error] - The error object.
	 * @param name 
	 * @param message 
	 * @param error? 
	 */
	function printError(name : string, message : string, error? : any): void;
		
	/**
	 * Displays a button to try to reload resources.
	 * 
	 * @param {function} retry - The callback function to be called when the button
	 *                           is pressed.
	 * @param retry 
	 */
	function showRetryButton(retry : () => void): void;
		
	/**
	 * Erases the loading error text.
	 */
	function eraseError(): void;
		
	/**
	 * Converts an x coordinate on the page to the corresponding
	 * x coordinate on the canvas area.
	 * 
	 * @param {number} x - The x coordinate on the page to be converted.
	 * @returns {number} The x coordinate on the canvas area.
	 * @param x 
	 * @return  
	 */
	function pageToCanvasX(x : number): number;
		
	/**
	 * Converts a y coordinate on the page to the corresponding
	 * y coordinate on the canvas area.
	 * 
	 * @param {number} y - The y coordinate on the page to be converted.
	 * @returns {number} The y coordinate on the canvas area.
	 * @param y 
	 * @return  
	 */
	function pageToCanvasY(y : number): number;
		
	/**
	 * Checks whether the specified point is inside the game canvas area.
	 * 
	 * @param {number} x - The x coordinate on the canvas area.
	 * @param {number} y - The y coordinate on the canvas area.
	 * @returns {boolean} True if the specified point is inside the game canvas area.
	 * @param x 
	 * @param y 
	 * @return  
	 */
	function isInsideCanvas(x : number, y : number): boolean;
		
	/**
	 * Shows the game screen.
	 */
	function showScreen(): void;
		
	/**
	 * Hides the game screen.
	 */
	function hideScreen(): void;
		
	/**
	 * Changes the size of the game screen.
	 * 
	 * @param {number} width - The width of the game screen.
	 * @param {number} height - The height of the game screen.
	 * @param width 
	 * @param height 
	 */
	function resize(width : number, height : number): void;
		
	/**
	 * 
	 */
	function _createAllElements(): void;
		
	/**
	 * 
	 */
	function _updateAllElements(): void;
		
	/**
	 * 
	 * @param deltaTime 
	 */
	function _onTick(deltaTime : any): void;
		
	/**
	 * 
	 * @return  
	 */
	function _canRender(): boolean;
		
	/**
	 * 
	 */
	function _updateRealScale(): void;
		
	/**
	 * 
	 */
	function _stretchWidth(): void;
		
	/**
	 * 
	 * @return  
	 */
	function _stretchHeight(): number;
		
	/**
	 * 
	 * @param name 
	 * @param message 
	 */
	function _makeErrorHtml(name : string, message : string): void;
		
	/**
	 * 
	 * @return  
	 */
	function _defaultStretchMode(): boolean;
		
	/**
	 * 
	 */
	function _createErrorPrinter(): void;
		
	/**
	 * 
	 */
	function _updateErrorPrinter(): void;
		
	/**
	 * 
	 */
	function _createCanvas(): void;
		
	/**
	 * 
	 */
	function _updateCanvas(): void;
		
	/**
	 * 
	 */
	function _updateVideo(): void;
		
	/**
	 * 
	 */
	function _createLoadingSpinner(): void;
		
	/**
	 * 
	 */
	function _createFPSCounter(): void;
		
	/**
	 * 
	 * @param element 
	 */
	function _centerElement(element : any): void;
		
	/**
	 * 
	 */
	function _disableContextMenu(): void;
		
	/**
	 * 
	 */
	function _applyCanvasFilter(): void;
		
	/**
	 * 
	 */
	function _clearCanvasFilter(): void;
		
	/**
	 * 
	 */
	function _setupEventHandlers(): void;
		
	/**
	 * 
	 */
	function _onWindowResize(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onKeyDown(event : any): void;
		
	/**
	 * 
	 */
	function _switchFPSCounter(): void;
		
	/**
	 * 
	 */
	function _switchStretchMode(): void;
		
	/**
	 * 
	 */
	function _switchFullScreen(): void;
		
	/**
	 * 
	 */
	function _isFullScreen(): void;
		
	/**
	 * 
	 */
	function _requestFullScreen(): void;
		
	/**
	 * 
	 */
	function _cancelFullScreen(): void;
		
	/**
	 * 
	 */
	function _createPixiApp(): void;
		
	/**
	 * 
	 */
	function _setupPixi(): void;
		
	/**
	 * 
	 */
	function _createEffekseerContext(): void;
	
	/**
	 * 
	 */
	interface FPSCounter {
				
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
		startTick(): void;
				
		/**
		 * 
		 */
		endTick(): void;
				
		/**
		 * 
		 */
		switchMode(): void;
				
		/**
		 * 
		 */
		_createElements(): void;
				
		/**
		 * 
		 */
		_update(): void;
				
		/**
		 * 
		 */
		_tickCount : number;
				
		/**
		 * 
		 */
		_frameTime : number;
				
		/**
		 * 
		 */
		_frameStart : number;
				
		/**
		 * 
		 */
		_lastLoop : number;
				
		/**
		 * 
		 */
		_showFps : boolean;
				
		/**
		 * 
		 */
		fps : number;
				
		/**
		 * 
		 */
		duration : number;
	}
}

/**
 * The point class.
 * 
 * @class
 * @extends PIXI.Point
 * @param {number} x - The x coordinate.
 * @param {number} y - The y coordinate.
 */
declare interface Point {
		
	/**
	 * 
	 * @return  
	 */
	new (): Point;
}



/**
 * The basic object that represents an image.
 * 
 * @class
 * @param {number} width - The width of the bitmap.
 * @param {number} height - The height of the bitmap.
 */
declare interface Bitmap {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param width 
	 * @param height 
	 */
	initialize(width : any, height : any): void;
		
	/**
	 * Checks whether the tileset is ready to render.
	 * 
	 * @type boolean
	 * @returns {boolean} True if the tilemap is ready.
	 * @return  
	 */
	isReady(): boolean;
		
	/**
	 * Checks whether a loading error has occurred.
	 * 
	 * @returns {boolean} True if a loading error has occurred.
	 * @return  
	 */
	isError(): boolean;
		
	/**
	 * Destroys the stage.
	 */
	destroy(): void;
		
	/**
	 * Resizes the bitmap.
	 * 
	 * @param {number} width - The new width of the bitmap.
	 * @param {number} height - The new height of the bitmap.
	 * @param width 
	 * @param height 
	 */
	resize(width : number, height : number): void;
		
	/**
	 * Performs a block transfer.
	 * 
	 * @param {Bitmap} source - The bitmap to draw.
	 * @param {number} sx - The x coordinate in the source.
	 * @param {number} sy - The y coordinate in the source.
	 * @param {number} sw - The width of the source image.
	 * @param {number} sh - The height of the source image.
	 * @param {number} dx - The x coordinate in the destination.
	 * @param {number} dy - The y coordinate in the destination.
	 * @param {number} [dw=sw] The width to draw the image in the destination.
	 * @param {number} [dh=sh] The height to draw the image in the destination.
	 * @param source 
	 * @param sx 
	 * @param sy 
	 * @param sw 
	 * @param sh 
	 * @param dx 
	 * @param dy 
	 * @param dw? 
	 * @param dh? 
	 */
	blt(source : Bitmap, sx : number, sy : number, sw : number, sh : number, dx : number, dy : number, dw? : number, dh? : number): void;
		
	/**
	 * Returns pixel color at the specified point.
	 * 
	 * @param {number} x - The x coordinate of the pixel in the bitmap.
	 * @param {number} y - The y coordinate of the pixel in the bitmap.
	 * @returns {string} The pixel color (hex format).
	 * @param x 
	 * @param y 
	 * @return  
	 */
	getPixel(x : number, y : number): string;
		
	/**
	 * Returns alpha pixel value at the specified point.
	 * 
	 * @param {number} x - The x coordinate of the pixel in the bitmap.
	 * @param {number} y - The y coordinate of the pixel in the bitmap.
	 * @returns {string} The alpha value.
	 * @param x 
	 * @param y 
	 * @return  
	 */
	getAlphaPixel(x : number, y : number): string;
		
	/**
	 * Clears the specified rectangle.
	 * 
	 * @param {number} x - The x coordinate for the upper-left corner.
	 * @param {number} y - The y coordinate for the upper-left corner.
	 * @param {number} width - The width of the rectangle to clear.
	 * @param {number} height - The height of the rectangle to clear.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	clearRect(x : number, y : number, width : number, height : number): void;
		
	/**
	 * Clears the entire bitmap.
	 */
	clear(): void;
		
	/**
	 * Fills the specified rectangle.
	 * 
	 * @param {number} x - The x coordinate for the upper-left corner.
	 * @param {number} y - The y coordinate for the upper-left corner.
	 * @param {number} width - The width of the rectangle to fill.
	 * @param {number} height - The height of the rectangle to fill.
	 * @param {string} color - The color of the rectangle in CSS format.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 * @param color 
	 */
	fillRect(x : number, y : number, width : number, height : number, color : string): void;
		
	/**
	 * Fills the entire bitmap.
	 * 
	 * @param {string} color - The color of the rectangle in CSS format.
	 * @param color 
	 */
	fillAll(color : string): void;
		
	/**
	 * Draws the specified rectangular frame.
	 * 
	 * @param {number} x - The x coordinate for the upper-left corner.
	 * @param {number} y - The y coordinate for the upper-left corner.
	 * @param {number} width - The width of the rectangle to fill.
	 * @param {number} height - The height of the rectangle to fill.
	 * @param {string} color - The color of the rectangle in CSS format.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 * @param color 
	 */
	strokeRect(x : number, y : number, width : number, height : number, color : string): void;
		
	/**
	 * Draws the rectangle with a gradation.
	 * 
	 * @param {number} x - The x coordinate for the upper-left corner.
	 * @param {number} y - The y coordinate for the upper-left corner.
	 * @param {number} width - The width of the rectangle to fill.
	 * @param {number} height - The height of the rectangle to fill.
	 * @param {string} color1 - The gradient starting color.
	 * @param {string} color2 - The gradient ending color.
	 * @param {boolean} vertical - Whether the gradient should be draw as vertical or not.
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 * @param color1 
	 * @param color2 
	 * @param vertical 
	 */
	gradientFillRect(x : number, y : number, width : number, height : number, color1 : string, color2 : string, vertical : boolean): void;
		
	/**
	 * Draws a bitmap in the shape of a circle.
	 * 
	 * @param {number} x - The x coordinate based on the circle center.
	 * @param {number} y - The y coordinate based on the circle center.
	 * @param {number} radius - The radius of the circle.
	 * @param {string} color - The color of the circle in CSS format.
	 * @param x 
	 * @param y 
	 * @param radius 
	 * @param color 
	 */
	drawCircle(x : number, y : number, radius : number, color : string): void;
		
	/**
	 * Draws the outline text to the bitmap.
	 * 
	 * @param {string} text - The text that will be drawn.
	 * @param {number} x - The x coordinate for the left of the text.
	 * @param {number} y - The y coordinate for the top of the text.
	 * @param {number} maxWidth - The maximum allowed width of the text.
	 * @param {number} lineHeight - The height of the text line.
	 * @param {string} align - The alignment of the text.
	 * @param text 
	 * @param x 
	 * @param y 
	 * @param maxWidth 
	 * @param lineHeight 
	 * @param align 
	 */
	drawText(text : string, x : number, y : number, maxWidth : number, lineHeight : number, align : string): void;
		
	/**
	 * Returns the width of the specified text.
	 * 
	 * @param {string} text - The text to be measured.
	 * @returns {number} The width of the text in pixels.
	 * @param text 
	 * @return  
	 */
	measureTextWidth(text : string): number;
		
	/**
	 * Adds a callback function that will be called when the bitmap is loaded.
	 * 
	 * @param {function} listner - The callback function.
	 * @param listner 
	 */
	addLoadListener(listner : () => void): void;
		
	/**
	 * Tries to load the image again.
	 */
	retry(): void;
		
	/**
	 * 
	 * @return  
	 */
	_makeFontNameText(): string;
		
	/**
	 * 
	 * @param text 
	 * @param tx 
	 * @param ty 
	 * @param maxWidth 
	 */
	_drawTextOutline(text : string, tx : number, ty : number, maxWidth : number): void;
		
	/**
	 * 
	 * @param text 
	 * @param tx 
	 * @param ty 
	 * @param maxWidth 
	 */
	_drawTextBody(text : string, tx : number, ty : number, maxWidth : number): void;
		
	/**
	 * 
	 * @param width 
	 * @param height 
	 */
	_createCanvas(width : number, height : number): void;
		
	/**
	 * 
	 */
	_ensureCanvas(): void;
		
	/**
	 * 
	 */
	_destroyCanvas(): void;
		
	/**
	 * 
	 * @param source 
	 */
	_createBaseTexture(source : any): void;
		
	/**
	 * 
	 */
	_updateScaleMode(): void;
		
	/**
	 * 
	 */
	_startLoading(): void;
		
	/**
	 * 
	 */
	_startDecrypting(): void;
		
	/**
	 * 
	 * @param xhr 
	 */
	_onXhrLoad(xhr : /* Bitmap.prototype._onXhrLoad0 */ any): void;
		
	/**
	 * 
	 */
	_onLoad(): void;
		
	/**
	 * 
	 */
	_callLoadListeners(): void;
		
	/**
	 * 
	 */
	_onError(): void;
		
	/**
	 * Loads a image file.
	 * 
	 * @param {string} url - The image url of the texture.
	 * @returns {Bitmap} The new bitmap object.
	 * @param url 
	 * @return  
	 */
	load(url : string): /* Bitmap.+Bitmap */ any;
		
	/**
	 * Takes a snapshot of the game screen.
	 * 
	 * @param {Stage} stage - The stage object.
	 * @returns {Bitmap} The new bitmap object.
	 * @param stage 
	 * @return  
	 */
	snap(stage : () => void): Bitmap;
		
	/**
	 * 
	 */
	_url : string;
		
	/**
	 * 
	 */
	_paintOpacity : number;
		
	/**
	 * 
	 */
	_smooth : boolean;
		
	/**
	 * 
	 */
	_loadListeners : Array<() => void>;
		
	/**
	 * 
	 */
	_loadingState : string;
		
	/**
	 * 
	 */
	fontFace : string;
		
	/**
	 * 
	 */
	fontBold : boolean;
		
	/**
	 * 
	 */
	fontItalic : boolean;
		
	/**
	 * 
	 */
	textColor : string;
		
	/**
	 * 
	 */
	outlineColor : string;
		
	/**
	 * 
	 */
	outlineWidth : number;
}


/**
 * The tilemap which displays 2D tile-based game map.
 * 
 * @class
 * @extends PIXI.Container
 */
declare interface Tilemap {
		
	/**
	 * 
	 * @return  
	 */
	new (): Tilemap;
}


/**
 * 
 */
declare namespace Tilemap{
		
	/**
	 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	 * Tile type checkers
	 */
	export var TILE_ID_B : number;
		
	/**
	 * 
	 */
	export var TILE_ID_C : number;
		
	/**
	 * 
	 */
	export var TILE_ID_D : number;
		
	/**
	 * 
	 */
	export var TILE_ID_E : number;
		
	/**
	 * 
	 */
	export var TILE_ID_A5 : number;
		
	/**
	 * 
	 */
	export var TILE_ID_A1 : number;
		
	/**
	 * 
	 */
	export var TILE_ID_A2 : number;
		
	/**
	 * 
	 */
	export var TILE_ID_A3 : number;
		
	/**
	 * 
	 */
	export var TILE_ID_A4 : number;
		
	/**
	 * 
	 */
	export var TILE_ID_MAX : number;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isVisibleTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isAutotile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function getAutotileKind(tileId : any): number;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function getAutotileShape(tileId : any): number;
		
	/**
	 * 
	 * @param kind 
	 * @param shape 
	 */
	function makeAutotileId(kind : any, shape : any): void;
		
	/**
	 * 
	 * @param tileID1 
	 * @param tileID2 
	 * @return  
	 */
	function isSameKindTile(tileID1 : any, tileID2 : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isTileA1(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isTileA2(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isTileA3(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isTileA4(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isTileA5(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWaterTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWaterfallTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isGroundTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isShadowingTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isRoofTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWallTopTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWallSideTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWallTile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isFloorTypeAutotile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWallTypeAutotile(tileId : any): boolean;
		
	/**
	 * 
	 * @param tileId 
	 * @return  
	 */
	function isWaterfallTypeAutotile(tileId : any): boolean;
		
	/**
	 * prettier-ignore
	 */
	export var FLOOR_AUTOTILE_TABLE : Array<Tilemap.FLOOR_AUTOTILE_TABLEI>;
		
	/**
	 * prettier-ignore
	 */
	export var WALL_AUTOTILE_TABLE : Array<Tilemap.WALL_AUTOTILE_TABLEI>;
		
	/**
	 * prettier-ignore
	 */
	export var WATERFALL_AUTOTILE_TABLE : Array<Array<Array</* number],[number],[number],[number]],[[number],[number],[number],[number]],[[number],[number],[number],[number]],[[number],[number],[number],[number */ any>>>;
	
	/**
	 * :::::::::::::::::::::::::::::::::::::::::::::::::::::::::
	 * Internal classes
	 */
	interface Layer {
				
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
		destroy(): void;
				
		/**
		 * Sets the bitmaps used as a tileset.
		 * 
		 * @param {array} bitmaps - The array of the tileset bitmaps.
		 * @param bitmaps 
		 */
		setBitmaps(bitmaps : any): void;
				
		/**
		 * 
		 */
		clear(): void;
				
		/**
		 * 
		 * @param setNumber 
		 * @param sx 
		 * @param sy 
		 * @param dx 
		 * @param dy 
		 * @param w 
		 * @param h 
		 */
		addRect(setNumber : any, sx : any, sy : any, dx : any, dy : any, w : any, h : any): void;
				
		/**
		 * Renders the object using the WebGL renderer.
		 * 
		 * @param {PIXI.Renderer} renderer - The renderer.
		 * @param renderer 
		 */
		render(renderer : any): void;
				
		/**
		 * 
		 * @return  
		 */
		isReady(): boolean;
				
		/**
		 * 
		 */
		_createVao(): void;
				
		/**
		 * 
		 */
		_updateIndexBuffer(): void;
				
		/**
		 * 
		 */
		_updateVertexBuffer(): void;
				
		/**
		 * 
		 */
		MAX_GL_TEXTURES : number;
				
		/**
		 * 
		 */
		VERTEX_STRIDE : number;
	}
		
	/**
	 * 
	 */
	interface Renderer {
				
		/**
		 * 
		 * @return  
		 */
		new (): Renderer;
	}

}

/**
 * The sprite object for a tiling image.
 * 
 * @class
 * @extends PIXI.TilingSprite
 * @param {Bitmap} bitmap - The image for the tiling sprite.
 */
declare interface TilingSprite {
		
	/**
	 * 
	 * @return  
	 */
	new (): TilingSprite;
}


/**
 * The sprite which covers the entire game screen.
 * 
 * @class
 * @extends PIXI.Container
 */
declare interface ScreenSprite {
		
	/**
	 * 
	 * @return  
	 */
	new (): ScreenSprite;
}


/**
 * The window in the game.
 * 
 * @class
 * @extends PIXI.Container
 */
declare class Window extends PIXI.Container {
		
    public active: boolean;
    public backOpacity: number;
    public contents: Bitmap;
    public contentsBack: Bitmap;
    public contentsOpacity: number;
    public cursorVisible: boolean;
    public downArrowVisible: boolean;
    public frameVisible: boolean;
    public height: number;

    public readonly innerHeight: number;
    public readonly innerRect: Rectangle;
    public readonly innerWidth: number;

    public margin: number;
    public opacity: number;
    public openness: number;
    public origin: Point;
    public padding: number;
    public pause: boolean;
    public upArrowVisible: boolean;
    public width: number;
    public windowskin: Bitmap;

    constructor();

    public addChildToBack(child: PIXI.Container): PIXI.Container;
    public addInnerChild(child: PIXI.Container): PIXI.Container;

    public destroy(): void;
    public drawShape(): void;

    public isClose():boolean;
    public isOpen(): boolean;

    public move(x: number, y: number, width: number, height: number): void;
    public moveCursorBy(x: number, y: number): void;
    public moveInnerChildrenBy(x: number, y: number): void;

    public setCursorRect(x: number, y: number, width: number, height: number): void;
    public setTone(r: number, g: number, b: number): void;

    public update(): void;
    public updateTransform(): void;
}


/**
 * The layer which contains game windows.
 * 
 * @class
 * @extends PIXI.Container
 */
declare interface WindowLayer {
		
	/**
	 * 
	 * @return  
	 */
	new (): WindowLayer;
}


/**
 * The weather effect which displays rain, storm, or snow.
 * 
 * @class
 * @extends PIXI.Container
 */
declare interface Weather {
		
	/**
	 * 
	 * @return  
	 */
	new (): Weather;
}


/**
 * The color filter for WebGL.
 * 
 * @class
 * @extends PIXI.Filter
 */
declare interface ColorFilter {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 */
	initialize(): void;
		
	/**
	 * Sets the hue rotation value.
	 * 
	 * @param {number} hue - The hue value (-360, 360).
	 * @param hue 
	 */
	setHue(hue : number): void;
		
	/**
	 * Sets the color tone.
	 * 
	 * @param {array} tone - The color tone [r, g, b, gray].
	 * @param tone 
	 */
	setColorTone(tone : ColorFilter.prototype.SetColorTone0): void;
		
	/**
	 * Sets the blend color.
	 * 
	 * @param {array} color - The blend color [r, g, b, a].
	 * @param color 
	 */
	setBlendColor(color : ColorFilter.prototype.SetBlendColor0): void;
		
	/**
	 * Sets the brightness.
	 * 
	 * @param {number} brightness - The brightness (0 to 255).
	 * @param brightness 
	 */
	setBrightness(brightness : number): void;
		
	/**
	 * 
	 * @return  
	 */
	_fragmentSrc(): string;
}

/**
 * The root object of the display tree.
 * 
 * @class
 * @extends PIXI.Container
 */
declare interface Stage {
		
	/**
	 * 
	 * @return  
	 */
	new (): Stage;
}


/**
 * The audio object of Web Audio API.
 * 
 * @class
 * @param {string} url - The url of the audio file.
 */
declare interface WebAudio {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * Initializes the audio system.
	 * 
	 * @returns {boolean} True if the audio system is available.
	 * @return  
	 */
	initialize(): boolean;
		
	/**
	 * Clears the audio data.
	 */
	clear(): void;
		
	/**
	 * Checks whether the audio data is ready to play.
	 * 
	 * @returns {boolean} True if the audio data is ready to play.
	 * @return  
	 */
	isReady(): /* !this._buffers */ any;
		
	/**
	 * Checks whether a loading error has occurred.
	 * 
	 * @returns {boolean} True if a loading error has occurred.
	 * @return  
	 */
	isError(): /* !this._isError */ any;
		
	/**
	 * Checks whether the audio is playing.
	 * 
	 * @returns {boolean} True if the audio is playing.
	 * @return  
	 */
	isPlaying(): /* !this._isPlaying */ any;
		
	/**
	 * Plays the audio.
	 * 
	 * @param {boolean} loop - Whether the audio data play in a loop.
	 * @param {number} offset - The start position to play in seconds.
	 * @param loop 
	 * @param offset 
	 */
	play(loop : boolean, offset : number): void;
		
	/**
	 * Stops the audio.
	 */
	stop(): void;
		
	/**
	 * Destroys the audio.
	 */
	destroy(): void;
		
	/**
	 * Performs the audio fade-in.
	 * 
	 * @param {number} duration - Fade-in time in seconds.
	 * @param duration 
	 */
	fadeIn(duration : number): void;
		
	/**
	 * Performs the audio fade-out.
	 * 
	 * @param {number} duration - Fade-out time in seconds.
	 * @param duration 
	 */
	fadeOut(duration : number): void;
		
	/**
	 * Gets the seek position of the audio.
	 * @return  
	 */
	seek(): number;
		
	/**
	 * Adds a callback function that will be called when the audio data is loaded.
	 * 
	 * @param {function} listner - The callback function.
	 * @param listner 
	 */
	addLoadListener(listner : WebAudio.prototype.AddLoadListener0): void;
		
	/**
	 * Adds a callback function that will be called when the playback is stopped.
	 * 
	 * @param {function} listner - The callback function.
	 * @param listner 
	 */
	addStopListener(listner : () => void): void;
		
	/**
	 * Tries to load the audio again.
	 */
	retry(): void;
		
	/**
	 * 
	 */
	_startLoading(): void;
		
	/**
	 * 
	 * @return  
	 */
	_shouldUseDecoder(): boolean;
		
	/**
	 * 
	 */
	_createDecoder(): void;
		
	/**
	 * 
	 */
	_destroyDecoder(): void;
		
	/**
	 * 
	 * @return  
	 */
	_realUrl(): string;
		
	/**
	 * 
	 * @param url 
	 */
	_startXhrLoading(url : string): void;
		
	/**
	 * 
	 * @param url 
	 */
	_startFetching(url : string): void;
		
	/**
	 * 
	 * @param xhr 
	 */
	_onXhrLoad(xhr : /* WebAudio.prototype._onXhrLoad0 */ any): void;
		
	/**
	 * 
	 * @param response 
	 */
	_onFetch(response : any): void;
		
	/**
	 * 
	 */
	_onError(): void;
		
	/**
	 * 
	 * @param value 
	 */
	_onFetchProcess(value : any): void;
		
	/**
	 * 
	 */
	_updateBufferOnFetch(): void;
		
	/**
	 * 
	 */
	_concatenateFetchedData(): void;
		
	/**
	 * 
	 */
	_updateBuffer(): void;
		
	/**
	 * 
	 * @return  
	 */
	_readableBuffer(): /* !this._data.buffer */ any;
		
	/**
	 * 
	 * @param arrayBuffer 
	 */
	_decodeAudioData(arrayBuffer : ArrayBuffer): void;
		
	/**
	 * 
	 * @param buffer 
	 */
	_onDecode(buffer : any): void;
		
	/**
	 * 
	 */
	_refreshSourceNode(): void;
		
	/**
	 * 
	 * @param offset 
	 */
	_startPlaying(offset : number): void;
		
	/**
	 * 
	 */
	_startAllSourceNodes(): void;
		
	/**
	 * 
	 * @param index 
	 */
	_startSourceNode(index : number): void;
		
	/**
	 * 
	 */
	_stopSourceNode(): void;
		
	/**
	 * 
	 */
	_createPannerNode(): void;
		
	/**
	 * 
	 */
	_createGainNode(): void;
		
	/**
	 * 
	 */
	_createAllSourceNodes(): void;
		
	/**
	 * 
	 * @param index 
	 */
	_createSourceNode(index : number): void;
		
	/**
	 * 
	 */
	_removeNodes(): void;
		
	/**
	 * 
	 */
	_createEndTimer(): void;
		
	/**
	 * 
	 */
	_removeEndTimer(): void;
		
	/**
	 * 
	 */
	_updatePanner(): void;
		
	/**
	 * 
	 */
	_onLoad(): void;
		
	/**
	 * 
	 * @param arrayBuffer 
	 */
	_readLoopComments(arrayBuffer : ArrayBuffer): void;
		
	/**
	 * 
	 * @param view 
	 * @param index 
	 * @param size 
	 */
	_readMetaData(view : DataView, index : number, size : number): void;
		
	/**
	 * 
	 * @param view 
	 * @param index 
	 * @return  
	 */
	_readFourCharacters(view : DataView, index : number): string;
		
	/**
	 * 
	 */
	_masterVolume : number;
		
	/**
	 * Sets the master volume for all audio.
	 * 
	 * @param {number} value - The master volume (0 to 1).
	 * @param value 
	 */
	setMasterVolume(value : number): void;
		
	/**
	 * 
	 */
	_createContext(): void;
		
	/**
	 * 
	 * @return  
	 */
	_currentTime(): /* !this._context.currentTime */ any;
		
	/**
	 * 
	 */
	_createMasterGainNode(): void;
		
	/**
	 * 
	 */
	_setupEventHandlers(): void;
		
	/**
	 * 
	 */
	_onUserGesture(): void;
		
	/**
	 * 
	 */
	_onVisibilityChange(): void;
		
	/**
	 * 
	 */
	_onHide(): void;
		
	/**
	 * 
	 */
	_onShow(): void;
		
	/**
	 * 
	 * @return  
	 */
	_shouldMuteOnHide(): boolean;
		
	/**
	 * 
	 */
	_resetVolume(): void;
		
	/**
	 * 
	 * @param duration 
	 */
	_fadeIn(duration : number): void;
		
	/**
	 * 
	 * @param duration 
	 */
	_fadeOut(duration : number): void;
}

/**
 * The static class that handles video playback.
 * 
 * @namespace
 */
declare interface Video {
		
	/**
	 * 
	 * @return  
	 */
	new (): Video;
}


/**
 * 
 */
declare namespace Video{
		
	/**
	 * Initializes the video system.
	 * 
	 * @param {number} width - The width of the video.
	 * @param {number} height - The height of the video.
	 * @param width 
	 * @param height 
	 */
	function initialize(width : number, height : number): void;
		
	/**
	 * 
	 */
	export var _loading : boolean;
		
	/**
	 * 
	 */
	export var _volume : number;
		
	/**
	 * Changes the display size of the video.
	 * 
	 * @param {number} width - The width of the video.
	 * @param {number} height - The height of the video.
	 * @param width 
	 * @param height 
	 */
	function resize(width : number, height : number): void;
		
	/**
	 * Starts playback of a video.
	 * 
	 * @param {string} src - The url of the video.
	 * @param src 
	 */
	function play(src : string): void;
		
	/**
	 * Checks whether the video is playing.
	 * 
	 * @returns {boolean} True if the video is playing.
	 * @return  
	 */
	function isPlaying(): /* !this._loading */ any;
		
	/**
	 * Sets the volume for videos.
	 * 
	 * @param {number} volume - The volume for videos (0 to 1).
	 * @param volume 
	 */
	function setVolume(volume : number): void;
		
	/**
	 * 
	 */
	function _createElement(): void;
		
	/**
	 * 
	 */
	function _onLoad(): void;
		
	/**
	 * 
	 */
	function _onError(): void;
		
	/**
	 * 
	 */
	function _onEnd(): void;
		
	/**
	 * 
	 * @param videoVisible 
	 */
	function _updateVisibility(videoVisible : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	function _isVisible(): boolean;
		
	/**
	 * 
	 */
	function _setupEventHandlers(): void;
		
	/**
	 * 
	 */
	function _onUserGesture(): void;
}

/**
 * The static class that handles input data from the keyboard and gamepads.
 * 
 * @namespace
 */
declare interface Input {
		
	/**
	 * 
	 * @return  
	 */
	new (): Input;
}


/**
 * 
 */
declare namespace Input{
		
	/**
	 * Initializes the input system.
	 */
	function initialize(): void;
		
	/**
	 * The wait time of the key repeat in frames.
	 * 
	 * @type number
	 */
	export var keyRepeatWait : number;
		
	/**
	 * The interval of the key repeat in frames.
	 * 
	 * @type number
	 */
	export var keyRepeatInterval : number;
	
	/**
	 * A hash table to convert from a virtual key code to a mapped key name.
	 * 
	 * @type Object
	 */
	var keyMapper : {
	}
	
	/**
	 * A hash table to convert from a gamepad button to a mapped key name.
	 * 
	 * @type Object
	 */
	var gamepadMapper : {
	}
		
	/**
	 * Clears all the input data.
	 */
	function clear(): void;
	
	/**
	 * 
	 */
	namespace _currentState{
	}
	
	/**
	 * 
	 */
	namespace _previousState{
	}
		
	/**
	 * 
	 */
	export var _gamepadStates : Array</* Input._gamepadStatesI */ any>;
		
	/**
	 * 
	 */
	export var _pressedTime : number;
		
	/**
	 * 
	 */
	export var dir4 : number;
		
	/**
	 * 
	 */
	export var dir8 : number;
		
	/**
	 * 
	 */
	export var _preferredAxis : string;
		
	/**
	 * 
	 */
	export var _date : number;
		
	/**
	 * Updates the input data.
	 */
	function update(): void;
		
	/**
	 * Checks whether a key is currently pressed down.
	 * 
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is pressed.
	 * @param keyName 
	 * @return  
	 */
	function isPressed(keyName : string): boolean;
		
	/**
	 * Checks whether a key is just pressed.
	 * 
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is triggered.
	 * @param keyName 
	 * @return  
	 */
	function isTriggered(keyName : string): boolean;
		
	/**
	 * Checks whether a key is just pressed or a key repeat occurred.
	 * 
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is repeated.
	 * @param keyName 
	 * @return  
	 */
	function isRepeated(keyName : string): boolean;
		
	/**
	 * Checks whether a key is kept depressed.
	 * 
	 * @param {string} keyName - The mapped name of the key.
	 * @returns {boolean} True if the key is long-pressed.
	 * @param keyName 
	 * @return  
	 */
	function isLongPressed(keyName : string): boolean;
		
	/**
	 * 
	 * @param buttonName 
	 */
	function virtualClick(buttonName : any): void;
		
	/**
	 * 
	 */
	function _setupEventHandlers(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onKeyDown(event : any): void;
		
	/**
	 * 
	 * @param keyCode 
	 * @return  
	 */
	function _shouldPreventDefault(keyCode : any): boolean;
		
	/**
	 * 
	 * @param event 
	 */
	function _onKeyUp(event : any): void;
		
	/**
	 * 
	 */
	function _onLostFocus(): void;
		
	/**
	 * 
	 */
	function _pollGamepads(): void;
		
	/**
	 * 
	 * @param gamepad 
	 */
	function _updateGamepadState(gamepad : any): void;
		
	/**
	 * 
	 */
	function _updateDirection(): void;
		
	/**
	 * 
	 * @return  
	 */
	function _signX(): number;
		
	/**
	 * 
	 * @return  
	 */
	function _signY(): number;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @return  
	 */
	function _makeNumpadDirection(x : number, y : number): number;
		
	/**
	 * 
	 * @param keyName 
	 * @return  
	 */
	function _isEscapeCompatible(keyName : string): boolean;
}

/**
 * The static class that handles input data from the mouse and touchscreen.
 * 
 * @namespace
 */
declare interface TouchInput {
		
	/**
	 * 
	 * @return  
	 */
	new (): TouchInput;
}


/**
 * 
 */
declare namespace TouchInput{
		
	/**
	 * Initializes the touch system.
	 */
	function initialize(): void;
		
	/**
	 * The wait time of the pseudo key repeat in frames.
	 * 
	 * @type number
	 */
	export var keyRepeatWait : number;
		
	/**
	 * The interval of the pseudo key repeat in frames.
	 * 
	 * @type number
	 */
	export var keyRepeatInterval : number;
		
	/**
	 * The threshold number of pixels to treat as moved.
	 * 
	 * @type number
	 */
	export var moveThreshold : number;
		
	/**
	 * Clears all the touch data.
	 */
	function clear(): void;
		
	/**
	 * 
	 */
	export var _mousePressed : boolean;
		
	/**
	 * 
	 */
	export var _screenPressed : boolean;
		
	/**
	 * 
	 */
	export var _pressedTime : number;
		
	/**
	 * 
	 */
	export var _clicked : boolean;
	
	/**
	 * 
	 */
	namespace _newState{
				
		/**
		 * 
		 */
		export var triggered : boolean;
				
		/**
		 * 
		 */
		export var cancelled : boolean;
				
		/**
		 * 
		 */
		export var moved : boolean;
				
		/**
		 * 
		 */
		export var hovered : boolean;
				
		/**
		 * 
		 */
		export var released : boolean;
				
		/**
		 * 
		 */
		export var wheelX : number;
				
		/**
		 * 
		 */
		export var wheelY : number;
	}
		
	/**
	 * 
	 */
	export var _x : number;
		
	/**
	 * 
	 */
	export var _y : number;
		
	/**
	 * 
	 */
	export var _triggerX : number;
		
	/**
	 * 
	 */
	export var _triggerY : number;
		
	/**
	 * 
	 */
	export var _moved : boolean;
		
	/**
	 * 
	 */
	export var _date : number;
		
	/**
	 * Updates the touch data.
	 */
	function update(): void;
		
	/**
	 * Checks whether the mouse button or touchscreen has been pressed and
	 * released at the same position.
	 * 
	 * @returns {boolean} True if the mouse button or touchscreen is clicked.
	 * @return  
	 */
	function isClicked(): /* !this._clicked */ any;
		
	/**
	 * Checks whether the mouse button or touchscreen is currently pressed down.
	 * 
	 * @returns {boolean} True if the mouse button or touchscreen is pressed.
	 * @return  
	 */
	function isPressed(): /* !this._mousePressed */ any;
		
	/**
	 * Checks whether the left mouse button or touchscreen is just pressed.
	 * 
	 * @returns {boolean} True if the mouse button or touchscreen is triggered.
	 * @return  
	 */
	function isTriggered(): /* !this._currentState.triggered */ any;
		
	/**
	 * Checks whether the left mouse button or touchscreen is just pressed
	 * or a pseudo key repeat occurred.
	 * 
	 * @returns {boolean} True if the mouse button or touchscreen is repeated.
	 * @return  
	 */
	function isRepeated(): /* !this._currentState.triggered */ any;
		
	/**
	 * Checks whether the left mouse button or touchscreen is kept depressed.
	 * 
	 * @returns {boolean} True if the left mouse button or touchscreen is long-pressed.
	 * @return  
	 */
	function isLongPressed(): boolean;
		
	/**
	 * Checks whether the right mouse button is just pressed.
	 * 
	 * @returns {boolean} True if the right mouse button is just pressed.
	 * @return  
	 */
	function isCancelled(): /* !this._currentState.cancelled */ any;
		
	/**
	 * Checks whether the mouse or a finger on the touchscreen is moved.
	 * 
	 * @returns {boolean} True if the mouse or a finger on the touchscreen is moved.
	 * @return  
	 */
	function isMoved(): /* !this._currentState.moved */ any;
		
	/**
	 * Checks whether the mouse is moved without pressing a button.
	 * 
	 * @returns {boolean} True if the mouse is hovered.
	 * @return  
	 */
	function isHovered(): /* !this._currentState.hovered */ any;
		
	/**
	 * Checks whether the left mouse button or touchscreen is released.
	 * 
	 * @returns {boolean} True if the mouse button or touchscreen is released.
	 * @return  
	 */
	function isReleased(): /* !this._currentState.released */ any;
		
	/**
	 * 
	 * @return  
	 */
	function _createNewState(): /* TouchInput._newState */ any;
		
	/**
	 * 
	 */
	function _setupEventHandlers(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onMouseDown(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onLeftButtonDown(event : any): void;
		
	/**
	 * 
	 */
	function _onMiddleButtonDown(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onRightButtonDown(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onMouseMove(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onMouseUp(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onWheel(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onTouchStart(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onTouchMove(event : any): void;
		
	/**
	 * 
	 * @param event 
	 */
	function _onTouchEnd(event : any): void;
		
	/**
	 * 
	 */
	function _onTouchCancel(): void;
		
	/**
	 * 
	 */
	function _onLostFocus(): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	function _onTrigger(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	function _onCancel(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	function _onMove(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	function _onHover(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	function _onRelease(x : number, y : number): void;
}

/**
 * The static class that handles JSON with object information.
 * 
 * @namespace
 */
declare interface JsonEx {
		
	/**
	 * 
	 * @return  
	 */
	new (): JsonEx;
}


/**
 * 
 */
declare namespace JsonEx{
		
	/**
	 * The maximum depth of objects.
	 * 
	 * @type number
	 * @default 100
	 */
	export var maxDepth : number;
		
	/**
	 * Converts an object to a JSON string with object information.
	 * 
	 * @param {object} object - The object to be converted.
	 * @returns {string} The JSON string.
	 * @param object 
	 * @return  
	 */
	function stringify(object : JsonEx.Stringify0): string;
		
	/**
	 * Parses a JSON string and reconstructs the corresponding object.
	 * 
	 * @param {string} json - The JSON string.
	 * @returns {object} The reconstructed object.
	 * @param json 
	 * @return  
	 */
	function parse(json : string): any;
		
	/**
	 * Makes a deep copy of the specified object.
	 * 
	 * @param {object} object - The object to be copied.
	 * @returns {object} The copied object.
	 * @param object 
	 * @return  
	 */
	function makeDeepCopy(object : any): any;
		
	/**
	 * 
	 * @param value 
	 * @param depth 
	 * @return  
	 */
	function _encode(value : /* JsonEx.stringify.!0 */ any, depth : number): /* JsonEx._encodeRet */ any;
		
	/**
	 * 
	 * @param value 
	 * @return  
	 */
	function _decode(value : /* JsonEx._decode0 */ any): /* JsonEx._decode0 */ any;
}

