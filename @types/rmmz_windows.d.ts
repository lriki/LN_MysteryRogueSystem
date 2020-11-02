// Type definitions for rmmz_windows.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace Window_Base.prototype{
	// Window_Base.prototype.textSizeEx.!ret
	
	/**
	 * 
	 */
	interface TextSizeExRet {
				
		/**
		 * 
		 */
		width : number;
				
		/**
		 * 
		 */
		height : number;
	}
}
declare namespace Window_Base.prototype{
	// Window_Base.prototype.createTextState.!ret
	
	/**
	 * 
	 */
	interface CreateTextStateRet {
				
		/**
		 * 
		 */
		text : string;
				
		/**
		 * 
		 */
		index : number;
				
		/**
		 * 
		 */
		width : number;
				
		/**
		 * 
		 */
		rtl : boolean;
				
		/**
		 * 
		 */
		buffer : string;
				
		/**
		 * 
		 */
		drawing : boolean;
				
		/**
		 * 
		 */
		outputWidth : number;
				
		/**
		 * 
		 */
		outputHeight : number;
	}
}
declare namespace Window_Selectable.prototype{
	// Window_Selectable.prototype.itemRect.!ret
	
	/**
	 * 
	 */
	interface ItemRectRet {
				
		/**
		 * 
		 */
		x : number;
	}
}
declare namespace Window_Selectable.prototype{
	// Window_Selectable.prototype.itemRectWithPadding.!ret
	
	/**
	 * 
	 */
	interface ItemRectWithPaddingRet {
				
		/**
		 * 
		 */
		x : number;
				
		/**
		 * 
		 */
		width : number;
				
		/**
		 * 
		 */
		y : number;
				
		/**
		 * 
		 */
		height : number;
	}
}
declare namespace Window_Selectable.prototype{
	// Window_Selectable.prototype.itemLineRect.!ret
	
	/**
	 * 
	 */
	interface ItemLineRectRet {
				
		/**
		 * 
		 */
		y : number;
				
		/**
		 * 
		 */
		height : number;
				
		/**
		 * 
		 */
		x : number;
				
		/**
		 * 
		 */
		width : number;
	}
}
declare namespace Window_Command.prototype{
	// Window_Command.prototype.currentData.!ret
	
	/**
	 * 
	 */
	interface CurrentDataRet {
				
		/**
		 * 
		 */
		symbol : string;
				
		/**
		 * 
		 */
		enabled : boolean;
	}
}
declare namespace Window_ShopBuy.prototype{
	// Window_ShopBuy.prototype.goodsToItem.!0
	type GoodsToItem0 = Array<Array</* string],[string */ any>>;
}
declare namespace Window_ShopNumber.prototype{
	// Window_ShopNumber.prototype.itemRect.!ret
	
	/**
	 * 
	 */
	interface ItemRectRet {
				
		/**
		 * 
		 */
		x : number;
				
		/**
		 * 
		 */
		y : number;
				
		/**
		 * 
		 */
		width : number;
				
		/**
		 * 
		 */
		height : number;
	}
}
declare namespace Window_ShopStatus.prototype{
	// Window_ShopStatus.prototype.drawActorParamChange.!3
	
	/**
	 * 
	 */
	interface DrawActorParamChange3 {
				
		/**
		 * 
		 */
		name : string;
				
		/**
		 * 
		 */
		params : /* Window_BattleLog._methods.<i>.params */ any;
	}
}
declare namespace Window_NameEdit.prototype{
	// Window_NameEdit.prototype.itemRect.!ret
	
	/**
	 * 
	 */
	interface ItemRectRet {
				
		/**
		 * 
		 */
		y : number;
				
		/**
		 * 
		 */
		width : number;
				
		/**
		 * 
		 */
		height : number;
	}
}
declare namespace Window_Message.prototype{
	// Window_Message.prototype.processControlCharacter.!0
	
	/**
	 * 
	 */
	interface ProcessControlCharacter0 {
	}
}
declare namespace Window_BattleStatus.prototype{
	// Window_BattleStatus.prototype.faceRect.!ret
	
	/**
	 * 
	 */
	interface FaceRectRet {
				
		/**
		 * 
		 */
		height : number;
	}
}
declare namespace Window_BattleLog{
	// Window_BattleLog._methods.<i>
	
	/**
	 * 
	 */
	interface _methodsI {
				
		/**
		 * 
		 */
		name : string;
				
		/**
		 * 
		 */
		params : Array<Game_Actor>;
	}
}

/**
 * -----------------------------------------------------------------------------
 * Window_Base
 * 
 * The superclass of all windows within the game.
 */
declare class Window_Base {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : /* Window_Base.prototype.+Window_NumberInput */ any): void;
		
	/**
	 * 
	 * @param options 
	 */
	destroy(options : any): void;
		
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
	baseTextRect(): void;
		
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
	textSizeEx(text : string): Window_Base.prototype.TextSizeExRet;
		
	/**
	 * 
	 * @param text 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @return  
	 */
	createTextState(text : string, x : number, y : number, width : number): Window_Base.prototype.CreateTextStateRet;
		
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
	obtainEscapeParam();
		
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
	calcTextHeight(textState : /* Window_Base.prototype.createTextState.!ret */ any | {}): number;	
	/**
	 * 
	 */
	calcTextHeight();
		
	/**
	 * 
	 * @param line 
	 * @return  
	 */
	maxFontSizeInLine(line : string): number;	
	/**
	 * 
	 */
	maxFontSizeInLine();
		
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
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	clearScrollStatus(): void;
		
	/**
	 * 
	 * @return  
	 */
	scrollX(): /* !this._scrollX */ any;
		
	/**
	 * 
	 * @return  
	 */
	scrollY(): /* !this._scrollY */ any;
		
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
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
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
	contentsHeight(): void;
		
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
	drawItem(): void;
		
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

/**
 * -----------------------------------------------------------------------------
 * Window_Command
 * 
 * The superclass of windows for selecting a command.
 */
declare class Window_Command extends Window_Selectable {
	constructor(rect : Rectangle);

	/**
	 * 
	 */
	new ();

		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._list.length */ any;
		
	/**
	 * 
	 */
	clearCommandList(): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * prettier-ignore
	 * @param name 
	 * @param symbol 
	 * @param enabled 
	 * @param ext 
	 */
	addCommand(name : any, symbol : string, enabled : boolean, ext : any): void;
		
	/**
	 * 
	 * @param index 
	 */
	commandName(index : number): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	commandSymbol(index : number): string;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	isCommandEnabled(index : number): boolean;
		
	/**
	 * 
	 * @return  
	 */
	currentData(): Window_Command.prototype.CurrentDataRet;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	currentSymbol(): string;
		
	/**
	 * 
	 */
	currentExt(): void;
		
	/**
	 * 
	 * @param symbol 
	 * @return  
	 */
	findSymbol(symbol : string): number;
		
	/**
	 * 
	 * @param symbol 
	 */
	selectSymbol(symbol : string): void;
		
	/**
	 * 
	 * @param ext 
	 * @return  
	 */
	findExt(ext : any): number;
		
	/**
	 * 
	 * @param ext 
	 */
	selectExt(ext : any): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @return  
	 */
	itemTextAlign(): string;
		
	/**
	 * 
	 * @return  
	 */
	isOkEnabled(): boolean;
		
	/**
	 * 
	 */
	callOkHandler(): void;
		
	/**
	 * 
	 */
	refresh(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_HorzCommand
 * 
 * The command window for the horizontal selection format.
 */
declare interface Window_HorzCommand extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemTextAlign(): string;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Help
 * 
 * The window for displaying the description of the selected item.
 */
declare class Window_Help extends Window_Base {
	constructor(rect: Rectangle);
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param text 
	 */
	setText(text : string): void;
		
	/**
	 * 
	 */
	clear(): void;
		
	/**
	 * 
	 * @param item 
	 */
	setItem(item : any): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
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
	padding : number;
		
	/**
	 * 
	 */
	backOpacity : number;
		
	/**
	 * 
	 */
	visible : boolean;
		
	/**
	 * 
	 */
	_text : string;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Gold
 * 
 * The window for displaying the party's gold.
 */
declare interface Window_Gold extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 * @return  
	 */
	value(): number;
		
	/**
	 * 
	 */
	currencyUnit(): void;
		
	/**
	 * 
	 */
	open(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_StatusBase
 * 
 * The superclass of windows for displaying actor status.
 */
declare interface Window_StatusBase extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
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
 * Window_MenuCommand
 * 
 * The window for selecting a command on the menu screen.
 */
declare interface Window_MenuCommand extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 */
	addMainCommands(): void;
		
	/**
	 * 
	 */
	addFormationCommand(): void;
		
	/**
	 * 
	 */
	addOriginalCommands(): void;
		
	/**
	 * 
	 */
	addOptionsCommand(): void;
		
	/**
	 * 
	 */
	addSaveCommand(): void;
		
	/**
	 * 
	 */
	addGameEndCommand(): void;
		
	/**
	 * 
	 * @param name 
	 * @return  
	 */
	needsCommand(name : string): boolean;
		
	/**
	 * 
	 * @return  
	 */
	areMainCommandsEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isFormationEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isOptionsEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isSaveEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isGameEndEnabled(): boolean;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 */
	_lastCommandSymbol : string;
		
	/**
	 * 
	 */
	initCommandPosition(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_MenuStatus
 * 
 * The window for displaying party member status on the menu screen.
 */
declare interface Window_MenuStatus extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	numVisibleRows(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	actor(index : number): Game_Actor;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawPendingItemBackground(index : number): void;
		
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
	 */
	processOk(): void;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): boolean;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 * @return  
	 */
	formationMode(): /* !this._formationMode */ any;
		
	/**
	 * 
	 * @param formationMode 
	 */
	setFormationMode(formationMode : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	pendingIndex(): /* !this._pendingIndex */ any;
		
	/**
	 * 
	 * @param index 
	 */
	setPendingIndex(index : number): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_MenuActor
 * 
 * The window for selecting a target actor on the item and skill screens.
 */
declare interface Window_MenuActor extends Window_MenuStatus {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 * @param item 
	 */
	selectForItem(item : any): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ItemCategory
 * 
 * The window for selecting a category of items on the item and shop screens.
 */
declare interface Window_ItemCategory extends Window_HorzCommand {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 * @param name 
	 * @return  
	 */
	needsCommand(name : string): boolean;
		
	/**
	 * 
	 * @param itemWindow 
	 */
	setItemWindow(itemWindow : {} | Window_ShopSell | Window_ShopSell): void;
		
	/**
	 * 
	 * @return  
	 */
	needsSelection(): boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ItemList
 * 
 * The window for selecting an item on the item screen.
 */
declare interface Window_ItemList extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param category 
	 */
	setCategory(category : string): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._data.length */ any;
		
	/**
	 * 
	 */
	item(): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemAt(index : number): /* !this._data.<i> */ any;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): boolean;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	includes(item : any): any;
		
	/**
	 * 
	 * @return  
	 */
	needsNumber(): boolean;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	isEnabled(item : any): boolean;
		
	/**
	 * 
	 */
	makeItemList(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	numberWidth(): number;
		
	/**
	 * 
	 * @param item 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawItemNumber(item : any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
		
	/**
	 * 
	 */
	refresh(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_SkillType
 * 
 * The window for selecting a skill type on the skill screen.
 */
declare interface Window_SkillType extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 * @param skillWindow 
	 */
	setSkillWindow(skillWindow : /* Window_SkillType.prototype.+Window_SkillList */ any): void;
		
	/**
	 * 
	 */
	selectLast(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_SkillStatus
 * 
 * The window for displaying the skill user's status on the skill screen.
 */
declare interface Window_SkillStatus extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 */
	refresh(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_SkillList
 * 
 * The window for selecting a skill on the skill screen.
 */
declare interface Window_SkillList extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : Game_Actor): void;
		
	/**
	 * 
	 * @param stypeId 
	 */
	setStypeId(stypeId : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._data.length */ any;
		
	/**
	 * 
	 */
	item(): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemAt(index : number): /* !this._data.<i> */ any;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): Game_Actor;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	includes(item : any): any;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	isEnabled(item : any): /* !this._actor */ any;
		
	/**
	 * 
	 */
	makeItemList(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	costWidth(): number;
		
	/**
	 * 
	 * @param skill 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawSkillCost(skill : any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
		
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
	_stypeId : number;
		
	/**
	 * 
	 */
	_data : Array<any>;
}

/**
 * -----------------------------------------------------------------------------
 * Window_EquipStatus
 * 
 * The window for displaying parameter changes on the equipment screen.
 */
declare interface Window_EquipStatus extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 * @param tempActor 
	 */
	setTempActor(tempActor : any): void;
		
	/**
	 * 
	 */
	drawAllParams(): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param paramId 
	 */
	drawItem(x : any, y : any, paramId : any): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param paramId 
	 */
	drawParamName(x : any, y : any, paramId : any): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param paramId 
	 */
	drawCurrentParam(x : number, y : any, paramId : any): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	drawRightArrow(x : number, y : any): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param paramId 
	 */
	drawNewParam(x : number, y : any, paramId : any): void;
		
	/**
	 * 
	 * @return  
	 */
	rightArrowWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	paramWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	paramX(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	paramY(index : number): number;
	
	/**
	 * 
	 */
	_additionalSprites : {
	}
		
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
}

/**
 * -----------------------------------------------------------------------------
 * Window_EquipCommand
 * 
 * The window for selecting a command on the equipment screen.
 */
declare interface Window_EquipCommand extends Window_HorzCommand {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 */
	makeCommandList(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_EquipSlot
 * 
 * The window for selecting an equipment slot on the equipment screen.
 */
declare interface Window_EquipSlot extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 */
	item(): void;
		
	/**
	 * 
	 * @param index 
	 */
	itemAt(index : number): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	slotNameWidth(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	isEnabled(index : number): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isCurrentItemEnabled(): boolean;
		
	/**
	 * 
	 * @param statusWindow 
	 */
	setStatusWindow(statusWindow : Window_EquipStatus): void;
		
	/**
	 * 
	 * @param itemWindow 
	 */
	setItemWindow(itemWindow : /* Window_EquipSlot.prototype.+Window_EquipItem */ any): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_EquipItem
 * 
 * The window for selecting an equipment item on the equipment screen.
 */
declare interface Window_EquipItem extends Window_ItemList {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	colSpacing(): number;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 * @param slotId 
	 */
	setSlotId(slotId : number): void;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	includes(item : any): /* !this._actor */ any;
		
	/**
	 * 
	 * @return  
	 */
	etypeId(): number;
		
	/**
	 * 
	 * @return  
	 */
	isEnabled(): boolean;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 * @param statusWindow 
	 */
	setStatusWindow(statusWindow : Window_EquipStatus): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
		
	/**
	 * 
	 */
	playOkSound(): void;
		
	/**
	 * 
	 */
	_category : string;
		
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
	visible : boolean;
		
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
	_slotId : number;
		
	/**
	 * 
	 */
	_statusWindow : Window_EquipStatus;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Status
 * 
 * The window for displaying full status on the status screen.
 */
declare interface Window_Status extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	drawBlock1(): void;
		
	/**
	 * 
	 * @return  
	 */
	block1Y(): number;
		
	/**
	 * 
	 */
	drawBlock2(): void;
		
	/**
	 * 
	 * @return  
	 */
	block2Y(): number;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	drawBasicInfo(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	drawExpInfo(x : number, y : number): void;
		
	/**
	 * 
	 * @return  
	 */
	expTotalValue(): string;
		
	/**
	 * 
	 * @return  
	 */
	expNextValue(): string;
}

/**
 * -----------------------------------------------------------------------------
 * Window_StatusParams
 * 
 * The window for displaying parameters on the status screen.
 */
declare interface Window_StatusParams extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 */
	drawItemBackground(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_StatusEquip
 * 
 * The window for displaying equipment items on the status screen.
 */
declare interface Window_StatusEquip extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setActor(actor : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 */
	drawItemBackground(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Options
 * 
 * The window for changing various settings on the options screen.
 */
declare interface Window_Options extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 */
	addGeneralOptions(): void;
		
	/**
	 * 
	 */
	addVolumeOptions(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @return  
	 */
	statusWidth(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	statusText(index : number): string;
		
	/**
	 * 
	 * @param symbol 
	 * @return  
	 */
	isVolumeSymbol(symbol : string): boolean;
		
	/**
	 * 
	 * @param value 
	 * @return  
	 */
	booleanStatusText(value : boolean | number): string;
		
	/**
	 * 
	 * @param value 
	 * @return  
	 */
	volumeStatusText(value : boolean | number): string;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	cursorRight(): void;
		
	/**
	 * 
	 */
	cursorLeft(): void;
		
	/**
	 * 
	 * @param symbol 
	 * @param forward 
	 * @param wrap 
	 */
	changeVolume(symbol : string, forward : boolean, wrap : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	volumeOffset(): number;
		
	/**
	 * 
	 * @param symbol 
	 * @param value 
	 */
	changeValue(symbol : string, value : boolean | number): void;
		
	/**
	 * 
	 * @param symbol 
	 * @return  
	 */
	getConfigValue(symbol : string): boolean;	
	/**
	 * 
	 */
	getConfigValue();
		
	/**
	 * 
	 * @param symbol 
	 * @param volume 
	 */
	setConfigValue(symbol : string, volume : boolean | number): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_SavefileList
 * 
 * The window for selecting a save file on the save and load screens.
 */
declare interface Window_SavefileList extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param mode 
	 * @param autosave 
	 */
	setMode(mode : any, autosave : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @return  
	 */
	numVisibleRows(): number;
		
	/**
	 * 
	 * @return  
	 */
	itemHeight(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	indexToSavefileId(index : number): number;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	savefileIdToIndex(savefileId : any): number;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	isEnabled(savefileId : number): boolean;
		
	/**
	 * 
	 * @return  
	 */
	savefileId(): number;
		
	/**
	 * 
	 * @param savefileId 
	 */
	selectSavefile(savefileId : any): void;
		
	/**
	 * 
	 * @param savefileId 
	 * @param x 
	 * @param y 
	 */
	drawTitle(savefileId : number, x : number, y : number): void;
		
	/**
	 * 
	 * @param info 
	 * @param rect 
	 */
	drawContents(info : /* Window_SavefileList.prototype.drawContents.!0 */ any, rect : /* Window_Selectable.prototype.itemRectWithPadding.!ret */ any): void;
		
	/**
	 * 
	 * @param info 
	 * @param x 
	 * @param y 
	 */
	drawPartyCharacters(info : /* Window_SavefileList.prototype.drawContents.!0 */ any, x : number, y : number): void;
		
	/**
	 * 
	 * @param info 
	 * @param x 
	 * @param y 
	 * @param width 
	 */
	drawPlaytime(info : /* Window_SavefileList.prototype.drawContents.!0 */ any, x : number, y : number, width : number): void;
		
	/**
	 * 
	 */
	playOkSound(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ShopCommand
 * 
 * The window for selecting buy/sell on the shop screen.
 */
declare interface Window_ShopCommand extends Window_HorzCommand {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param purchaseOnly 
	 */
	setPurchaseOnly(purchaseOnly : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 */
	makeCommandList(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ShopBuy
 * 
 * The window for selecting an item to buy on the shop screen.
 */
declare interface Window_ShopBuy extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param shopGoods 
	 */
	setupGoods(shopGoods : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._data.length */ any;
		
	/**
	 * 
	 */
	item(): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemAt(index : number): /* !this._data.<i> */ any;
		
	/**
	 * 
	 * @param money 
	 */
	setMoney(money : number): void;
		
	/**
	 * 
	 */
	isCurrentItemEnabled(): void;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	price(item : any): /* !this._price.<i> */ any;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	isEnabled(item : any): any;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	makeItemList(): void;
		
	/**
	 * 
	 * @param goods 
	 */
	goodsToItem(goods : Window_ShopBuy.prototype.GoodsToItem0): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	priceWidth(): number;
		
	/**
	 * 
	 * @param statusWindow 
	 */
	setStatusWindow(statusWindow : /* Window_ShopBuy.prototype.+Window_ShopStatus */ any): void;
		
	/**
	 * 
	 */
	updateHelp(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ShopSell
 * 
 * The window for selecting an item to sell on the shop screen.
 */
declare interface Window_ShopSell extends Window_ItemList {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	isEnabled(item : any): any;
		
	/**
	 * 
	 */
	_category : string;
		
	/**
	 * 
	 */
	_data : Array<any>;
		
	/**
	 * 
	 */
	y : number;
		
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
	_helpWindow : Window_Help;
		
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
	visible : boolean;
		
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
}

/**
 * -----------------------------------------------------------------------------
 * Window_ShopNumber
 * 
 * The window for inputting quantity of items to buy or sell on the shop
 * screen.
 */
declare interface Window_ShopNumber extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isScrollEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	number(): /* !this._number */ any;
		
	/**
	 * 
	 * @param item 
	 * @param max 
	 * @param price 
	 */
	setup(item : any, max : number, price : number): void;
		
	/**
	 * 
	 * @param currencyUnit 
	 */
	setCurrencyUnit(currencyUnit : any): void;
		
	/**
	 * 
	 */
	createButtons(): void;
		
	/**
	 * 
	 */
	placeButtons(): void;
		
	/**
	 * 
	 */
	totalButtonWidth(): void;
		
	/**
	 * 
	 * @return  
	 */
	buttonSpacing(): number;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	drawCurrentItemName(): void;
		
	/**
	 * 
	 */
	drawMultiplicationSign(): void;
		
	/**
	 * 
	 * @return  
	 */
	multiplicationSign(): string;
		
	/**
	 * 
	 * @return  
	 */
	multiplicationSignX(): number;
		
	/**
	 * 
	 */
	drawNumber(): void;
		
	/**
	 * 
	 */
	drawHorzLine(): void;
		
	/**
	 * 
	 */
	drawTotalPrice(): void;
		
	/**
	 * 
	 * @return  
	 */
	itemNameY(): number;
		
	/**
	 * 
	 * @return  
	 */
	totalPriceY(): number;
		
	/**
	 * 
	 * @return  
	 */
	buttonY(): number;
		
	/**
	 * 
	 * @return  
	 */
	cursorWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	cursorX(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxDigits(): number;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	playOkSound(): void;
		
	/**
	 * 
	 */
	processNumberChange(): void;
		
	/**
	 * 
	 * @param amount 
	 */
	changeNumber(amount : number): void;
		
	/**
	 * 
	 * @return  
	 */
	itemRect(): Window_ShopNumber.prototype.ItemRectRet;
		
	/**
	 * 
	 * @return  
	 */
	isTouchOkEnabled(): boolean;
		
	/**
	 * 
	 */
	onButtonUp(): void;
		
	/**
	 * 
	 */
	onButtonUp2(): void;
		
	/**
	 * 
	 */
	onButtonDown(): void;
		
	/**
	 * 
	 */
	onButtonDown2(): void;
		
	/**
	 * 
	 */
	onButtonOk(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ShopStatus
 * 
 * The window for displaying number of items in possession and the actor's
 * equipment on the shop screen.
 */
declare interface Window_ShopStatus extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 * @param item 
	 */
	setItem(item : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isEquipItem(): /* !this._item */ any;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	drawPossession(x : number, y : number): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 */
	drawEquipInfo(x : number, y : number): void;
		
	/**
	 * 
	 * @return  
	 */
	statusMembers(): Array<Game_Actor>;
		
	/**
	 * 
	 * @return  
	 */
	pageSize(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxPages(): number;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param actor 
	 */
	drawActorEquipInfo(x : number, y : number, actor : Game_Actor): void;
		
	/**
	 * prettier-ignore
	 * @param x 
	 * @param y 
	 * @param actor 
	 * @param item1 
	 */
	drawActorParamChange(x : number, y : number, actor : Game_Actor, item1 : Window_ShopStatus.prototype.DrawActorParamChange3): void;
		
	/**
	 * 
	 * @return  
	 */
	paramId(): number;
		
	/**
	 * 
	 * @param actor 
	 * @param etypeId 
	 */
	currentEquippedItem(actor : Game_Actor, etypeId : any): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updatePage(): void;
		
	/**
	 * 
	 * @return  
	 */
	isPageChangeEnabled(): /* !this.visible */ any;
		
	/**
	 * 
	 * @return  
	 */
	isPageChangeRequested(): boolean;
		
	/**
	 * 
	 */
	changePage(): void;
		
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
	visible : boolean;
		
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
	_pageIndex : number;
		
	/**
	 * 
	 */
	downArrowVisible : boolean;
		
	/**
	 * 
	 */
	upArrowVisible : boolean;
		
	/**
	 * 
	 */
	openness : number;
}

/**
 * -----------------------------------------------------------------------------
 * Window_NameEdit
 * 
 * The window for editing an actor's name on the name input screen.
 */
declare interface Window_NameEdit extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
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
	name(): /* !this._name */ any;
		
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
 * Window_NameInput
 * 
 * The window for selecting text characters on the name input screen.
 */
declare interface Window_NameInput extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
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
 * Window_NameBox
 * 
 * The window for displaying a speaker name above the message window.
 */
declare interface Window_NameBox extends Window_Base {
		
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
	 * @param messageWindow 
	 */
	setMessageWindow(messageWindow : any): void;
		
	/**
	 * 
	 * @param name 
	 */
	setName(name : string): void;
		
	/**
	 * 
	 */
	clear(): void;
		
	/**
	 * 
	 */
	start(): void;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 */
	updateBackground(): void;
		
	/**
	 * 
	 * @return  
	 */
	windowWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	windowHeight(): number;
		
	/**
	 * 
	 */
	refresh(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ChoiceList
 * 
 * The window used for the event command [Show Choices].
 */
declare interface Window_ChoiceList extends Window_Command {
		
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
	 * @param messageWindow 
	 */
	setMessageWindow(messageWindow : any): void;
		
	/**
	 * 
	 */
	createCancelButton(): void;
		
	/**
	 * 
	 */
	start(): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updateCancelButton(): void;
		
	/**
	 * 
	 */
	selectDefault(): void;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 */
	updateBackground(): void;
		
	/**
	 * 
	 */
	placeCancelButton(): void;
		
	/**
	 * 
	 * @return  
	 */
	windowX(): number;
		
	/**
	 * 
	 * @return  
	 */
	windowY(): number;
		
	/**
	 * 
	 * @return  
	 */
	windowWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	windowHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	numVisibleRows(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxLines(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxChoiceWidth(): number;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isCancelEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	needsCancelButton(): boolean;
		
	/**
	 * 
	 */
	callOkHandler(): void;
		
	/**
	 * 
	 */
	callCancelHandler(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_NumberInput
 * 
 * The window used for the event command [Input Number].
 */
declare interface Window_NumberInput extends Window_Selectable {
		
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
	 * @param messageWindow 
	 */
	setMessageWindow(messageWindow : any): void;
		
	/**
	 * 
	 */
	start(): void;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 * @return  
	 */
	windowWidth(): number;
		
	/**
	 * 
	 * @return  
	 */
	windowHeight(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): /* !this._maxDigits */ any;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._maxDigits */ any;
		
	/**
	 * 
	 * @return  
	 */
	itemWidth(): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	itemRect(index : number): /* Window_Selectable.prototype.itemRect.!ret */ any;
		
	/**
	 * 
	 * @return  
	 */
	isScrollEnabled(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isHoverEnabled(): boolean;
		
	/**
	 * 
	 */
	createButtons(): void;
		
	/**
	 * 
	 */
	placeButtons(): void;
		
	/**
	 * 
	 */
	totalButtonWidth(): void;
		
	/**
	 * 
	 * @return  
	 */
	buttonSpacing(): number;
		
	/**
	 * 
	 * @return  
	 */
	buttonY(): number;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	processDigitChange(): void;
		
	/**
	 * 
	 * @param up 
	 */
	changeDigit(up : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	isTouchOkEnabled(): boolean;
		
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
	 */
	processOk(): void;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 */
	onButtonUp(): void;
		
	/**
	 * 
	 */
	onButtonDown(): void;
		
	/**
	 * 
	 */
	onButtonOk(): void;
		
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
	_handlers : {
	}
		
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
	_number : number;
		
	/**
	 * 
	 */
	_maxDigits : number;
		
	/**
	 * 
	 */
	openness : number;
		
	/**
	 * 
	 */
	width : number;
		
	/**
	 * 
	 */
	height : number;
		
	/**
	 * 
	 */
	x : number;
		
	/**
	 * 
	 */
	y : number;
		
	/**
	 * 
	 */
	_buttons : Array<Sprite_Button>;
		
	/**
	 * 
	 */
	downArrowVisible : boolean;
		
	/**
	 * 
	 */
	upArrowVisible : boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Window_EventItem
 * 
 * The window used for the event command [Select Item].
 */
declare interface Window_EventItem extends Window_ItemList {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param messageWindow 
	 */
	setMessageWindow(messageWindow : any): void;
		
	/**
	 * 
	 */
	createCancelButton(): void;
		
	/**
	 * 
	 */
	start(): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updateCancelButton(): void;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 */
	placeCancelButton(): void;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	includes(item : any): any;
		
	/**
	 * 
	 * @return  
	 */
	needsNumber(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isEnabled(): boolean;
		
	/**
	 * 
	 */
	onOk(): void;
		
	/**
	 * 
	 */
	onCancel(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_Message
 * 
 * The window for displaying text messages.
 */
declare interface Window_Message extends Window_Base {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	initMembers(): void;
		
	/**
	 * 
	 * @param goldWindow 
	 */
	setGoldWindow(goldWindow : any): void;
		
	/**
	 * 
	 * @param nameBoxWindow 
	 */
	setNameBoxWindow(nameBoxWindow : any): void;
		
	/**
	 * 
	 * @param choiceListWindow 
	 */
	setChoiceListWindow(choiceListWindow : any): void;
		
	/**
	 * 
	 * @param numberInputWindow 
	 */
	setNumberInputWindow(numberInputWindow : any): void;
		
	/**
	 * 
	 * @param eventItemWindow 
	 */
	setEventItemWindow(eventItemWindow : any): void;
		
	/**
	 * 
	 */
	clearFlags(): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	checkToNotClose(): void;
		
	/**
	 * 
	 */
	synchronizeNameBox(): void;
		
	/**
	 * 
	 * @return  
	 */
	canStart(): boolean;
		
	/**
	 * 
	 */
	startMessage(): void;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	newLineX(textState : /* Window_Base.prototype.createTextState.!ret */ any): number;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 */
	updateBackground(): void;
		
	/**
	 * 
	 */
	terminateMessage(): void;
		
	/**
	 * 
	 * @return  
	 */
	updateWait(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	updateLoading(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	updateInput(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isAnySubWindowActive(): /* !this._choiceListWindow.active */ any;
		
	/**
	 * 
	 * @return  
	 */
	updateMessage(): boolean;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	shouldBreakHere(textState : /* Window_Base.prototype.createTextState.!ret */ any): boolean;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	canBreakHere(textState : /* Window_Base.prototype.createTextState.!ret */ any): boolean;
		
	/**
	 * 
	 */
	onEndOfText(): void;
		
	/**
	 * 
	 * @return  
	 */
	startInput(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	isTriggered(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	doesContinue(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	areSettingsChanged(): boolean;
		
	/**
	 * 
	 */
	updateShowFast(): void;
		
	/**
	 * 
	 * @param textState 
	 */
	newPage(textState : /* Window_Base.prototype.createTextState.!ret */ any): void;
		
	/**
	 * 
	 */
	updateSpeakerName(): void;
		
	/**
	 * 
	 */
	loadMessageFace(): void;
		
	/**
	 * 
	 */
	drawMessageFace(): void;
		
	/**
	 * 
	 * @param textState 
	 * @param c 
	 */
	processControlCharacter(textState : Window_Message.prototype.ProcessControlCharacter0, c : any): void;
		
	/**
	 * 
	 * @param textState 
	 */
	processNewLine(textState : any): void;
		
	/**
	 * 
	 * @param textState 
	 */
	processNewPage(textState : /* Window_Message.prototype.processControlCharacter.!0 */ any): void;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	isEndOfText(textState : /* Window_Base.prototype.createTextState.!ret */ any): boolean;
		
	/**
	 * 
	 * @param textState 
	 * @return  
	 */
	needsNewPage(textState : /* Window_Base.prototype.createTextState.!ret */ any): boolean;
		
	/**
	 * 
	 * @param code 
	 * @param textState 
	 */
	processEscapeCharacter(code : any, textState : any): void;
		
	/**
	 * 
	 * @param count 
	 */
	startWait(count : number): void;
		
	/**
	 * 
	 */
	startPause(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ScrollText
 * 
 * The window for displaying scrolling text. No frame is displayed, but it
 * is handled as a window for convenience.
 */
declare interface Window_ScrollText extends Window_Base {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	startMessage(): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	updatePlacement(): void;
		
	/**
	 * 
	 * @return  
	 */
	contentsHeight(): number;
		
	/**
	 * 
	 */
	updateMessage(): void;
		
	/**
	 * 
	 * @return  
	 */
	scrollSpeed(): number;
		
	/**
	 * 
	 * @return  
	 */
	isFastForward(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	fastForwardRate(): number;
		
	/**
	 * 
	 */
	terminateMessage(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_MapName
 * 
 * The window for displaying the map name on the map screen.
 */
declare interface Window_MapName extends Window_Base {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updateFadeIn(): void;
		
	/**
	 * 
	 */
	updateFadeOut(): void;
		
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
	 */
	refresh(): void;
		
	/**
	 * 
	 * @param x 
	 * @param y 
	 * @param width 
	 * @param height 
	 */
	drawBackground(x : number, y : number, width : any, height : number): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_BattleLog
 * 
 * The window for displaying battle progress. No frame is displayed, but it is
 * handled as a window for convenience.
 */
declare interface Window_BattleLog extends Window_Base {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param spriteset 
	 */
	setSpriteset(spriteset : Spriteset_Battle): void;
		
	/**
	 * 
	 * @return  
	 */
	maxLines(): number;
		
	/**
	 * 
	 * @return  
	 */
	numLines(): /* !this._lines.length */ any;
		
	/**
	 * 
	 * @return  
	 */
	messageSpeed(): number;
		
	/**
	 * 
	 * @return  
	 */
	isBusy(): /* !this._waitMode */ any;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 * @return  
	 */
	updateWait(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	updateWaitCount(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	updateWaitMode(): boolean;
		
	/**
	 * 
	 * @param waitMode 
	 */
	setWaitMode(waitMode : string): void;
		
	/**
	 * 
	 */
	callNextMethod(): void;
		
	/**
	 * 
	 * @return  
	 */
	isFastForward(): boolean;
		
	/**
	 * 
	 * @param methodName 
	 */
	push(methodName : string): void;
		
	/**
	 * 
	 */
	clear(): void;
		
	/**
	 * 
	 */
	wait(): void;
		
	/**
	 * 
	 */
	waitForEffect(): void;
		
	/**
	 * 
	 */
	waitForMovement(): void;
		
	/**
	 * 
	 * @param text 
	 */
	addText(text : any): void;
		
	/**
	 * 
	 */
	pushBaseLine(): void;
		
	/**
	 * 
	 */
	popBaseLine(): void;
		
	/**
	 * 
	 */
	waitForNewLine(): void;
		
	/**
	 * 
	 * @param target 
	 */
	popupDamage(target : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param action 
	 */
	performActionStart(subject : any, action : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param action 
	 */
	performAction(subject : any, action : any): void;
		
	/**
	 * 
	 * @param subject 
	 */
	performActionEnd(subject : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performDamage(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performMiss(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performRecovery(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performEvasion(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performMagicEvasion(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performCounter(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performReflection(target : any): void;
		
	/**
	 * 
	 * @param substitute 
	 * @param target 
	 */
	performSubstitute(substitute : any, target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	performCollapse(target : any): void;
		
	/**
	 * prettier-ignore
	 * @param subject 
	 * @param targets 
	 * @param animationId 
	 */
	showAnimation(subject : any, targets : any, animationId : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param targets 
	 */
	showAttackAnimation(subject : any, targets : any): void;
		
	/**
	 * prettier-ignore
	 * @param subject 
	 * @param targets 
	 */
	showActorAttackAnimation(subject : any, targets : any): void;
		
	/**
	 * prettier-ignore
	 */
	showEnemyAttackAnimation(): void;
		
	/**
	 * prettier-ignore
	 * @param targets 
	 * @param animationId 
	 * @param mirror 
	 */
	showNormalAnimation(targets : any, animationId : any, mirror : boolean): void;
		
	/**
	 * 
	 */
	refresh(): void;
		
	/**
	 * 
	 */
	drawBackground(): void;
		
	/**
	 * 
	 */
	backRect(): void;
		
	/**
	 * 
	 * @param index 
	 */
	lineRect(index : number): void;
		
	/**
	 * 
	 * @return  
	 */
	backColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	backPaintOpacity(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawLineText(index : number): void;
		
	/**
	 * 
	 */
	startTurn(): void;
		
	/**
	 * 
	 * @param subject 
	 * @param action 
	 * @param targets 
	 */
	startAction(subject : Game_Actor, action : Game_Action, targets : any): void;
		
	/**
	 * 
	 * @param subject 
	 */
	endAction(subject : Game_Actor): void;
		
	/**
	 * 
	 * @param subject 
	 */
	displayCurrentState(subject : Game_Actor): void;
		
	/**
	 * 
	 * @param subject 
	 */
	displayRegeneration(subject : Game_Actor): void;
		
	/**
	 * 
	 * @param subject 
	 * @param item 
	 */
	displayAction(subject : Game_Actor, item : any): void;
		
	/**
	 * 
	 * @param fmt 
	 * @param subject 
	 * @param item 
	 */
	displayItemMessage(fmt : any, subject : Game_Actor, item : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayCounter(target : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayReflection(target : any): void;
		
	/**
	 * 
	 * @param substitute 
	 * @param target 
	 */
	displaySubstitute(substitute : any, target : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param target 
	 */
	displayActionResults(subject : Game_Actor, target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayFailure(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayCritical(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayDamage(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayMiss(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayEvasion(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayHpDamage(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayMpDamage(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayTpDamage(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayAffectedStatus(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayAutoAffectedStatus(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayChangedStates(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayAddedStates(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayRemovedStates(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 */
	displayChangedBuffs(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 * @param buffs 
	 * @param fmt 
	 */
	displayBuffs(target : Game_Actor, buffs : Array<any>, fmt : any): void;
		
	/**
	 * 
	 * @param target 
	 */
	makeHpDamageText(target : Game_Actor): void;
		
	/**
	 * 
	 * @param target 
	 * @return  
	 */
	makeMpDamageText(target : Game_Actor): string;
		
	/**
	 * 
	 * @param target 
	 * @return  
	 */
	makeTpDamageText(target : Game_Actor): string;
		
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
	visible : boolean;
		
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
	opacity : number;
		
	/**
	 * 
	 */
	_lines : Array<any>;
		
	/**
	 * 
	 */
	_methods : Array</* Window_BattleLog._methodsI */ any>;
		
	/**
	 * 
	 */
	_waitCount : number;
		
	/**
	 * 
	 */
	_waitMode : string;
		
	/**
	 * 
	 */
	_baseLineStack : Array<number>;
}

/**
 * -----------------------------------------------------------------------------
 * Window_PartyCommand
 * 
 * The window for selecting whether to fight or escape on the battle screen.
 */
declare interface Window_PartyCommand extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 */
	setup(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_ActorCommand
 * 
 * The window for selecting an actor's action on the battle screen.
 */
declare interface Window_ActorCommand extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 */
	addAttackCommand(): void;
		
	/**
	 * 
	 */
	addSkillCommands(): void;
		
	/**
	 * 
	 */
	addGuardCommand(): void;
		
	/**
	 * 
	 */
	addItemCommand(): void;
		
	/**
	 * 
	 * @param actor 
	 */
	setup(actor : Game_Actor): void;
		
	/**
	 * 
	 * @return  
	 */
	actor(): /* !this._actor */ any;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_BattleStatus
 * 
 * The window for displaying the status of party members on the battle screen.
 */
declare interface Window_BattleStatus extends Window_StatusBase {
		
	/**
	 * 
	 */
	new ();
		
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

/**
 * -----------------------------------------------------------------------------
 * Window_BattleActor
 * 
 * The window for selecting a target actor on the battle screen.
 */
declare interface Window_BattleActor extends Window_BattleStatus {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
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
	 * @param index 
	 */
	select(index : number): void;
		
	/**
	 * 
	 */
	processTouch(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_BattleEnemy
 * 
 * The window for selecting a target enemy on the battle screen.
 */
declare interface Window_BattleEnemy extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxCols(): number;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): /* !this._enemies.length */ any;
		
	/**
	 * 
	 * @return  
	 */
	enemy(): /* !this._enemies.<i> */ any;
		
	/**
	 * 
	 * @return  
	 */
	enemyIndex(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
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
	refresh(): void;
		
	/**
	 * 
	 * @param index 
	 */
	select(index : number): void;
		
	/**
	 * 
	 */
	processTouch(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_BattleSkill
 * 
 * The window for selecting a skill to use on the battle screen.
 */
declare interface Window_BattleSkill extends Window_SkillList {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	show(): void;
		
	/**
	 * 
	 */
	hide(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_BattleItem
 * 
 * The window for selecting an item to use on the battle screen.
 */
declare interface Window_BattleItem extends Window_ItemList {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	includes(item : any): boolean;
		
	/**
	 * 
	 */
	show(): void;
		
	/**
	 * 
	 */
	hide(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_TitleCommand
 * 
 * The window for selecting New Game/Continue on the title screen.
 */
declare interface Window_TitleCommand extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
		
	/**
	 * 
	 * @return  
	 */
	isContinueEnabled(): boolean;
		
	/**
	 * 
	 */
	processOk(): void;
		
	/**
	 * 
	 */
	selectLast(): void;
		
	/**
	 * 
	 */
	_lastCommandSymbol : string;
		
	/**
	 * 
	 */
	initCommandPosition(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_GameEnd
 * 
 * The window for selecting "Go to Title" on the game end screen.
 */
declare interface Window_GameEnd extends Window_Command {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 */
	makeCommandList(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Window_DebugRange
 * 
 * The window for selecting a block of switches/variables on the debug screen.
 */
declare interface Window_DebugRange extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	mode(index : number): string;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	topId(index : number): number;
		
	/**
	 * 
	 * @param index 
	 * @return  
	 */
	isSwitchMode(index : number): boolean;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isCancelTriggered(): boolean;
		
	/**
	 * 
	 */
	processCancel(): void;
		
	/**
	 * 
	 * @param editWindow 
	 */
	setEditWindow(editWindow : /* Window_DebugRange.prototype.+Window_DebugEdit */ any): void;
		
	/**
	 * 
	 */
	lastTopRow : number;
		
	/**
	 * 
	 */
	lastIndex : number;
}

/**
 * -----------------------------------------------------------------------------
 * Window_DebugEdit
 * 
 * The window for displaying switches and variables on the debug screen.
 */
declare interface Window_DebugEdit extends Window_Selectable {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 * @param rect 
	 */
	initialize(rect : any): void;
		
	/**
	 * 
	 * @return  
	 */
	maxItems(): number;
		
	/**
	 * 
	 * @param index 
	 */
	drawItem(index : number): void;
		
	/**
	 * 
	 * @param dataId 
	 */
	itemName(dataId : number): void;
		
	/**
	 * 
	 * @param dataId 
	 * @return  
	 */
	itemStatus(dataId : number): string;
		
	/**
	 * 
	 * @param mode 
	 */
	setMode(mode : string): void;
		
	/**
	 * 
	 * @param id 
	 */
	setTopId(id : number): void;
		
	/**
	 * 
	 * @return  
	 */
	currentId(): number;
		
	/**
	 * 
	 */
	update(): void;
		
	/**
	 * 
	 */
	updateSwitch(): void;
		
	/**
	 * 
	 */
	updateVariable(): void;
		
	/**
	 * 
	 * @return  
	 */
	deltaForVariable(): number;
		
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
	_mode : string;
		
	/**
	 * 
	 */
	_topId : number;
		
	/**
	 * 
	 */
	downArrowVisible : boolean;
		
	/**
	 * 
	 */
	upArrowVisible : boolean;
		
	/**
	 * 
	 */
	openness : number;
}

/**
 * 
 */
declare var Bitmap : {
		
	/**
	 * 
	 */
	paintOpacity : number;
}
