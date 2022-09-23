import * as PIXI from "pixi.js";


declare global {

    
/**
 * -----------------------------------------------------------------------------
 * Game_Action
 * 
 * The game object class for a battle action.
 */
 export class Game_Action {

    initialize(subject: any, forcing: any): void;
    clear(): void;
    setSubject(subject: any): void;
    subject(): Game_Actor;
    friendsUnit(): Game_Party;
    opponentsUnit(): Game_Troop;
    setEnemyAction(action: any): void;
    setAttack(): void;
    setGuard(): void;
    setSkill(skillId: number): void;
    setItem(itemId: any): void;
    setItemObject(object: any): void;
    setTarget(targetIndex: number): void;
    item(): void;
    isSkill(): boolean;
    isItem(): boolean;
    numRepeats(): number;
    checkItemScope(list: number[]): boolean;
    isForOpponent(): boolean;
    isForFriend(): boolean;
    isForEveryone(): boolean;
    isForAliveFriend(): boolean;
    isForDeadFriend(): boolean;
    isForUser(): boolean;
    isForOne(): boolean;
    isForRandom(): boolean;
    isForAll(): boolean;
    needsSelection(): boolean;
    numTargets(): number;
    checkDamageType(list: number[]): boolean;
    isHpEffect(): boolean;
    isMpEffect(): boolean;
    isDamage(): boolean;
    isRecover(): boolean;
    isDrain(): boolean;
    isHpRecover(): boolean;
    isMpRecover(): boolean;
    isCertainHit(): boolean;
    isPhysical(): boolean;
    isMagical(): boolean;
    isAttack(): boolean;
    isGuard(): boolean;
    isMagicSkill(): boolean;
    decideRandomTarget(): void;
    setConfusion(): void;
    prepare(): void;
    isValid(): /* !this._forcing */ any;
    speed(): void;
    makeTargets(): any[];
    repeatTargets(targets: Game_Enemy[]): Array<any>;
    confusionTarget(): Game_Enemy;
    targetsForEveryone(): Game_Battler[];
    targetsForOpponents(): Game_Enemy[];
    targetsForFriends(): Game_Actor[];
    randomTargets(unit: Game_Troop): Game_Enemy[];
    targetsForDead(unit: Game_Party): Game_Enemy[];
    targetsForAlive(unit: Game_Party | Game_Troop): Game_Enemy[];
    targetsForDeadAndAlive(unit: Game_Party): Game_Battler[];
    evaluate(): number;
    itemTargetCandidates(): Game_Actor[];
    evaluateWithTarget(target: Game_Actor): number;
    testApply(target: Game_Actor): boolean;
    testLifeAndDeath(target: Game_Actor): boolean;
    hasItemAnyValidEffects(target: Game_Actor): void;
    testItemEffect(target: Game_Actor, effect: any): boolean;
    itemCnt(target: any):  /* error */ any;
    itemMrf(target: any):  /* error */ any;
    itemHit(): number;
    itemEva(target: Game_Actor):  /* error */ any;
    itemCri(target: Game_Actor): number;
    apply(target: Game_Actor): void;
    makeDamageValue(target: Game_Actor, critical: boolean): number;
    evalDamageFormula(target: Game_Actor): number;
    calcElementRate(target: Game_Actor): number;
    elementsMaxRate(target: Game_Actor, elements: Game_Action.prototype.ElementsMaxRate1): number[];
    applyCritical(damage: number): number;
    applyVariance(damage: number, variance: any): number;
    applyGuard(damage: number, target: Game_Actor): number;
    executeDamage(target: Game_Actor, value: number): void;
    executeHpDamage(target: Game_Actor, value: number): void;
    executeMpDamage(target: Game_Actor, value: number): void;
    gainDrainedHp(value: number): void;
    gainDrainedMp(value: number): void;
    applyItemEffect(target: Game_Actor, effect: any): void;
    itemEffectRecoverHp(target: Game_Actor, effect: any): void;
    itemEffectRecoverMp(target: Game_Actor, effect: any): void;
    itemEffectGainTp(target: Game_Actor, effect: any): void;
    itemEffectAddState(target: Game_Actor, effect: any): void;
    itemEffectAddAttackState(target: Game_Actor, effect: any): void;
    itemEffectAddNormalState(target: Game_Actor, effect: any): void;
    itemEffectRemoveState(target: Game_Actor, effect: any): void;
    itemEffectAddBuff(target: Game_Actor, effect: any): void;
    itemEffectAddDebuff(target: Game_Actor, effect: any): void;
    itemEffectRemoveBuff(target: Game_Actor, effect: any): void;
    itemEffectRemoveDebuff(target: Game_Actor, effect: any): void;
    itemEffectSpecial(target: Game_Actor, effect: any): void;
    itemEffectGrow(target: Game_Actor, effect: any): void;
    itemEffectLearnSkill(target: Game_Actor, effect: any): void;
    itemEffectCommonEvent(): void;
    makeSuccess(target: Game_Actor): void;
    applyItemUserEffect(): void;
    lukEffectRate(target: Game_Actor): number;
    applyGlobal(): void;
    updateLastUsed(): void;
    updateLastSubject(): void;
    updateLastTarget(target: Game_Actor): void;

    static EFFECT_RECOVER_HP: number;
    static EFFECT_RECOVER_MP: number;
    static EFFECT_GAIN_TP: number;
    static EFFECT_ADD_STATE: number;
    static EFFECT_REMOVE_STATE: number;
    static EFFECT_ADD_BUFF: number;
    static EFFECT_ADD_DEBUFF: number;
    static EFFECT_REMOVE_BUFF: number;
    static EFFECT_REMOVE_DEBUFF: number;
    static EFFECT_SPECIAL: number;
    static EFFECT_GROW: number;
    static EFFECT_LEARN_SKILL: number;
    static EFFECT_COMMON_EVENT: number;
    static SPECIAL_EFFECT_ESCAPE: number;
    static HITTYPE_CERTAIN: number;
    static HITTYPE_PHYSICAL: number;
    static HITTYPE_MAGICAL: number;

    _subjectActorId: number;
    _subjectEnemyIndex: number;
    _forcing: boolean;
    _targetIndex: number;
}

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

    _mapId: number;
}


}
