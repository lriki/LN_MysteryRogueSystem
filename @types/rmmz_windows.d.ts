import * as PIXI from "pixi.js";


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

	_clientArea: Sprite;

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


declare namespace Window_Base{
	interface TextSizeExRet {
		width : number;
		height : number;
	}
}
declare namespace Window_Base{
	interface CreateTextStateRet {
		text : string;
		index : number;
		width : number;
		buffer : string;
		drawing : boolean;
		outputWidth : number;
		outputHeight : number;
	}
}


declare global {
	
/**
 * -----------------------------------------------------------------------------
 * Window_Base
 * 
 * The superclass of all windows within the game.
 */
export class Window_Base extends Window {
		
	/**
	 * 
	 * @param rect 
	 */
	constructor(rect : /* Window_Base.prototype.+Window_NumberInput */ any);
		
	/**
	 * 
	 * @param options 
	 */
	//destroy(options : any): void;
		
	/**
	 * 
	 * @param rect 
	 */
	checkRectObject(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	lineHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemWidth(): /* !this.innerWidth */ any;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemPadding(): number;
		
	/**
	 * 
	 */
	baseTextRect(): Rectangle;
		
	/**
	 * 
	 */
	loadWindowskin(): void;
		
	/**
	 * 
	 */
	updatePadding(): void;
		
	/**
	 * 
	 */
	updateBackOpacity(): void;
		
	/**
	 * 
	 * @param numLines 
	 * @return  
	 */
	fittingHeight(numLines : number): number;
		
	/**
	 * 
	 */
	updateTone(): void;
		
	/**
	 * 
	 */
	createContents(): void;
		
	/**
	 * 
	 */
	destroyContents(): void;
		
	/**
	 * 
	 * @return  
	 */
	contentsWidth(): /* !this.innerWidth */ any;
		
	/**
	 * 
	 * @return  
	 */
	contentsHeight(): /* !this.innerHeight */ any;
		
	/**
	 * 
	 */
	resetFontSettings(): void;
		
	/**
	 * 
	 */
	resetTextColor(): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updateOpen(): void;
		
	/**
	 * 
	 */
	updateClose(): void;
		
	/**
	 * 
	 */
	open(): void;
		
	/**
	 * 
	 */
	close(): void;
		
	/**
	 * 
	 * @return  
	 */
	isOpening(): /* !this._opening */ any;
		
	/**
	 * 
	 * @return  
	 */
	isClosing(): /* !this._closing */ any;
		
	/**
	 * 
	 */
	show(): void;
		
	/**
	 * 
	 */
	hide(): void;
		
	/**
	 * 
	 */
	activate(): void;
		
	/**
	 * 
	 */
	deactivate(): void;
		
	/**
	 * 
	 * @return  
	 */
	systemColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	translucentOpacity(): number;
		
	/**
	 * 
	 * @param color 
	 */
	changeTextColor(color : string): void;
		
	/**
	 * 
	 * @param color 
	 */
	changeOutlineColor(color : string): void;
		
	/**
	 * 
	 * @param enabled 
	 */
	changePaintOpacity(enabled : boolean): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	drawRect(x : number, y : number, width : number, height : number): void;
		
	/**
	 * 
	 * @param text 
	 * @param x 
	 * @param y 
	 * @param maxWidth 
	 * @param align 
	 */
	drawText(text : number | string, x : number, y : number, maxWidth : number, align : string): void;
		
	/**
	 * 
	 * @param text 
	 * @return  
	 */
	textWidth(text : string): number;
		
	/**
	 * 
	 * @param text 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @return  
	 */
	drawTextEx(text : string, x : number, y : number, width : number): number;
		
	/**
	 * 
	 * @param text 
	 * @return  
	 */
	textSizeEx(text : string): Window_Base.TextSizeExRet;
		
	/**
	 * 
	 * @param text 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @return  
	 */
	createTextState(text : string, x : number, y : number, width : number): Window_Base.CreateTextStateRet;
		
	/**
	 * 
	 * @param textState 
	 */
	processAllText(textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 * @param textState 
	 */
	flushTextState(textState : /* Window_Base.prototype.createTextState.!ret */ any | {}): void;
		
	/**
	 * 
	 * @param rtl 
	 * @return  
	 */
	createTextBuffer(rtl : boolean): string;
		
	/**
	 * 
	 * @param text 
	 * @return  
	 */
	convertEscapeCharacters(text : string): string;
		
	/**
	 * 
	 * @param n 
	 * @return  
	 */
	actorName(n : number): string;
		
	/**
	 * 
	 * @param n 
	 * @return  
	 */
	partyMemberName(n : number): string;
		
	/**
	 * 
	 * @param textState 
	 */
	processCharacter(textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 * @param textState 
	 * @param c 
	 */
	processControlCharacter(textState : /* Window_Base.prototype.createTextState.!ret */ any, c : string): void;
		
	/**
	 * 
	 * @param textState 
	 */
	processNewLine(textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	obtainEscapeCode(textState : /* Window_Base.prototype.createTextState.!ret */ any): string;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	obtainEscapeParam(textState : {} | /* Window_Base.prototype.createTextState.!ret */ any): number;	
	/**
	 * 
	 */
	//obtainEscapeParam();
		
	/**
	 * 
	 * @param code 
	 * @param textState 
	 */
	processEscapeCharacter(code : string, textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 * @param colorIndex 
	 */
	processColorChange(colorIndex : number | string): void;
		
	/**
	 * 
	 * @param iconIndex 
	 * @param textState 
	 */
	processDrawIcon(iconIndex : number | string, textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 */
	makeFontBigger(): void;
		
	/**
	 * 
	 */
	makeFontSmaller(): void;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	calcTextHeight(textState: any): number;	
		
	/**
	 * 
	 * @param line 
	 * @return  
	 */
	maxFontSizeInLine(line : string): number;	
	/**
	 * 
	 */
	//maxFontSizeInLine();
		
	/**
	 * 
	 * @param iconIndex 
	 * @param x 
	 * @param y 
	 */
	drawIcon(iconIndex : number | string, x : string | number, y : number | string): void;
		
	/**
	 * prettier-ignore
	 * @param faceName 
	 * @param faceIndex 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	drawFace(faceName : string, faceIndex : number, x : number, y : number, width : number, height : number): void;
		
	/**
	 * prettier-ignore
	 * @param characterName 
	 * @param characterIndex 
	 * @param x 
	 * @param y 
	 */
	drawCharacter(characterName : string, characterIndex : number, x : number, y : number): void;
		
	/**
	 * 
	 * @param item 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawItemName(item : any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param value 
	 * @param unit 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawCurrencyValue(value : number, unit : any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param type 
	 */
	setBackgroundType(type : number): void;
		
	/**
	 * 
	 */
	showBackgroundDimmer(): void;
		
	/**
	 * 
	 */
	createDimmerSprite(): void;
		
	/**
	 * 
	 */
	hideBackgroundDimmer(): void;
		
	/**
	 * 
	 */
	updateBackgroundDimmer(): void;
		
	/**
	 * 
	 */
	refreshDimmerBitmap(): void;
		
	/**
	 * 
	 */
	playCursorSound(): void;
		
	/**
	 * 
	 */
	playOkSound(): void;
		
	/**
	 * 
	 */
	playBuzzerSound(): void;
}


}
