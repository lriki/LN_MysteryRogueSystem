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
}

}
