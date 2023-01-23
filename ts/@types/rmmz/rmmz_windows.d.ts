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
	_contentsSprite: Sprite;
	_contentsBackSprite: Sprite;
	_container: PIXI.Container;
	_isWindow: boolean;;

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
		
	initialize(rect : Rectangle): void;

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

/**
 * -----------------------------------------------------------------------------
 * Window_Scrollable
 * 
 * The window class with scroll functions.
 */
 declare class Window_Scrollable extends Window_Base {
		
	/**
	 * 
	 * @param rect 
	 */
	constructor(rect : any);
		
	/**
	 * 
	 */
	clearScrollStatus(): void;
		
	/**
	 * 
	 * @return  
	 */
	//scrollX(): number;
		
	/**
	 * 
	 * @return  
	 */
	//scrollY(): number;
		
	/**
	 * 
	 * @return  
	 */
	scrollBaseX(): /* !this._scrollBaseX */ any;
		
	/**
	 * 
	 * @return  
	 */
	scrollBaseY(): /* !this._scrollBaseY */ any;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	scrollTo(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	scrollBy(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	smoothScrollTo(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	smoothScrollBy(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	setScrollAccel(x : number, y : number): void;
		
	/**
	 * 
	 * @return  
	 */
	overallWidth(): /* !this.innerWidth */ any;
		
	/**
	 * 
	 * @return  
	 */
	overallHeight(): /* !this.innerHeight */ any;
		
	/**
	 * 
	 * @return  
	 */
	maxScrollX(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxScrollY(): number;
		
	/**
	 * 
	 * @return  
	 */
	scrollBlockWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	scrollBlockHeight(): number;
		
	/**
	 * 
	 * @param n 
	 */
	smoothScrollDown(n : number): void;
		
	/**
	 * 
	 * @param n 
	 */
	smoothScrollUp(n : number): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	processWheelScroll(): void;
		
	/**
	 * 
	 */
	processTouchScroll(): void;
		
	/**
	 * 
	 * @return  
	 */
	isWheelScrollEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isTouchScrollEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isScrollEnabled(): boolean;
		
	/**
	 * 
	 */
	isTouchedInsideFrame(): void;
		
	/**
	 * 
	 */
	onTouchScrollStart(): void;
		
	/**
	 * 
	 */
	onTouchScroll(): void;
		
	/**
	 * 
	 */
	onTouchScrollEnd(): void;
		
	/**
	 * 
	 */
	updateSmoothScroll(): void;
		
	/**
	 * 
	 */
	updateScrollAccel(): void;
		
	/**
	 * 
	 */
	updateArrows(): void;
		
	/**
	 * 
	 */
	updateOrigin(): void;
		
	/**
	 * 
	 * @param baseX 
	 * @param baseY 
	 */
	updateScrollBase(baseX : number, baseY : number): void;
		
	/**
	 * 
	 */
	paint(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Selectable
 * 
 * The window class with cursor movement functions.
 */
 declare class Window_Selectable extends Window_Scrollable {
	
	/**
	 * 
	 * @param rect 
	 */
	constructor(rect : any);
		
	/**
	 * 
	 * @return  
	 */
	index(): /* !this._index */ any;
		
	/**
	 * 
	 * @return  
	 */
	cursorFixed(): /* !this._cursorFixed */ any;
		
	/**
	 * 
	 * @param cursorFixed 
	 */
	setCursorFixed(cursorFixed : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	cursorAll(): /* !this._cursorAll */ any;
		
	/**
	 * 
	 * @param cursorAll 
	 */
	setCursorAll(cursorAll : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	rowSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 */
	contentsHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxRows(): number;
		
	/**
	 * 
	 * @return  
	 */
	overallHeight(): number;
		
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
	 * @param index 
	 */
	select(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	forceSelect(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	smoothSelect(index : number): void;
		
	/**
	 * 
	 */
	deselect(): void;
		
	/**
	 * 
	 */
	reselect(): void;
		
	/**
	 * 
	 * @return  
	 */
	row(): number;
		
	/**
	 * 
	 * @return  
	 */
	topRow(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxTopRow(): number;
		
	/**
	 * 
	 * @param row 
	 */
	setTopRow(row : number): void;
		
	/**
	 * 
	 * @return  
	 */
	maxPageRows(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxPageItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxVisibleItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	isHorizontal(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	topIndex(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemRect(index : number): Window_Selectable.prototype.ItemRectRet;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemRectWithPadding(index : number): Window_Selectable.prototype.ItemRectWithPaddingRet;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemLineRect(index : number): Window_Selectable.prototype.ItemLineRectRet;
		
	/**
	 * 
	 * @param helpWindow 
	 */
	setHelpWindow(helpWindow : Window_Help): void;
		
	/**
	 * 
	 */
	showHelpWindow(): void;
		
	/**
	 * 
	 */
	hideHelpWindow(): void;
		
	/**
	 * 
	 * @param symbol 
	 * @param method 
	 */
	setHandler(symbol : string, method : () => void): void;
		
	/**
	 * 
	 * @param symbol 
	 * @return  
	 */
	isHandled(symbol : string): boolean;
		
	/**
	 * 
	 * @param symbol 
	 */
	callHandler(symbol : string): void;
		
	/**
	 * 
	 * @return  
	 */
	isOpenAndActive(): /* !this.visible */ any;
		
	/**
	 * 
	 * @return  
	 */
	isCursorMovable(): boolean;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorDown(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorUp(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorRight(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorLeft(wrap : boolean): void;
		
	/**
	 * 
	 */
	cursorPagedown(): void;
		
	/**
	 * 
	 */
	cursorPageup(): void;
		
	/**
	 * 
	 * @return  
	 */
	isScrollEnabled(): /* !this.active */ any;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	processCursorMove(): void;
		
	/**
	 * 
	 */
	processHandling(): void;
		
	/**
	 * 
	 */
	processTouch(): void;
		
	/**
	 * 
	 * @return  
	 */
	isHoverEnabled(): boolean;
		
	/**
	 * 
	 * @param trigger 
	 */
	onTouchSelect(trigger : boolean): void;
		
	/**
	 * 
	 */
	onTouchOk(): void;
		
	/**
	 * 
	 */
	onTouchCancel(): void;
		
	/**
	 * 
	 * @return  
	 */
	hitIndex(): number;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @return  
	 */
	hitTest(x : any, y : any): number;
		
	/**
	 * 
	 * @return  
	 */
	isTouchOkEnabled(): /* !this._cursorFixed */ any;
		
	/**
	 * 
	 * @return  
	 */
	isOkEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isCancelEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isOkTriggered(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isCancelTriggered(): boolean;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	callOkHandler(): void;
		
	/**
	 * 
	 */
	processCancel(): void;
		
	/**
	 * 
	 */
	callCancelHandler(): void;
		
	/**
	 * 
	 */
	processPageup(): void;
		
	/**
	 * 
	 */
	processPagedown(): void;
		
	/**
	 * 
	 */
	updateInputData(): void;
		
	/**
	 * 
	 * @param smooth 
	 */
	ensureCursorVisible(smooth : boolean): void;
		
	/**
	 * 
	 */
	callUpdateHelp(): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
		
	/**
	 * 
	 * @param item 
	 */
	setHelpWindowItem(item : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): boolean;
		
	/**
	 * 
	 */
	drawAllItems(): void;
		
	/**
	 * 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	clearItem(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItemBackground(index : number): void;
		
	/**
	 * 
	 * @param rect 
	 */
	drawBackgroundRect(rect : any): void;
		
	/**
	 * 
	 * @param index 
	 */
	redrawItem(index : number): void;
		
	/**
	 * 
	 */
	redrawCurrentItem(): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	paint(): void;
		
	/**
	 * 
	 */
	refreshCursor(): void;
		
	/**
	 * 
	 */
	refreshCursorForAll(): void;
}

class Window_MapName extends Window_Base {
	
}

/**
 * -----------------------------------------------------------------------------
 * Window_StatusBase
 * 
 * The superclass of windows for displaying actor status.
 */
class Window_StatusBase extends Window_Selectable {
		
	/**
	 * 
	 */
	constructor(rect : any);
		
	/**
	 * 
	 */
	loadFaceImages(): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	hideAdditionalSprites(): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	placeActorName(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	placeStateIcon(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param type 
	 * @param x 
	 * @param y 
	 */
	placeGauge(actor : Game_Actor, type : string, x : number, y : number): void;
		
	/**
	 * 
	 * @param key 
	 * @param spriteClass 
	 * @return  
	 */
	createInnerSprite(key : string, spriteClass : () => void): /* !this._additionalSprites.<i> */ any;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	placeTimeGauge(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	placeBasicGauges(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @return  
	 */
	gaugeLineHeight(): number;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	drawActorCharacter(actor : any, x : any, y : any): void;
		
	/**
	 * prettier-ignore
	 * @param actor 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	drawActorFace(actor : Game_Actor, x : number, y : number, width : number, height : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawActorName(actor : Game_Actor, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawActorClass(actor : Game_Actor, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawActorNickname(actor : any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	drawActorLevel(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawActorIcons(actor : Game_Actor, x : number, y : number, width : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param x 
	 * @param y 
	 */
	drawActorSimpleStatus(actor : Game_Actor, x : number, y : number): void;
		
	/**
	 * 
	 * @param actor 
	 * @param index 
	 */
	actorSlotName(actor : any, index : any): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_NameInput
 * 
 * The window for selecting text characters on the name input screen.
 */
class Window_NameInput extends Window_Selectable {
		
	/**
	 * 
	 */
	 constructor(rect : any);
		
	/**
	 * 
	 * @param editWindow 
	 */
	setEditWindow(editWindow : /* Window_NameInput.prototype.+Window_NameEdit */ any): void;
		
	/**
	 * 
	 * @return  
	 */
	table(): Array<Array</* string],[string],[string */ any>>;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	groupSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	character(): string;
		
	/**
	 * 
	 * @return  
	 */
	isPageChange(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isOk(): boolean;
		
	/**
	 * 
	 * @param index 
	 */
	itemRect(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 */
	updateCursor(): void;
		
	/**
	 * 
	 * @return  
	 */
	isCursorMovable(): /* !this.active */ any;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorDown(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorUp(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorRight(wrap : boolean): void;
		
	/**
	 * 
	 * @param wrap 
	 */
	cursorLeft(wrap : boolean): void;
		
	/**
	 * 
	 */
	cursorPagedown(): void;
		
	/**
	 * 
	 */
	cursorPageup(): void;
		
	/**
	 * 
	 */
	processCursorMove(): void;
		
	/**
	 * 
	 */
	processHandling(): void;
		
	/**
	 * 
	 * @return  
	 */
	isCancelEnabled(): boolean;
		
	/**
	 * 
	 */
	processCancel(): void;
		
	/**
	 * 
	 */
	processJump(): void;
		
	/**
	 * 
	 */
	processBack(): void;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	onNameAdd(): void;
		
	/**
	 * 
	 */
	onNameOk(): void;
		
	/**
	 * prettier-ignore
	 */
	LATIN1 : Array<string>;
		
	/**
	 * prettier-ignore
	 */
	LATIN2 : Array<string>;
		
	/**
	 * prettier-ignore
	 */
	RUSSIA : Array<string>;
		
	/**
	 * prettier-ignore
	 */
	JAPAN1 : Array<string>;
		
	/**
	 * prettier-ignore
	 */
	JAPAN2 : Array<string>;
		
	/**
	 * prettier-ignore
	 */
	JAPAN3 : Array<string>;
}

/**
 * -----------------------------------------------------------------------------
 * Window_NameEdit
 * 
 * The window for editing an actor's name on the name input screen.
 */
class Window_NameEdit extends Window_StatusBase {

	_name: string;
	_index: number;
	_defaultName: string;
		
	/**
	 * 
	 */
	constructor(rect : any);
		
	/**
	 * 
	 * @param actor 
	 * @param maxLength 
	 */
	setup(actor : Game_Actor, maxLength : any): void;
		
	/**
	 * 
	 * @return  
	 */
	//name(): string;
		
	/**
	 * 
	 * @return  
	 */
	restoreDefault(): boolean;
		
	/**
	 * 
	 * @param ch 
	 * @return  
	 */
	add(ch : string): boolean;
		
	/**
	 * 
	 * @return  
	 */
	back(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	faceWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	charWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	left(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemRect(index : number): Window_NameEdit.prototype.ItemRectRet;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	underlineRect(index : number): /* Window_NameEdit.prototype.itemRect.!ret */ any;
		
	/**
	 * 
	 * @return  
	 */
	underlineColor(): string;
		
	/**
	 * 
	 * @param index 
	 */
	drawUnderline(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawChar(index : number): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	_index : number;
		
	/**
	 * 
	 */
	_cursorFixed : boolean;
		
	/**
	 * 
	 */
	_cursorAll : boolean;
		
	/**
	 * 
	 */
	_doubleTouch : boolean;
		
	/**
	 * 
	 */
	_canRepeat : boolean;
		
	/**
	 * 
	 */
	_scrollX : number;
		
	/**
	 * 
	 */
	_scrollY : number;
		
	/**
	 * 
	 */
	_scrollBaseX : number;
		
	/**
	 * 
	 */
	_scrollBaseY : number;
		
	/**
	 * 
	 */
	_opening : boolean;
		
	/**
	 * 
	 */
	_closing : boolean;
		
	/**
	 * 
	 */
	_scrollTargetX : number;
		
	/**
	 * 
	 */
	_scrollTargetY : number;
		
	/**
	 * 
	 */
	_scrollDuration : number;
		
	/**
	 * 
	 */
	_scrollAccelX : number;
		
	/**
	 * 
	 */
	_scrollAccelY : number;
		
	/**
	 * 
	 */
	_scrollTouching : boolean;
		
	/**
	 * 
	 */
	_scrollLastTouchX : number;
		
	/**
	 * 
	 */
	_scrollLastTouchY : number;
		
	/**
	 * 
	 */
	_scrollLastCursorVisible : boolean;
		
	/**
	 * 
	 */
	active : boolean;
		
	/**
	 * 
	 */
	padding : number;
		
	/**
	 * 
	 */
	backOpacity : number;
		
	/**
	 * 
	 */
	cursorVisible : boolean;
		
	/**
	 * 
	 */
	_maxLength : number;
}


/**
 * -----------------------------------------------------------------------------
 * Window_BattleStatus
 * 
 * The window for displaying the status of party members on the battle screen.
 */
class Window_BattleStatus extends Window_StatusBase {
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	extraHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): /* !this.innerHeight */ any;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	rowSpacing(): number;
		
	/**
	 * 
	 */
	updatePadding(): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	actor(index : number): Game_Actor;
		
	/**
	 * 
	 * @param actor 
	 */
	selectActor(actor : Game_Actor): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	preparePartyRefresh(): void;
		
	/**
	 * 
	 */
	performPartyRefresh(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItemImage(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItemStatus(index : number): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	faceRect(index : any): Window_BattleStatus.prototype.FaceRectRet;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	nameX(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any):  /* error */ any;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	nameY(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any | /* Window_BattleStatus.prototype.faceRect.!ret */ any): number;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	stateIconX(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any): number;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	stateIconY(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any): number;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	basicGaugesX(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any):  /* error */ any;
		
	/**
	 * 
	 * @param rect 
	 * @return  
	 */
	basicGaugesY(rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any | /* Window_BattleStatus.prototype.faceRect.!ret */ any): number;
}

}
