import * as PIXI from "pixi.js";

declare global {

/**
 * The rectangle class.
 * 
 * @class
 * @extends PIXI.Rectangle
 * @param {number} x - The x coordinate for the upper-left corner.
 * @param {number} y - The y coordinate for the upper-left corner.
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 */
export class Rectangle extends PIXI.Rectangle {
	constructor(x: number, y: number, width: number, height: number);
}


/**
 * The basic object that represents an image.
 * 
 * @class
 * @param {number} width - The width of the bitmap.
 * @param {number} height - The height of the bitmap.
 */
export class Bitmap {

    /**
     * 
     * @param width 
     * @param height 
     */
    constructor(width: number, height: number);

    public readonly url: string;
    public readonly baseTexture : PIXI.BaseTexture;
    public readonly image: HTMLImageElement;
    public readonly canvas: HTMLCanvasElement;
    public readonly context: CanvasRenderingContext2D;

    public readonly width: number;
    public readonly height: number;
    public readonly rect: Rectangle

    public smooth: boolean;

    public paintOpacity: number;

    public fontFace: string;
    public fontSize: number;
    public fontBold: boolean;
    public fontItalic: boolean;

    public textColor: string;

    public outlineColor: string;
    public outlineWidth: number;

    public static load(url: string): Bitmap;
    public static snap(stage: Stage): Bitmap;

	/**
	 * Checks whether a loading error has occurred.
	 * 
	 * @returns {boolean} True if a loading error has occurred.
	 * @return  
	 */
    public isError(): boolean;
    
	/**
	 * Checks whether the tileset is ready to render.
	 * 
	 * @type boolean
	 * @returns {boolean} True if the tilemap is ready.
	 * @return  
	 */
    public isReady(): boolean;

	/**
	 * Tries to load the image again.
	 */
    public retry(): void;

	/**
	 * Adds a callback function that will be called when the bitmap is loaded.
	 * 
	 * @param {function} listner - The callback function.
	 * @param listner 
	 */
    public addLoadListener(listener: (self: Bitmap) => void): void;

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
    public blt(source: Bitmap, sx: number, sy: number, sw: number, sh: number, dx: number,dy: number, dw: number, dh: number): void;

	/**
	 * Clears the entire bitmap.
	 */
    public clear(): void;
    
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
    public clearRect(x: number, y: number, width: number, height: number): void;

	/**
	 * Destroys the stage.
	 */
    public destroy(): void;

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
    public drawCircle(x: number, y: number, radius: number, color: number): void;
    
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
    public drawText(text: string | number, x: number, y: number, maxWidth: number, lineHeight:number, align: string): void;

	/**
	 * Fills the entire bitmap.
	 * 
	 * @param {string} color - The color of the rectangle in CSS format.
	 * @param color 
	 */
    public fillAll(color: string): void;
    
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
    public fillRect(x: number, y:number, width: number, height: number, color: string): void;

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
    public gradientFillRect(x: number, y: number, width: number, height: number, color1: string, color2: string, vertical: boolean): void;

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
    public getAlphaPixel(x:number, y: number): string;
    
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
    public getPixel(x: number, y: number): string;

	/**
	 * Returns the width of the specified text.
	 * 
	 * @param {string} text - The text to be measured.
	 * @returns {number} The width of the text in pixels.
	 * @param text 
	 * @return  
	 */
    public measureTextWidth(text: string): number;

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
    public strokeRect(x: number, y: number, width: number, height: number, color: string): void;

	/**
	 * Resizes the bitmap.
	 * 
	 * @param {number} width - The new width of the bitmap.
	 * @param {number} height - The new height of the bitmap.
	 * @param width 
	 * @param height 
	 */
    public resize(width: number, height: number): void;

}



export type RGBA = [number, number, number, number];

/**
 * The basic object that is rendered to the game screen.
 * 
 * @class
 * @extends PIXI.Sprite
 * @param {Bitmap} bitmap - The image for the sprite.
 */
export class Sprite extends PIXI.Sprite {

    bitmap: Bitmap;
    opacity: number;
	_counter : number;

    constructor(bitmap: Bitmap);

    getBlendColor(): RGBA
    getColorTone(): RGBA
    hide(): void;
    move(x: number, y: number): void;
    setBlendColor(color: RGBA): void
    setColorTone(tone: RGBA): void;
    setFrame(x: number, y: number, width: number, height: number): void;
    setHue(hue: number): void;
    show(): void;
    update(): void;
    updateVisibility(): void;

}

export class Tilemap extends PIXI.Container {

    public animationCount: number;
    public flags: number[];
    public height: number;
    public horizontalWrap: boolean;
    public origin: Point;
    public verticalWrap: boolean;
    public width: number;
    public _tileWidth: number;
	public _tileHeight: number;
	public _upperLayer: Tilemap.Layer;

    constructor();

    public destroy(): void;
    public isReady(): boolean;
    public setBitmaps(bitmaps: Bitmap[]): void;
    public setData(width: number, height: number, data: number[]): void;
    public update(): void;
	public updateTransform(): void;
	
	
	_addSpot(startX: number, startY: number, x: number, y: number): void;
	_readMapData(x: number, y: number, d: number): number;
	_addTile(layer: Tilemap.Layer, tileId: number, dx: number, dy: number): void;
}


export namespace Tilemap {

	class Layer extends PIXI.Container {

	}
}


export interface Array<T> {
	clone(): T[]; 
	equals(array: unknown[]): boolean;
	remove(element: T): T[];
}

export interface Math {
	randomInt(max: number): number;
}

export interface Number {
	clamp(min: number, max: number): number;
	mod(n: number): number;
	padZero(length: number): string;
}

export interface String {
	padZero(length: number): string;
	format(...args: any[]): string;
}

}
