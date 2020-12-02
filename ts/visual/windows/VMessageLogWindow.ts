import { assert } from "ts/Common";
import { LMessage } from "ts/objects/LMessage";
import { LMessageHistory } from "ts/objects/LMessageHistory";


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

interface TextLine {
    textState: TextState;
    sprite: Sprite;
}

/**
 */
export class VMessageLogWindow extends Window_Base {
    private _message: LMessageHistory;
    private _waitCount: number = 0;
    private _autoScroll: boolean = true;
    private _lastViewLineIndex: number = -1;
    private _autoScrollCount: number = 0;

    private _autoCloseCount: number = 0;
    private _lineSpriteCache: Sprite[] = [];
    private _textLines: TextLine[] = [];

    constructor(message: LMessageHistory, rect: Rectangle) {
        super(rect);
        this._message = message;
        this.openness = 0;
        this.initMembers();
    }
    
    private initMembers() {
        this._waitCount = 0;
        this._autoCloseCount = 0;
        this._autoScrollCount = 0;
    }
    
    // override
    update() {
        this.checkToNotClose();
        Window_Base.prototype.update.call(this);
        while (!this.isOpening() && !this.isClosing()) {
            if (this.updateWait()) {
                return;
            } else if (this.updateLoading()) {
                return;
            } else if (this.updateInput()) {
                return;
            } else if (this.updateAutoScroll()) {
                return;
            } else if (this.canScrollStart()) {
                this.startNewMessageAndScroll();
            } else {
                this.updateAutoClose();
                return;
            }
        }
    }

    private checkToNotClose() {
        if (this._autoScroll) {
            if (this.isOpen() && this.isClosing() && this.doesContinue()) {
                this.open();
            }
        }
    }
    
    private doesContinue(): boolean {
        // 今表示している終端行移行にもログ行が溜まっている場合は表示を続行したい
        return (
            this._message.hasText() &&
            this._lastViewLineIndex < this._message.texts().length - 1
        );
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
        return false;
    }

    private updateInput() {
        return false;
    }

    private updateAutoScroll(): boolean {
        if (this._autoScrollCount > 0) {
            this._autoScrollCount--;
            this._textLines.forEach(line => {
                line.sprite.y -= 1;
            });

            if (this._autoScrollCount == 0) {
                this._autoCloseCount = 60;
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }

    private startNewMessageAndScroll() {
        const text = this._message.texts()[this._lastViewLineIndex + 1];

        const textState: TextState = (this.createTextState(text, 0, 0, 0) as TextState);
        textState.x = this.newLineX(textState);
        textState.startX = textState.x;
        textState.y = 0;
        textState.height = this.calcTextHeight(textState);

        const lineSprite = this.acquireLineSprite();
        lineSprite.bitmap.clear();
        lineSprite.x = 0;
        lineSprite.height = textState.height;

        // 新しい行スプライトの追加位置
        const lastSprite = (this._textLines.length > 0) ? this._textLines[this._textLines.length - 1].sprite : undefined;
        if (lastSprite) {
            lineSprite.y = lastSprite.y + lastSprite.height;
        }
        else {
            lineSprite.y = 0;
        }

        const textLine: TextLine = {
            textState: textState,
            sprite: lineSprite,
        };
        this._textLines.push(textLine);

        this._autoScrollCount = 10;

        // Window_Message.updateMessage の処理
        {
            
            while (!this.isEndOfText(textState)) {
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
        }

        //this.open();
    }
    
    private newLineX(textState: TextState) {
        const margin = 4;
        return textState.rtl ? this.innerWidth - margin : margin;
    }

    private shouldBreakHere(textState: TextState) {
        if (this.canBreakHere(textState)) {
            // 基本的に、1行一気に書く
            return true;
        }
        else {
            return false;
        }
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

    private canScrollStart() {
        return this.doesContinue() && this._autoScroll;
    }
    
    
    private terminateMessage() {
        this.close();
        this._textLines.forEach(line => {
            this.releaseLineSprite(line.sprite);
        })
    }
    
    private onEndOfText() {
        // Window_Message.onEndOfText() では選択肢など入力の開始処理を行っていたが、ここでは不要
    }
    
    private updateShowFast() {
        // Window_Message.updateShowFast() ではキーが押されたら一度に書くことを始めていたが、ここでは不要
    }
    
    // override
    processControlCharacter(textState: TextState, c: string) {
        Window_Base.prototype.processControlCharacter.call(this, textState, c);
        if (c === "\f") {
            throw new Error("NewPage not supported.");
        }
    }
    
    private isEndOfText(textState: TextState) {
        return textState.index >= textState.text.length;
    }
    
    
    // override
    processEscapeCharacter(code: string, textState: TextState) {
        switch (code) {
            case "$":
                throw new Error("GoldWindow not supported.");
                break;
            case ".":
                this.startWait(15);
                break;
            case "|":
                this.startWait(60);
                break;
            case "!":
                throw new Error("StartPause not supported.");
                break;
            case ">":
                throw new Error("LineShowFast not supported.");
                break;
            case "<":
                throw new Error("LineShowFast not supported.");
                break;
            case "^":
                throw new Error("PauseSkip not supported.");
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

    private updateAutoClose() {
        if (this._autoCloseCount > 0) {
            this._autoCloseCount--;
            if (this._autoCloseCount <= 0) {
                this.close();
            }
        }
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
