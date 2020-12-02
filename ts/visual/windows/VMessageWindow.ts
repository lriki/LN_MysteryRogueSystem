import { assert } from "ts/Common";
import { LMessage } from "ts/objects/LMessage";


interface TextState {
    text: string;
    index: number;
    x: number;
    y: number;
    width: number;
    height: number;
    startX: number;
    startY: number;
    rtl: boolean;
    buffer: string;
    drawing: boolean;
    outputWidth: number;
    outputHeight: number;
}

/**
 * see LMessage
 */
export class VMessageWindow extends Window_Base {
    private _message: LMessage;
    private _background: number = 0;
    private _positionType: number = 2;
    private _waitCount: number = 0;
    private _faceBitmap: Bitmap | undefined;
    private _textState: TextState | undefined;
    private _showFast: boolean = false;
    private _lineShowFast: boolean = false;
    private _pauseSkip: boolean = false;
    private _goldWindow: Window_Gold | undefined;
    private _nameBoxWindow: Window_NameBox | undefined;
    private _choiceListWindow: Window_ChoiceList | undefined;
    private _numberInputWindow: Window_NumberInput | undefined;
    private _eventItemWindow: Window_EventItem | undefined;

    private _autoCloseCount: number = 0;
    private _lineSpriteCache: Sprite[] = [];
    private _lineSpriteView: Sprite[] = [];

    constructor(message: LMessage, rect: Rectangle) {
        super(rect);
        this._message = message;
        this.openness = 0;
        this.initMembers();
    }
    
    private initMembers() {
        this._background = 0;
        this._positionType = 2;
        this._waitCount = 0;
        this._faceBitmap = undefined;
        this._textState = undefined;
        this._goldWindow = undefined;
        this._nameBoxWindow = undefined;
        this._choiceListWindow = undefined;
        this._numberInputWindow = undefined;
        this._eventItemWindow = undefined;
        this._autoCloseCount = 0;
        this.clearFlags();
    }
    
    setGoldWindow(goldWindow: Window_Gold) {
        this._goldWindow = goldWindow;
    }
    
    setNameBoxWindow(nameBoxWindow: Window_NameBox) {
        this._nameBoxWindow = nameBoxWindow;
    }
    
    setChoiceListWindow(choiceListWindow: Window_ChoiceList) {
        this._choiceListWindow = choiceListWindow;
    }
    
    setNumberInputWindow(numberInputWindow: Window_NumberInput) {
        this._numberInputWindow = numberInputWindow;
    }
    
    setEventItemWindow(eventItemWindow: Window_EventItem) {
        this._eventItemWindow = eventItemWindow;
    }
    
    private clearFlags() {
        this._showFast = false;
        this._lineShowFast = false;
        this._pauseSkip = false;
    }
    
    // override
    update() {
        this.checkToNotClose();
        Window_Base.prototype.update.call(this);
        this.synchronizeNameBox();
        while (!this.isOpening() && !this.isClosing()) {
            if (this.updateWait()) {
                return;
            } else if (this.updateLoading()) {
                return;
            } else if (this.updateInput()) {
                return;
            } else if (this.updateMessage()) {
                return;
            } else if (this.canStart()) {
                this.startMessage();
            } else {
                this.startInput();
                return;
            }
        }
    }
    
    private checkToNotClose() {
        if (this.isOpen() && this.isClosing() && this.doesContinue()) {
            this.open();
        }
    }
    
    private synchronizeNameBox() {
        if (this._nameBoxWindow) {
            this._nameBoxWindow.openness = this.openness;
        }
    }
    
    private canStart() {
        return this._message.hasText() && !this._message.scrollMode();
    }
    
    private startMessage() {
        const text = this._message.allText();
        const textState: TextState = (this.createTextState(text, 0, 0, 0) as TextState);
        textState.x = this.newLineX(textState);
        textState.startX = textState.x;
        this._textState = textState;
        this.newPage(this._textState);
        this.updatePlacement();
        this.updateBackground();
        this.open();
        if (this._nameBoxWindow) {
            this._nameBoxWindow.start();
        }
    }
    
    private newLineX(textState: TextState) {
        const faceExists = this._message.faceName() !== "";
        const faceWidth = ImageManager.faceWidth;
        const spacing = 20;
        const margin = faceExists ? faceWidth + spacing : 4;
        return textState.rtl ? this.innerWidth - margin : margin;
    }
    
    private updatePlacement() {
        const goldWindow = this._goldWindow;
        this._positionType = this._message.positionType();
        this.y = (this._positionType * (Graphics.boxHeight - this.height)) / 2;
        if (goldWindow) {
            goldWindow.y = this.y > 0 ? 0 : Graphics.boxHeight - goldWindow.height;
        }
    }
    
    private updateBackground() {
        this._background = this._message.background();
        this.setBackgroundType(this._background);
    }
    
    private terminateMessage() {
        this.close();
        if (this._goldWindow) {
            this._goldWindow.close();
        }
        this._message.clear();
    }
    
    private updateWait() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        } else {
            return false;
        }
    }
    
    private updateLoading() {
        if (this._faceBitmap) {
            if (this._faceBitmap.isReady()) {
                this.drawMessageFace();
                this._faceBitmap = undefined;
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
    
    private updateInput() {
        if (this.isAnySubWindowActive()) {
            return true;
        }

        if (this._autoCloseCount > 0) {
            this._autoCloseCount--;
            if (this._autoCloseCount == 0) {
                if (!this._textState) {
                    this.terminateMessage();
                }
            }
            return true;
        }

        if (this.pause) {
            if (this.isTriggered()) {
                Input.update();
                this.pause = false;
                if (!this._textState) {
                    this.terminateMessage();
                }
            }
            return true;
        }
        return false;
    }
    
    private isAnySubWindowActive() {
        return (
            (this._choiceListWindow && this._choiceListWindow.active) ||
            (this._numberInputWindow && this._numberInputWindow.active) ||
            (this._eventItemWindow && this._eventItemWindow.active)
        );
    }
    
    private updateMessage() {
        const textState = this._textState;
        if (textState) {
            while (!this.isEndOfText(textState)) {
                if (this.needsNewPage(textState)) {
                    this.newPage(textState);
                }
                this.updateShowFast();
                this.processCharacter(textState);
                if (this.shouldBreakHere(textState)) {
                    break;
                }
            }
            this.flushTextState(textState);
            if (this.isEndOfText(textState) && !this.pause) {
                this.onEndOfText();
            }
            return true;
        } else {
            return false;
        }
    }
    
    private shouldBreakHere(textState: TextState) {
        if (this.canBreakHere(textState)) {
            if (!this._showFast && !this._lineShowFast) {
                return true;
            }
            if (this.pause || this._waitCount > 0) {
                return true;
            }
        }
        return false;
    }
    
    private canBreakHere(textState: TextState) {
        if (!this.isEndOfText(textState)) {
            const c = textState.text[textState.index];
            if (c.charCodeAt(0) >= 0xdc00 && c.charCodeAt(0) <= 0xdfff) {
                // surrogate pair
                return false;
            }
            if (textState.rtl && c.charCodeAt(0) > 0x20) {
                return false;
            }
        }
        return true;
    }
    
    private onEndOfText() {
        if (!this.startInput()) {
            if (!this._pauseSkip) {
                this.startPause();
            } else {
                this.terminateMessage();
            }
        }
        this._textState = undefined;
    }
    
    private startInput(): boolean {
        if (this._choiceListWindow && this._message.isChoice()) {
            this._choiceListWindow.start();
            return true;
        } else if (this._numberInputWindow && this._message.isNumberInput()) {
            this._numberInputWindow.start();
            return true;
        } else if (this._eventItemWindow && this._message.isItemChoice()) {
            this._eventItemWindow.start();
            return true;
        } else {
            return false;
        }
    }
    
    private isTriggered(): boolean {
        return (
            Input.isRepeated("ok") ||
            Input.isRepeated("cancel") ||
            TouchInput.isRepeated()
        );
    }
    
    private doesContinue(): boolean {
        return (
            this._message.hasText() &&
            !this._message.scrollMode() &&
            !this.areSettingsChanged()
        );
    }
    
    private areSettingsChanged(): boolean {
        return (
            this._background !== this._message.background() ||
            this._positionType !== this._message.positionType()
        );
    }
    
    private updateShowFast() {
        if (this.isTriggered()) {
            this._showFast = true;
        }
    }
    
    private newPage(textState: TextState) {
        this.contents.clear();
        this.resetFontSettings();
        this.clearFlags();
        this.updateSpeakerName();
        this.loadMessageFace();
        textState.x = textState.startX;
        textState.y = 0;
        textState.height = this.calcTextHeight(textState);
    }
    
    private updateSpeakerName() {
        if (this._nameBoxWindow) {
            this._nameBoxWindow.setName(this._message.speakerName());
        }
    }
    
    private loadMessageFace() {
        this._faceBitmap = ImageManager.loadFace(this._message.faceName());
    }
    
    private drawMessageFace() {
        const faceName = this._message.faceName();
        const faceIndex = this._message.faceIndex();
        const rtl = this._message.isRTL();
        const width = ImageManager.faceWidth;
        const height = this.innerHeight;
        const x = rtl ? this.innerWidth - width - 4 : 4;
        this.drawFace(faceName, faceIndex, x, 0, width, height);
    }
    
    // override
    processControlCharacter(textState: TextState, c: string) {
        Window_Base.prototype.processControlCharacter.call(this, textState, c);
        if (c === "\f") {
            this.processNewPage(textState);
        }
    }
    
    // override
    processNewLine(textState: TextState) {
        this._lineShowFast = false;
        Window_Base.prototype.processNewLine.call(this, textState);
        if (this.needsNewPage(textState)) {
            // ウィンドウに収まらない行数のテキスト表示時の改ページウェイト
            this.startPause();
        }
    }
    
    private processNewPage(textState: TextState) {
        if (textState.text[textState.index] === "\n") {
            textState.index++;
        }
        textState.y = this.contents.height;
        this.startPause();
    }
    
    private isEndOfText(textState: TextState) {
        return textState.index >= textState.text.length;
    }
    
    private needsNewPage(textState: TextState) {
        return (
            !this.isEndOfText(textState) &&
            textState.y + textState.height > this.contents.height
        );
    }
    
    // override
    processEscapeCharacter(code: string, textState: TextState) {
        switch (code) {
            case "$":
                if (this._goldWindow) {
                    this._goldWindow.open();
                }
                break;
            case ".":
                this.startWait(15);
                break;
            case "|":
                this.startWait(60);
                break;
            case "!":
                this.startPause();
                break;
            case ">":
                this._lineShowFast = true;
                break;
            case "<":
                this._lineShowFast = false;
                break;
            case "^":
                this._pauseSkip = true;
                break;
            default:
                Window_Base.prototype.processEscapeCharacter.call(
                    this,
                    code,
                    textState
                );
                break;
        }
    }
    
    private startWait(count: number) {
        this._waitCount = count;
    }
    
    private startPause() {

        //console.log("TextState", this._textState);
        this.startWait(10);
        //this.pause = true;

        this._autoCloseCount = 30;
    }
    
    //private startPause() {
    //}


    private startNewLineScroll() {

    }

    private acquireLineSprite(): Sprite {
        if (this._lineSpriteCache.length > 0) {
            const sprite = this._lineSpriteCache.pop();
            assert(sprite);
            return sprite;
        }
        else {
            const bitmap = new Bitmap(this.width, this.lineHeight());
            const sprite = new Sprite(bitmap);
            return sprite;
        }
    }

    private releaseLineSprite(sprite: Sprite): void {
        this._lineSpriteCache.push(sprite);
    }
}
