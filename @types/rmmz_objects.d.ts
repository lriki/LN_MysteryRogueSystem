import * as PIXI from "pixi.js";


declare global {


/**
 * -----------------------------------------------------------------------------
 * Game_Event
 * 
 * The game object class for an event. It contains functionality for event page
 * switching and running parallel process events.
 */
export class Game_Event extends Game_Character {

    constructor(mapId: any, eventId: any);

    /**
     * 
     * @param mapId 
     * @param eventId 
     */
    //initialize(mapId: any, eventId: any): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @return  
     */
    eventId(): number;

    /**
     * 
     */
    event(): IDataMapEvent;

    /**
     * 
     */
    page(): IDataMapEventPage;

    /**
     * 
     */
    list(): IDataList[];

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithCharacters(x: any, y: any): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithEvents(x: any, y: any): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithPlayerCharacters(x: any, y: any): boolean;

    /**
     * 
     */
    lock(): void;

    /**
     * 
     */
    unlock(): void;

    /**
     * 
     */
    updateStop(): void;

    /**
     * 
     */
    updateSelfMovement(): void;

    /**
     * 
     * @return  
     */
    stopCountThreshold(): number;

    /**
     * 
     */
    moveTypeRandom(): void;

    /**
     * 
     */
    moveTypeTowardPlayer(): void;

    /**
     * 
     * @return  
     */
    isNearThePlayer(): boolean;

    /**
     * 
     */
    moveTypeCustom(): void;

    /**
     * 
     * @return  
     */
    isStarting(): /* !this._starting */ any;

    /**
     * 
     */
    clearStartingFlag(): void;

    /**
     * 
     * @param triggers 
     * @return  
     */
    isTriggerIn(triggers: Game_Event.prototype.IsTriggerIn0): boolean;

    /**
     * 
     */
    start(): void;

    /**
     * 
     */
    erase(): void;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @return  
     */
    findProperPageIndex(): number;

    /**
     * 
     * @param page 
     * @return  
     */
    meetsConditions(page: any): boolean;

    /**
     * 
     */
    setupPage(): void;

    /**
     * 
     */
    clearPageSettings(): void;

    /**
     * 
     */
    setupPageSettings(): void;

    /**
     * 
     * @return  
     */
    isOriginalPattern(): boolean;

    /**
     * 
     */
    resetPattern(): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    //checkEventTriggerTouch(x: any, y: any): void;

    /**
     * 
     */
    checkEventTriggerAuto(): void;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateParallel(): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    locate(x: number, y: number): void;

    /**
     * 
     * @param moveRoute 
     */
    forceMoveRoute(moveRoute: any): void;

    /**
     * 
     */
    _moveRouteForcing: boolean;

    /**
     * 
     */
    _moveRouteIndex: number;

    /**
     * 
     */
    _originalMoveRouteIndex: number;

    /**
     * 
     */
    _waitCount: number;

    /**
     * 
     */
    _x: number;

    /**
     * 
     */
    _y: number;

    /**
     * 
     */
    _realX: number;

    /**
     * 
     */
    _realY: number;

    /**
     * 
     */
    _moveSpeed: number;

    /**
     * 
     */
    _moveFrequency: number;

    /**
     * 
     */
    _opacity: number;

    /**
     * 
     */
    _blendMode: number;

    /**
     * 
     */
    _direction: number;

    /**
     * 
     */
    _pattern: number;

    /**
     * 
     */
    _priorityType: number;

    /**
     * 
     */
    _tileId: number;

    /**
     * 
     */
    _characterName: string;

    /**
     * 
     */
    _characterIndex: number;

    /**
     * 
     */
    _isObjectCharacter: boolean;

    /**
     * 
     */
    _walkAnime: boolean;

    /**
     * 
     */
    _stepAnime: boolean;

    /**
     * 
     */
    _directionFix: boolean;

    /**
     * 
     */
    _through: boolean;

    /**
     * 
     */
    _transparent: boolean;

    /**
     * 
     */
    _bushDepth: number;

    /**
     * 
     */
    _animationId: number;

    /**
     * 
     */
    _balloonId: number;

    /**
     * 
     */
    _animationPlaying: boolean;

    /**
     * 
     */
    _balloonPlaying: boolean;

    /**
     * 
     */
    _animationCount: number;

    /**
     * 
     */
    _stopCount: number;

    /**
     * 
     */
    _jumpCount: number;

    /**
     * 
     */
    _jumpPeak: number;

    /**
     * 
     */
    _movementSuccess: boolean;

    /**
     * 
     */
    _moveType: number;

    /**
     * 
     */
    _trigger: number;

    /**
     * 
     */
    _starting: boolean;

    /**
     * 
     */
    _erased: boolean;

    /**
     * 
     */
    _pageIndex: number;

    /**
     * 
     */
    _originalPattern: number;

    /**
     * 
     */
    _originalDirection: number;

    /**
     * 
     */
    _prelockDirection: number;

    /**
     * 
     */
    _locked: boolean;
}


}
