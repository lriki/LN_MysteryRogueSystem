

export type ChoiceCallback = (n: number) => void;

/**
 * Game_Message 相当のクラス。
 * 
 * RMMZ コアスクリプトの Game_Message および Window_Message は単一ウィンドウを想定しており、
 * Game_Message のインスタンスはグローバル変数を前提として各種処理が作られている。
 * 
 * そのため RESystem のログウィンドウをメッセージウィンドウと別に作るには、
 * Game_Message と Window_Message 相当のクラスを自分で定義する必要がある。
 */
export class LMessage {
    private _texts: string[];
    private _choices: string[];
    private _speakerName: string;
    private _faceName: string;
    private _faceIndex: number;
    private _background: number;
    private _positionType: number;
    private _choiceDefaultType: number;
    private _choiceCancelType: number;
    private _choiceBackground: number;
    private _choicePositionType: number;
    private _numInputVariableId: number;
    private _numInputMaxDigits: number;
    private _itemChoiceVariableId: number;
    private _itemChoiceItypeId: number;
    private _scrollMode: boolean;
    private _scrollSpeed: number;
    private _scrollNoFast: boolean;
    private _choiceCallback: ChoiceCallback | undefined;

    // Game_Message.prototype.initialize
    constructor() {
        this._texts = [];
        this._choices = [];
        this._speakerName = "";
        this._faceName = "";
        this._faceIndex = 0;
        this._background = 0;
        this._positionType = 2;
        this._choiceDefaultType = 0;
        this._choiceCancelType = 0;
        this._choiceBackground = 0;
        this._choicePositionType = 2;
        this._numInputVariableId = 0;
        this._numInputMaxDigits = 0;
        this._itemChoiceVariableId = 0;
        this._itemChoiceItypeId = 0;
        this._scrollMode = false;
        this._scrollSpeed = 2;
        this._scrollNoFast = false;
        this._choiceCallback = undefined;
    }
        
    clear() {
        this._texts = [];
        this._choices = [];
        this._speakerName = "";
        this._faceName = "";
        this._faceIndex = 0;
        this._background = 0;
        this._positionType = 2;
        this._choiceDefaultType = 0;
        this._choiceCancelType = 0;
        this._choiceBackground = 0;
        this._choicePositionType = 2;
        this._numInputVariableId = 0;
        this._numInputMaxDigits = 0;
        this._itemChoiceVariableId = 0;
        this._itemChoiceItypeId = 0;
        this._scrollMode = false;
        this._scrollSpeed = 2;
        this._scrollNoFast = false;
        this._choiceCallback = undefined;
    }

    choices(): string[] {
        return this._choices;
    }

    speakerName(): string {
        return this._speakerName;
    }

    faceName(): string {
        return this._faceName;
    }

    faceIndex(): number {
        return this._faceIndex;
    }

    background(): number {
        return this._background;
    }

    positionType(): number {
        return this._positionType;
    }

    choiceDefaultType(): number {
        return this._choiceDefaultType;
    }

    choiceCancelType(): number {
        return this._choiceCancelType;
    }

    choiceBackground(): number {
        return this._choiceBackground;
    }

    choicePositionType(): number {
        return this._choicePositionType;
    }

    numInputVariableId(): number {
        return this._numInputVariableId;
    }

    numInputMaxDigits(): number {
        return this._numInputMaxDigits;
    }

    itemChoiceVariableId(): number {
        return this._itemChoiceVariableId;
    }

    itemChoiceItypeId(): number {
        return this._itemChoiceItypeId;
    }

    scrollMode(): boolean {
        return this._scrollMode;
    }

    scrollSpeed(): number {
        return this._scrollSpeed;
    }

    scrollNoFast(): boolean {
        return this._scrollNoFast;
    }

    add(text: string) {
        this._texts.push(text);
    }

    setSpeakerName(speakerName: string) {
        this._speakerName = speakerName ? speakerName : "";
    }

    setFaceImage(faceName: string, faceIndex: number) {
        this._faceName = faceName;
        this._faceIndex = faceIndex;
    }

    setBackground(background: number) {
        this._background = background;
    }

    setPositionType(positionType: number) {
        this._positionType = positionType;
    }

    setChoices(choices: string[], defaultType: number, cancelType: number) {
        this._choices = choices;
        this._choiceDefaultType = defaultType;
        this._choiceCancelType = cancelType;
    }

    setChoiceBackground(background: number) {
        this._choiceBackground = background;
    }

    setChoicePositionType(positionType: number) {
        this._choicePositionType = positionType;
    }

    setNumberInput(variableId: number, maxDigits: number) {
        this._numInputVariableId = variableId;
        this._numInputMaxDigits = maxDigits;
    }

    setItemChoice(variableId: number, itemType: number) {
        this._itemChoiceVariableId = variableId;
        this._itemChoiceItypeId = itemType;
    }

    setScroll(speed: number, noFast: boolean) {
        this._scrollMode = true;
        this._scrollSpeed = speed;
        this._scrollNoFast = noFast;
    }

    setChoiceCallback(callback: ChoiceCallback) {
        this._choiceCallback = callback;
    }

    onChoice(n: number) {
        if (this._choiceCallback) {
            this._choiceCallback(n);
            this._choiceCallback = undefined;
        }
    }

    hasText() {
        return this._texts.length > 0;
    }

    isChoice() {
        return this._choices.length > 0;
    }

    isNumberInput() {
        return this._numInputVariableId > 0;
    }

    isItemChoice() {
        return this._itemChoiceVariableId > 0;
    }

    isBusy() {
        return (
            this.hasText() ||
            this.isChoice() ||
            this.isNumberInput() ||
            this.isItemChoice()
        );
    }

    newPage() {
        if (this._texts.length > 0) {
            this._texts[this._texts.length - 1] += "\f";
        }
    }

    allText() {
        return this._texts.join("\n");
    }

    isRTL() {
        return Utils.containsArabic(this.allText());
    }

}

