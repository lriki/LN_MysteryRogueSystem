// Type definitions for rmmz_objects.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace Game_Temp.prototype {
    // Game_Temp.prototype.retrieveAnimation.!ret

    /**
     * 
     */
    interface RetrieveAnimationRet {

        /**
         * 
         */
        mirror: boolean;

        /**
         * 
         */
        targets: /* Game_Temp._animationQueue.<i>.targets */ any;
    }
}
declare namespace Game_SelfSwitches.prototype {
    // Game_SelfSwitches.prototype.value.!0
    type Value0 = Array</* number,number,? */ any>;
}
declare namespace Game_SelfSwitches.prototype {
    // Game_SelfSwitches.prototype.setValue.!0
    type SetValue0 = Array</* number,number,? */ any>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.checkItemScope.!0
    type CheckItemScope0 = Array<number>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.checkDamageType.!0
    type CheckDamageType0 = Array<number>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.makeTargets.!ret
    type MakeTargetsRet = Array<any>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.repeatTargets.!0
    type RepeatTargets0 = Array<Game_Enemy>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.targetsForOpponents.!ret
    type TargetsForOpponentsRet = Array<Game_Enemy>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.targetsForFriends.!ret
    type TargetsForFriendsRet = Array<Game_Actor>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.randomTargets.!ret
    type RandomTargetsRet = Array<Game_Enemy>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.targetsForDead.!ret
    type TargetsForDeadRet = Array<Game_Enemy>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.targetsForDeadAndAlive.!ret
    type TargetsForDeadAndAliveRet = Array<any>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.itemTargetCandidates.!ret
    type ItemTargetCandidatesRet = Array<Game_Actor>;
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.elementsMaxRate.!1
    type ElementsMaxRate1 = Array<number>;
}
declare namespace Game_ActionResult.prototype {
    // Game_ActionResult.prototype.addedStateObjects.!ret
    type AddedStateObjectsRet = Array<any>;
}
declare namespace Game_ActionResult.prototype {
    // Game_ActionResult.prototype.removedStateObjects.!ret
    type RemovedStateObjectsRet = Array<any>;
}
declare namespace Game_BattlerBase.prototype {
    // Game_BattlerBase.prototype.states.!ret
    type StatesRet = Array<any>;
}
declare namespace Game_BattlerBase.prototype {
    // Game_BattlerBase.prototype.stateIcons.!ret
    type StateIconsRet = Array<any>;
}
declare namespace Game_BattlerBase.prototype {
    // Game_BattlerBase.prototype.buffIcons.!ret
    type BuffIconsRet = Array<number>;
}
declare namespace Game_BattlerBase.prototype {
    // Game_BattlerBase.prototype.allTraits.!ret
    type AllTraitsRet = Array<any>;
}
declare namespace Game_BattlerBase.prototype {
    // Game_BattlerBase.prototype.actionPlusSet.!ret
    type ActionPlusSetRet = Array<any>;
}
declare namespace Game_Actor.prototype {
    // Game_Actor.prototype.equipSlots.!ret
    type EquipSlotsRet = Array<number>;
}
declare namespace Game_Actor.prototype {
    // Game_Actor.prototype.equips.!ret
    type EquipsRet = Array<any>;
}
declare namespace Game_Actor.prototype {
    // Game_Actor.prototype.skills.!ret
    type SkillsRet = Array<any>;
}
declare namespace Game_Actor.prototype {
    // Game_Actor.prototype.makeActionList.!ret
    type MakeActionListRet = Array<Game_Action>;
}
declare namespace Game_Unit.prototype {
    // Game_Unit.prototype.members.!ret
    type MembersRet = Array<any>;
}
declare namespace Game_Unit.prototype {
    // Game_Unit.prototype.movableMembers.!ret
    type MovableMembersRet = Array<Game_Actor>;
}
declare namespace Game_Party.prototype {
    // Game_Party.prototype.items.!ret
    type ItemsRet = Array<any>;
}
declare namespace Game_Party.prototype {
    // Game_Party.prototype.weapons.!ret
    type WeaponsRet = Array<any>;
}
declare namespace Game_Party.prototype {
    // Game_Party.prototype.armors.!ret
    type ArmorsRet = Array<any>;
}
declare namespace Game_Party.prototype {
    // Game_Party.prototype.charactersForSavefile.!ret
    type CharactersForSavefileRet = Array<Game_Party.prototype.charactersForSavefile.CharactersForSavefileRetI>;
}
declare namespace Game_Party.prototype.charactersForSavefile {
    // Game_Party.prototype.charactersForSavefile.!ret.<i>
    type CharactersForSavefileRetI = Array</* string,number */ any>;
}
declare namespace Game_Party.prototype {
    // Game_Party.prototype.facesForSavefile.!ret
    type FacesForSavefileRet = Array<Game_Party.prototype.facesForSavefile.FacesForSavefileRetI>;
}
declare namespace Game_Party.prototype.facesForSavefile {
    // Game_Party.prototype.facesForSavefile.!ret.<i>
    type FacesForSavefileRetI = Array</* string,number */ any>;
}
declare namespace Game_Troop.prototype {
    // Game_Troop.prototype.enemyNames.!ret
    type EnemyNamesRet = Array<any>;
}
declare namespace Game_Troop.prototype {
    // Game_Troop.prototype.makeDropItems.!ret
    type MakeDropItemsRet = Array<any>;
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.tilesetFlags.!ret
    type TilesetFlagsRet = Array<any>;
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.canvasToMapX.!0
    type CanvasToMapX0 = number;
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.canvasToMapY.!0
    type CanvasToMapY0 = number;
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.layeredTiles.!ret
    type LayeredTilesRet = Array<number>;
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.allTiles.!ret
    type AllTilesRet = Array<number>;
}
declare namespace Game_Interpreter.prototype {
    // Game_Interpreter.prototype.iterateActorId.!1
    type IterateActorId1 = ((battler: Game_Actor) => void);
}
declare namespace Game_Interpreter.prototype {
    // Game_Interpreter.prototype.iterateActorEx.!2
    type IterateActorEx2 = ((actor: Game_Actor) => void);
}
declare namespace Game_Interpreter.prototype {
    // Game_Interpreter.prototype.picturePoint.!ret

    /**
     * 
     */
    interface PicturePointRet {

        /**
         * Designation with variables
         */
        x: number;

        /**
         * 
         */
        y: number;
    }
}
declare namespace Game_Temp {
    // Game_Temp._animationQueue.<i>

    /**
     * 
     */
    interface _animationQueueI {

        /**
         * 
         */
        targets: Array<Game_Enemy>;

        /**
         * 
         */
        mirror: boolean;
    }
}
declare namespace Game_Temp {
    // Game_Temp._balloonQueue.<i>

    /**
     * 
     */
    interface _balloonQueueI {

        /**
         * 
         */
        target: Game_Event;
    }
}
declare namespace Game_Temp.prototype {
    // Game_Temp.prototype.retrieveBalloon.!ret

    /**
     * 
     */
    interface RetrieveBalloonRet {

        /**
         * 
         */
        target: Game_Event;
    }
}
declare namespace Game_Temp.prototype {
    // Game_Temp.prototype.requestAnimation.!0

    /**
     * 
     */
    interface RequestAnimation0 {
    }
}
declare namespace Game_Action.prototype {
    // Game_Action.prototype.targetsForEveryone.!ret

    /**
     * 
     */
    interface TargetsForEveryoneRet {
    }
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.vehicles.!ret

    /**
     * 
     */
    interface VehiclesRet {
    }
}
declare namespace Game_Map.prototype {
    // Game_Map.prototype.events.!ret

    /**
     * 
     */
    interface EventsRet {
    }
}
declare namespace Game_Followers.prototype {
    // Game_Followers.prototype.visibleFollowers.!ret

    /**
     * 
     */
    interface VisibleFollowersRet {
    }
}

/**
 * -----------------------------------------------------------------------------
 * Game_Temp
 * 
 * The game object class for temporary data that is not included in save data.
 */
declare class Game_Temp {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @return  
     */
    isPlaytest(): /* !this._isPlaytest */ any;

    /**
     * 
     * @param x 
     * @param y 
     */
    setDestination(x: number, y: number): void;

    /**
     * 
     */
    clearDestination(): void;

    /**
     * 
     * @return  
     */
    isDestinationValid(): boolean;

    /**
     * 
     * @return  
     */
    destinationX(): /* !this._destinationX */ any;

    /**
     * 
     * @return  
     */
    destinationY(): /* !this._destinationY */ any;

    /**
     * 
     * @param target 
     * @param state 
     */
    setTouchState(target: any, state: string): void;

    /**
     * 
     */
    clearTouchState(): void;

    /**
     * 
     * @return  
     */
    touchTarget(): /* !this._touchTarget */ any;

    /**
     * 
     * @return  
     */
    touchState(): /* !this._touchState */ any;

    /**
     * 
     */
    requestBattleRefresh(): void;

    /**
     * 
     */
    clearBattleRefreshRequest(): void;

    /**
     * 
     * @return  
     */
    isBattleRefreshRequested(): /* !this._needsBattleRefresh */ any;

    /**
     * 
     * @param commonEventId 
     */
    reserveCommonEvent(commonEventId: any): void;

    /**
     * 
     */
    retrieveCommonEvent(): void;

    /**
     * 
     * @return  
     */
    isCommonEventReserved(): boolean;

    /**
     * prettier-ignore
     * @param targets 
     * @param animationId 
     * @param mirror 
     */
    requestAnimation(targets: Array<Game_Player> | Array<Game_Enemy> | RequestAnimation0, animationId: any, mirror: boolean): void;

    /**
     * 
     * @return  
     */
    retrieveAnimation(): Game_Temp.prototype.RetrieveAnimationRet;

    /**
     * 
     * @param target 
     * @param balloonId 
     */
    requestBalloon(target: Game_Player, balloonId: any): void;

    /**
     * 
     * @return  
     */
    retrieveBalloon(): Game_Temp.prototype.RetrieveBalloonRet;

    /**
     * 
     * @param type 
     * @return  
     */
    lastActionData(type: any): /* !this._lastActionData.<i> */ any;

    /**
     * 
     * @param type 
     * @param value 
     */
    setLastActionData(type: number, value: number): void;

    /**
     * 
     * @param skillID 
     */
    setLastUsedSkillId(skillID: any): void;

    /**
     * 
     * @param itemID 
     */
    setLastUsedItemId(itemID: any): void;

    /**
     * 
     * @param actorID 
     */
    setLastSubjectActorId(actorID: number): void;

    /**
     * 
     * @param enemyIndex 
     */
    setLastSubjectEnemyIndex(enemyIndex: number): void;

    /**
     * 
     * @param actorID 
     */
    setLastTargetActorId(actorID: any): void;

    /**
     * 
     * @param enemyIndex 
     */
    setLastTargetEnemyIndex(enemyIndex: any): void;

    /**
     * 
     */
    _isPlaytest: boolean;

    /**
     * 
     */
    _destinationX: number;

    /**
     * 
     */
    _destinationY: number;

    /**
     * 
     */
    _touchState: string;

    /**
     * 
     */
    _needsBattleRefresh: boolean;

    /**
     * 
     */
    _commonEventQueue: Array<any>;

    /**
     * 
     */
    _animationQueue: Array</* Game_Temp._animationQueueI */ any>;

    /**
     * 
     */
    _balloonQueue: Array</* Game_Temp._balloonQueueI */ any>;

    /**
     * 
     */
    _lastActionData: Array<number>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_System
 * 
 * The game object class for the system data.
 */
declare class Game_System {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    isJapanese(): void;

    /**
     * 
     */
    isChinese(): void;

    /**
     * 
     */
    isKorean(): void;

    /**
     * 
     */
    isCJK(): void;

    /**
     * 
     */
    isRussian(): void;

    /**
     * 
     */
    isSideView(): void;

    /**
     * 
     */
    isAutosaveEnabled(): void;

    /**
     * 
     * @return  
     */
    isSaveEnabled(): /* !this._saveEnabled */ any;

    /**
     * 
     */
    disableSave(): void;

    /**
     * 
     */
    enableSave(): void;

    /**
     * 
     * @return  
     */
    isMenuEnabled(): /* !this._menuEnabled */ any;

    /**
     * 
     */
    disableMenu(): void;

    /**
     * 
     */
    enableMenu(): void;

    /**
     * 
     * @return  
     */
    isEncounterEnabled(): /* !this._encounterEnabled */ any;

    /**
     * 
     */
    disableEncounter(): void;

    /**
     * 
     */
    enableEncounter(): void;

    /**
     * 
     * @return  
     */
    isFormationEnabled(): /* !this._formationEnabled */ any;

    /**
     * 
     */
    disableFormation(): void;

    /**
     * 
     */
    enableFormation(): void;

    /**
     * 
     * @return  
     */
    battleCount(): /* !this._battleCount */ any;

    /**
     * 
     * @return  
     */
    winCount(): /* !this._winCount */ any;

    /**
     * 
     * @return  
     */
    escapeCount(): /* !this._escapeCount */ any;

    /**
     * 
     * @return  
     */
    saveCount(): /* !this._saveCount */ any;

    /**
     * 
     * @return  
     */
    versionId(): /* !this._versionId */ any;

    /**
     * 
     * @return  
     */
    savefileId(): /* !this._savefileId */ any;

    /**
     * 
     * @param savefileId 
     */
    setSavefileId(savefileId: number): void;

    /**
     * 
     * @return  
     */
    windowTone(): /* !this._windowTone */ any;

    /**
     * 
     * @param value 
     */
    setWindowTone(value: any): void;

    /**
     * 
     * @return  
     */
    battleBgm(): /* !this._battleBgm */ any;

    /**
     * 
     * @param value 
     */
    setBattleBgm(value: any): void;

    /**
     * 
     * @return  
     */
    victoryMe(): /* !this._victoryMe */ any;

    /**
     * 
     * @param value 
     */
    setVictoryMe(value: any): void;

    /**
     * 
     * @return  
     */
    defeatMe(): /* !this._defeatMe */ any;

    /**
     * 
     * @param value 
     */
    setDefeatMe(value: any): void;

    /**
     * 
     */
    onBattleStart(): void;

    /**
     * 
     */
    onBattleWin(): void;

    /**
     * 
     */
    onBattleEscape(): void;

    /**
     * 
     */
    onBeforeSave(): void;

    /**
     * 
     */
    onAfterLoad(): void;

    /**
     * 
     * @return  
     */
    playtime(): number;

    /**
     * 
     * @return  
     */
    playtimeText(): string;

    /**
     * 
     */
    saveBgm(): void;

    /**
     * 
     */
    replayBgm(): void;

    /**
     * 
     */
    saveWalkingBgm(): void;

    /**
     * 
     */
    replayWalkingBgm(): void;

    /**
     * 
     */
    saveWalkingBgm2(): void;

    /**
     * 
     * @return  
     */
    mainFontFace(): string;

    /**
     * 
     * @return  
     */
    numberFontFace(): string;

    /**
     * 
     */
    mainFontSize(): void;

    /**
     * 
     * @return  
     */
    windowPadding(): number;

    /**
     * 
     */
    _saveEnabled: boolean;

    /**
     * 
     */
    _menuEnabled: boolean;

    /**
     * 
     */
    _encounterEnabled: boolean;

    /**
     * 
     */
    _formationEnabled: boolean;

    /**
     * 
     */
    _battleCount: number;

    /**
     * 
     */
    _winCount: number;

    /**
     * 
     */
    _escapeCount: number;

    /**
     * 
     */
    _saveCount: number;

    /**
     * 
     */
    _versionId: number;

    /**
     * 
     */
    _savefileId: number;

    /**
     * 
     */
    _framesOnSave: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Timer
 * 
 * The game object class for the timer.
 */
declare class Game_Timer {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @param sceneActive 
     */
    update(sceneActive: any): void;

    /**
     * 
     * @param count 
     */
    start(count: number): void;

    /**
     * 
     */
    stop(): void;

    /**
     * 
     * @return  
     */
    isWorking(): /* !this._working */ any;

    /**
     * 
     * @return  
     */
    seconds(): number;

    /**
     * 
     */
    onExpire(): void;

    /**
     * 
     */
    _frames: number;

    /**
     * 
     */
    _working: boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Message
 * 
 * The game object class for the state of the message window that displays text
 * or selections, etc.
 */
declare class Game_Message {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @return  
     */
    choices(): /* !this._choices */ any;

    /**
     * 
     * @return  
     */
    speakerName(): /* !this._speakerName */ any;

    /**
     * 
     * @return  
     */
    faceName(): /* !this._faceName */ any;

    /**
     * 
     * @return  
     */
    faceIndex(): /* !this._faceIndex */ any;

    /**
     * 
     * @return  
     */
    background(): /* !this._background */ any;

    /**
     * 
     * @return  
     */
    positionType(): /* !this._positionType */ any;

    /**
     * 
     * @return  
     */
    choiceDefaultType(): /* !this._choiceDefaultType */ any;

    /**
     * 
     * @return  
     */
    choiceCancelType(): /* !this._choiceCancelType */ any;

    /**
     * 
     * @return  
     */
    choiceBackground(): /* !this._choiceBackground */ any;

    /**
     * 
     * @return  
     */
    choicePositionType(): /* !this._choicePositionType */ any;

    /**
     * 
     * @return  
     */
    numInputVariableId(): /* !this._numInputVariableId */ any;

    /**
     * 
     * @return  
     */
    numInputMaxDigits(): /* !this._numInputMaxDigits */ any;

    /**
     * 
     * @return  
     */
    itemChoiceVariableId(): /* !this._itemChoiceVariableId */ any;

    /**
     * 
     * @return  
     */
    itemChoiceItypeId(): /* !this._itemChoiceItypeId */ any;

    /**
     * 
     * @return  
     */
    scrollMode(): /* !this._scrollMode */ any;

    /**
     * 
     * @return  
     */
    scrollSpeed(): /* !this._scrollSpeed */ any;

    /**
     * 
     * @return  
     */
    scrollNoFast(): /* !this._scrollNoFast */ any;

    /**
     * 
     * @param text 
     */
    add(text: string): void;

    /**
     * 
     * @param speakerName 
     */
    setSpeakerName(speakerName: any): void;

    /**
     * 
     * @param faceName 
     * @param faceIndex 
     */
    setFaceImage(faceName: any, faceIndex: any): void;

    /**
     * 
     * @param background 
     */
    setBackground(background: any): void;

    /**
     * 
     * @param positionType 
     */
    setPositionType(positionType: any): void;

    /**
     * 
     * @param choices 
     * @param defaultType 
     * @param cancelType 
     */
    setChoices(choices: any, defaultType: number, cancelType: number): void;

    /**
     * 
     * @param background 
     */
    setChoiceBackground(background: number): void;

    /**
     * 
     * @param positionType 
     */
    setChoicePositionType(positionType: number): void;

    /**
     * 
     * @param variableId 
     * @param maxDigits 
     */
    setNumberInput(variableId: any, maxDigits: any): void;

    /**
     * 
     * @param variableId 
     * @param itemType 
     */
    setItemChoice(variableId: any, itemType: number): void;

    /**
     * 
     * @param speed 
     * @param noFast 
     */
    setScroll(speed: any, noFast: any): void;

    /**
     * 
     * @param callback 
     */
    setChoiceCallback(callback: () => void): void;

    /**
     * 
     * @param n 
     */
    onChoice(n: number): void;

    /**
     * 
     * @return  
     */
    hasText(): boolean;

    /**
     * 
     * @return  
     */
    isChoice(): boolean;

    /**
     * 
     * @return  
     */
    isNumberInput(): boolean;

    /**
     * 
     * @return  
     */
    isItemChoice(): boolean;

    /**
     * 
     * @return  
     */
    isBusy(): boolean;

    /**
     * 
     */
    newPage(): void;

    /**
     * 
     * @return  
     */
    allText(): string;

    /**
     * 
     * @return  
     */
    isRTL(): boolean;

    /**
     * 
     */
    _texts: Array<string>;

    /**
     * 
     */
    _choices: Array<any>;

    /**
     * 
     */
    _speakerName: string;

    /**
     * 
     */
    _faceName: string;

    /**
     * 
     */
    _faceIndex: number;

    /**
     * 
     */
    _background: number;

    /**
     * 
     */
    _positionType: number;

    /**
     * 
     */
    _choiceDefaultType: number;

    /**
     * 
     */
    _choiceCancelType: number;

    /**
     * 
     */
    _choiceBackground: number;

    /**
     * 
     */
    _choicePositionType: number;

    /**
     * 
     */
    _numInputVariableId: number;

    /**
     * 
     */
    _numInputMaxDigits: number;

    /**
     * 
     */
    _itemChoiceVariableId: number;

    /**
     * 
     */
    _itemChoiceItypeId: number;

    /**
     * 
     */
    _scrollMode: boolean;

    /**
     * 
     */
    _scrollSpeed: number;

    /**
     * 
     */
    _scrollNoFast: boolean;

    /**
     * 
     * @param n 
     */
    _choiceCallback(n: number): void;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Switches
 * 
 * The game object class for switches.
 */
declare class Game_Switches {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @param switchId 
     * @return  
     */
    value(switchId: number): boolean;

    /**
     * 
     * @param switchId 
     * @param value 
     */
    setValue(switchId: number, value: boolean): void;

    /**
     * 
     */
    onChange(): void;

    /**
     * 
     */
    _data: Array<boolean>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Variables
 * 
 * The game object class for variables.
 */
declare class Game_Variables {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @param variableId 
     * @return  
     */
    value(variableId: number): /* !this._data.<i> */ any;

    /**
     * 
     * @param variableId 
     * @param value 
     */
    setValue(variableId: number, value: number): void;

    /**
     * 
     */
    onChange(): void;

    /**
     * 
     */
    _data: Array<number>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_SelfSwitches
 * 
 * The game object class for self switches.
 */
declare class Game_SelfSwitches {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @param key 
     * @param undefined 
     * @param undefined 
     * @return  
     */
    value(key: Game_SelfSwitches.prototype.Value0, param2: any, param3: /* ?] */ any): boolean;

    /**
     * 
     * @param key 
     * @param undefined 
     * @param undefined 
     * @param value 
     */
    setValue(key: Game_SelfSwitches.prototype.SetValue0, param2: number, param3: /* ?] */ any, value: boolean): void;

    /**
     * 
     */
    onChange(): void;

    /**
     * 
     */
    _data: {
    }
}

/**
 * -----------------------------------------------------------------------------
 * Game_Screen
 * 
 * The game object class for screen effect data, such as changes in color tone
 * and flashes.
 */
declare class Game_Screen {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     */
    onBattleStart(): void;

    /**
     * 
     * @return  
     */
    brightness(): /* !this._brightness */ any;

    /**
     * 
     * @return  
     */
    tone(): /* !this._tone */ any;

    /**
     * 
     * @return  
     */
    flashColor(): /* !this._flashColor */ any;

    /**
     * 
     * @return  
     */
    shake(): /* !this._shake */ any;

    /**
     * 
     * @return  
     */
    zoomX(): /* !this._zoomX */ any;

    /**
     * 
     * @return  
     */
    zoomY(): /* !this._zoomY */ any;

    /**
     * 
     * @return  
     */
    zoomScale(): /* !this._zoomScale */ any;

    /**
     * 
     * @return  
     */
    weatherType(): /* !this._weatherType */ any;

    /**
     * 
     * @return  
     */
    weatherPower(): /* !this._weatherPower */ any;

    /**
     * 
     * @param pictureId 
     * @return  
     */
    picture(pictureId: any): /* !this._pictures.<i> */ any;

    /**
     * 
     * @param pictureId 
     * @return  
     */
    realPictureId(pictureId: any): any;

    /**
     * 
     */
    clearFade(): void;

    /**
     * 
     */
    clearTone(): void;

    /**
     * 
     */
    clearFlash(): void;

    /**
     * 
     */
    clearShake(): void;

    /**
     * 
     */
    clearZoom(): void;

    /**
     * 
     */
    clearWeather(): void;

    /**
     * 
     */
    clearPictures(): void;

    /**
     * 
     */
    eraseBattlePictures(): void;

    /**
     * 
     * @return  
     */
    maxPictures(): number;

    /**
     * 
     * @param duration 
     */
    startFadeOut(duration: number): void;

    /**
     * 
     * @param duration 
     */
    startFadeIn(duration: number): void;

    /**
     * 
     * @param tone 
     * @param duration 
     */
    startTint(tone: any, duration: any): void;

    /**
     * 
     * @param color 
     * @param duration 
     */
    startFlash(color: Array<number>, duration: number): void;

    /**
     * 
     * @param power 
     * @param speed 
     * @param duration 
     */
    startShake(power: number, speed: number, duration: number): void;

    /**
     * 
     * @param x 
     * @param y 
     * @param scale 
     * @param duration 
     */
    startZoom(x: any, y: any, scale: any, duration: any): void;

    /**
     * 
     * @param x 
     * @param y 
     * @param scale 
     */
    setZoom(x: number, y: number, scale: number): void;

    /**
     * 
     * @param type 
     * @param power 
     * @param duration 
     */
    changeWeather(type: any, power: any, duration: any): void;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateFadeOut(): void;

    /**
     * 
     */
    updateFadeIn(): void;

    /**
     * 
     */
    updateTone(): void;

    /**
     * 
     */
    updateFlash(): void;

    /**
     * 
     */
    updateShake(): void;

    /**
     * 
     */
    updateZoom(): void;

    /**
     * 
     */
    updateWeather(): void;

    /**
     * 
     */
    updatePictures(): void;

    /**
     * 
     */
    startFlashForDamage(): void;

    /**
     * prettier-ignore
     * @param pictureId 
     * @param name 
     * @param origin 
     * @param x 
     * @param y 
     * @param scaleX 
     * @param scaleY 
     * @param opacity 
     * @param blendMode 
     */
    showPicture(pictureId: any, name: any, origin: any, x: number, y: number, scaleX: any, scaleY: any, opacity: any, blendMode: any): void;

    /**
     * prettier-ignore
     * @param pictureId 
     * @param origin 
     * @param x 
     * @param y 
     * @param scaleX 
     * @param scaleY 
     * @param opacity 
     * @param blendMode 
     * @param duration 
     * @param easingType 
     */
    movePicture(pictureId: any, origin: any, x: number, y: number, scaleX: any, scaleY: any, opacity: any, blendMode: any, duration: any, easingType: number): void;

    /**
     * 
     * @param pictureId 
     * @param speed 
     */
    rotatePicture(pictureId: any, speed: any): void;

    /**
     * 
     * @param pictureId 
     * @param tone 
     * @param duration 
     */
    tintPicture(pictureId: any, tone: any, duration: any): void;

    /**
     * 
     * @param pictureId 
     */
    erasePicture(pictureId: any): void;

    /**
     * 
     */
    _brightness: number;

    /**
     * 
     */
    _fadeOutDuration: number;

    /**
     * 
     */
    _fadeInDuration: number;

    /**
     * 
     */
    _tone: Array<number>;

    /**
     * 
     */
    _toneTarget: Array<number>;

    /**
     * 
     */
    _toneDuration: number;

    /**
     * 
     */
    _flashDuration: number;

    /**
     * 
     */
    _shakePower: number;

    /**
     * 
     */
    _shakeSpeed: number;

    /**
     * 
     */
    _shakeDuration: number;

    /**
     * 
     */
    _shakeDirection: number;

    /**
     * 
     */
    _shake: number;

    /**
     * 
     */
    _zoomX: number;

    /**
     * 
     */
    _zoomY: number;

    /**
     * 
     */
    _zoomScale: number;

    /**
     * 
     */
    _zoomScaleTarget: number;

    /**
     * 
     */
    _zoomDuration: number;

    /**
     * 
     */
    _weatherType: string;

    /**
     * 
     */
    _weatherPower: number;

    /**
     * 
     */
    _weatherPowerTarget: number;

    /**
     * 
     */
    _weatherDuration: number;

    /**
     * 
     */
    _pictures: Array</* Game_Screen.+Game_Picture */ any>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Picture
 * 
 * The game object class for a picture.
 */
declare class Game_Picture {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @return  
     */
    name(): /* !this._name */ any;

    /**
     * 
     * @return  
     */
    origin(): /* !this._origin */ any;

    /**
     * 
     * @return  
     */
    x(): /* !this._x */ any;

    /**
     * 
     * @return  
     */
    y(): /* !this._y */ any;

    /**
     * 
     * @return  
     */
    scaleX(): /* !this._scaleX */ any;

    /**
     * 
     * @return  
     */
    scaleY(): /* !this._scaleY */ any;

    /**
     * 
     * @return  
     */
    opacity(): /* !this._opacity */ any;

    /**
     * 
     * @return  
     */
    blendMode(): /* !this._blendMode */ any;

    /**
     * 
     * @return  
     */
    tone(): /* !this._tone */ any;

    /**
     * 
     * @return  
     */
    angle(): /* !this._angle */ any;

    /**
     * 
     */
    initBasic(): void;

    /**
     * 
     */
    initTarget(): void;

    /**
     * 
     */
    initTone(): void;

    /**
     * 
     */
    initRotation(): void;

    /**
     * prettier-ignore
     * @param name 
     * @param origin 
     * @param x 
     * @param y 
     * @param scaleX 
     * @param scaleY 
     * @param opacity 
     * @param blendMode 
     */
    show(name: any, origin: any, x: number, y: number, scaleX: any, scaleY: any, opacity: any, blendMode: any): void;

    /**
     * prettier-ignore
     * @param origin 
     * @param x 
     * @param y 
     * @param scaleX 
     * @param scaleY 
     * @param opacity 
     * @param blendMode 
     * @param duration 
     * @param easingType 
     */
    move(origin: any, x: number, y: number, scaleX: any, scaleY: any, opacity: any, blendMode: any, duration: any, easingType: number): void;

    /**
     * 
     * @param speed 
     */
    rotate(speed: any): void;

    /**
     * 
     * @param tone 
     * @param duration 
     */
    tint(tone: any, duration: any): void;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateMove(): void;

    /**
     * 
     */
    updateTone(): void;

    /**
     * 
     */
    updateRotation(): void;

    /**
     * 
     * @param current 
     * @param target 
     * @return  
     */
    applyEasing(current: number, target: number): number;

    /**
     * 
     * @param t 
     * @return  
     */
    calcEasing(t: number): number;

    /**
     * 
     * @param t 
     * @param exponent 
     * @return  
     */
    easeIn(t: number, exponent: number): number;

    /**
     * 
     * @param t 
     * @param exponent 
     * @return  
     */
    easeOut(t: number, exponent: number): number;

    /**
     * 
     * @param t 
     * @param exponent 
     * @return  
     */
    easeInOut(t: number, exponent: number): number;

    /**
     * 
     */
    _name: string;

    /**
     * 
     */
    _origin: number;

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
    _scaleX: number;

    /**
     * 
     */
    _scaleY: number;

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
    _targetX: number;

    /**
     * 
     */
    _targetY: number;

    /**
     * 
     */
    _targetScaleX: number;

    /**
     * 
     */
    _targetScaleY: number;

    /**
     * 
     */
    _targetOpacity: number;

    /**
     * 
     */
    _duration: number;

    /**
     * 
     */
    _wholeDuration: number;

    /**
     * 
     */
    _easingType: number;

    /**
     * 
     */
    _easingExponent: number;

    /**
     * 
     */
    _tone: Array<number>;

    /**
     * 
     */
    _toneDuration: number;

    /**
     * 
     */
    _angle: number;

    /**
     * 
     */
    _rotationSpeed: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Item
 * 
 * The game object class for handling skills, items, weapons, and armor. It is
 * required because save data should not include the database object itself.
 */
declare class Game_Item {

    /**
     * 
     */
    new();

    /**
     * 
     * @param item 
     */
    initialize(item: any): void;

    /**
     * 
     * @return  
     */
    isSkill(): boolean;

    /**
     * 
     * @return  
     */
    isItem(): boolean;

    /**
     * 
     * @return  
     */
    isUsableItem(): boolean;

    /**
     * 
     * @return  
     */
    isWeapon(): boolean;

    /**
     * 
     * @return  
     */
    isArmor(): boolean;

    /**
     * 
     * @return  
     */
    isEquipItem(): boolean;

    /**
     * 
     * @return  
     */
    isNull(): boolean;

    /**
     * 
     * @return  
     */
    itemId(): /* !this._itemId */ any;

    /**
     * 
     */
    object(): void;

    /**
     * 
     * @param item 
     */
    setObject(item: any): void;

    /**
     * 
     * @param isWeapon 
     * @param itemId 
     */
    setEquip(isWeapon: boolean, itemId: any): void;

    /**
     * 
     */
    _dataClass: string;

    /**
     * 
     */
    _itemId: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Action
 * 
 * The game object class for a battle action.
 */
declare class Game_Action {

    /**
     * 
     */
    new();

    /**
     * 
     * @param subject 
     * @param forcing 
     */
    initialize(subject: any, forcing: any): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @param subject 
     */
    setSubject(subject: any): void;

    /**
     * 
     * @return  
     */
    subject(): Game_Actor;

    /**
     * 
     * @return  
     */
    friendsUnit(): Game_Party;

    /**
     * 
     * @return  
     */
    opponentsUnit(): Game_Troop;

    /**
     * 
     * @param action 
     */
    setEnemyAction(action: any): void;

    /**
     * 
     */
    setAttack(): void;

    /**
     * 
     */
    setGuard(): void;

    /**
     * 
     * @param skillId 
     */
    setSkill(skillId: number): void;

    /**
     * 
     * @param itemId 
     */
    setItem(itemId: any): void;

    /**
     * 
     * @param object 
     */
    setItemObject(object: any): void;

    /**
     * 
     * @param targetIndex 
     */
    setTarget(targetIndex: number): void;

    /**
     * 
     */
    item(): void;

    /**
     * 
     * @return  
     */
    isSkill(): boolean;

    /**
     * 
     * @return  
     */
    isItem(): boolean;

    /**
     * 
     * @return  
     */
    numRepeats(): number;

    /**
     * 
     * @param list 
     * @return  
     */
    checkItemScope(list: Game_Action.prototype.CheckItemScope0): boolean;

    /**
     * 
     * @return  
     */
    isForOpponent(): boolean;

    /**
     * 
     * @return  
     */
    isForFriend(): boolean;

    /**
     * 
     * @return  
     */
    isForEveryone(): boolean;

    /**
     * 
     * @return  
     */
    isForAliveFriend(): boolean;

    /**
     * 
     * @return  
     */
    isForDeadFriend(): boolean;

    /**
     * 
     * @return  
     */
    isForUser(): boolean;

    /**
     * 
     * @return  
     */
    isForOne(): boolean;

    /**
     * 
     * @return  
     */
    isForRandom(): boolean;

    /**
     * 
     * @return  
     */
    isForAll(): boolean;

    /**
     * 
     * @return  
     */
    needsSelection(): boolean;

    /**
     * 
     * @return  
     */
    numTargets(): number;

    /**
     * 
     * @param list 
     * @return  
     */
    checkDamageType(list: Game_Action.prototype.CheckDamageType0): boolean;

    /**
     * 
     * @return  
     */
    isHpEffect(): boolean;

    /**
     * 
     * @return  
     */
    isMpEffect(): boolean;

    /**
     * 
     * @return  
     */
    isDamage(): boolean;

    /**
     * 
     * @return  
     */
    isRecover(): boolean;

    /**
     * 
     * @return  
     */
    isDrain(): boolean;

    /**
     * 
     * @return  
     */
    isHpRecover(): boolean;

    /**
     * 
     * @return  
     */
    isMpRecover(): boolean;

    /**
     * 
     * @return  
     */
    isCertainHit(): boolean;

    /**
     * 
     * @return  
     */
    isPhysical(): boolean;

    /**
     * 
     * @return  
     */
    isMagical(): boolean;

    /**
     * 
     * @return  
     */
    isAttack(): boolean;

    /**
     * 
     * @return  
     */
    isGuard(): boolean;

    /**
     * 
     * @return  
     */
    isMagicSkill(): boolean;

    /**
     * 
     */
    decideRandomTarget(): void;

    /**
     * 
     */
    setConfusion(): void;

    /**
     * 
     */
    prepare(): void;

    /**
     * 
     * @return  
     */
    isValid(): /* !this._forcing */ any;

    /**
     * 
     */
    speed(): void;

    /**
     * 
     * @return  
     */
    makeTargets(): Game_Action.prototype.MakeTargetsRet;

    /**
     * 
     * @param targets 
     * @return  
     */
    repeatTargets(targets: Game_Action.prototype.RepeatTargets0): Array<any>;

    /**
     * 
     * @return  
     */
    confusionTarget(): Game_Enemy;

    /**
     * 
     * @return  
     */
    targetsForEveryone(): Game_Action.prototype.TargetsForEveryoneRet;

    /**
     * 
     * @return  
     */
    targetsForOpponents(): Game_Action.prototype.TargetsForOpponentsRet;

    /**
     * 
     * @return  
     */
    targetsForFriends(): Game_Action.prototype.TargetsForFriendsRet;

    /**
     * 
     * @param unit 
     * @return  
     */
    randomTargets(unit: Game_Troop): Game_Action.prototype.RandomTargetsRet;

    /**
     * 
     * @param unit 
     * @return  
     */
    targetsForDead(unit: Game_Party): Game_Action.prototype.TargetsForDeadRet;

    /**
     * 
     * @param unit 
     * @return  
     */
    targetsForAlive(unit: Game_Party | Game_Troop): Array<Game_Enemy>;

    /**
     * 
     * @param unit 
     * @return  
     */
    targetsForDeadAndAlive(unit: Game_Party): Game_Action.prototype.TargetsForDeadAndAliveRet;

    /**
     * 
     * @return  
     */
    evaluate(): number;

    /**
     * 
     * @return  
     */
    itemTargetCandidates(): Game_Action.prototype.ItemTargetCandidatesRet;

    /**
     * 
     * @param target 
     * @return  
     */
    evaluateWithTarget(target: Game_Actor): number;

    /**
     * 
     * @param target 
     * @return  
     */
    testApply(target: Game_Actor): boolean;

    /**
     * 
     * @param target 
     * @return  
     */
    testLifeAndDeath(target: Game_Actor): boolean;

    /**
     * 
     * @param target 
     */
    hasItemAnyValidEffects(target: Game_Actor): void;

    /**
     * 
     * @param target 
     * @param effect 
     * @return  
     */
    testItemEffect(target: Game_Actor, effect: any): boolean;

    /**
     * 
     * @param target 
     * @return  
     */
    itemCnt(target: /* Game_Action.prototype.+Game_BattlerBase */ any):  /* error */ any;

    /**
     * 
     * @param target 
     * @return  
     */
    itemMrf(target: any):  /* error */ any;

    /**
     * 
     * @return  
     */
    itemHit(): number;

    /**
     * 
     * @param target 
     * @return  
     */
    itemEva(target: Game_Actor):  /* error */ any;

    /**
     * 
     * @param target 
     * @return  
     */
    itemCri(target: Game_Actor): number;

    /**
     * 
     * @param target 
     */
    apply(target: Game_Actor): void;

    /**
     * 
     * @param target 
     * @param critical 
     * @return  
     */
    makeDamageValue(target: Game_Actor, critical: boolean): number;

    /**
     * 
     * @param target 
     * @return  
     */
    evalDamageFormula(target: Game_Actor): number;

    /**
     * 
     * @param target 
     * @return  
     */
    calcElementRate(target: Game_Actor): number;

    /**
     * 
     * @param target 
     * @param elements 
     * @return  
     */
    elementsMaxRate(target: Game_Actor, elements: Game_Action.prototype.ElementsMaxRate1): number;

    /**
     * 
     * @param damage 
     * @return  
     */
    applyCritical(damage: number): number;

    /**
     * 
     * @param damage 
     * @param variance 
     * @return  
     */
    applyVariance(damage: number, variance: any): number;

    /**
     * 
     * @param damage 
     * @param target 
     * @return  
     */
    applyGuard(damage: number, target: Game_Actor): number;

    /**
     * 
     * @param target 
     * @param value 
     */
    executeDamage(target: Game_Actor, value: number): void;

    /**
     * 
     * @param target 
     * @param value 
     */
    executeHpDamage(target: Game_Actor, value: number): void;

    /**
     * 
     * @param target 
     * @param value 
     */
    executeMpDamage(target: Game_Actor, value: number): void;

    /**
     * 
     * @param value 
     */
    gainDrainedHp(value: number): void;

    /**
     * 
     * @param value 
     */
    gainDrainedMp(value: number): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    applyItemEffect(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectRecoverHp(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectRecoverMp(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectGainTp(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectAddState(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectAddAttackState(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectAddNormalState(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectRemoveState(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectAddBuff(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectAddDebuff(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectRemoveBuff(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectRemoveDebuff(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectSpecial(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectGrow(target: Game_Actor, effect: any): void;

    /**
     * 
     * @param target 
     * @param effect 
     */
    itemEffectLearnSkill(target: Game_Actor, effect: any): void;

    /**
     * 
     */
    itemEffectCommonEvent(): void;

    /**
     * 
     * @param target 
     */
    makeSuccess(target: Game_Actor): void;

    /**
     * 
     */
    applyItemUserEffect(): void;

    /**
     * 
     * @param target 
     * @return  
     */
    lukEffectRate(target: Game_Actor): number;

    /**
     * 
     */
    applyGlobal(): void;

    /**
     * 
     */
    updateLastUsed(): void;

    /**
     * 
     */
    updateLastSubject(): void;

    /**
     * 
     * @param target 
     */
    updateLastTarget(target: Game_Actor): void;

    /**
     * 
     */
    EFFECT_RECOVER_HP: number;

    /**
     * 
     */
    EFFECT_RECOVER_MP: number;

    /**
     * 
     */
    EFFECT_GAIN_TP: number;

    /**
     * 
     */
    EFFECT_ADD_STATE: number;

    /**
     * 
     */
    EFFECT_REMOVE_STATE: number;

    /**
     * 
     */
    EFFECT_ADD_BUFF: number;

    /**
     * 
     */
    EFFECT_ADD_DEBUFF: number;

    /**
     * 
     */
    EFFECT_REMOVE_BUFF: number;

    /**
     * 
     */
    EFFECT_REMOVE_DEBUFF: number;

    /**
     * 
     */
    EFFECT_SPECIAL: number;

    /**
     * 
     */
    EFFECT_GROW: number;

    /**
     * 
     */
    EFFECT_LEARN_SKILL: number;

    /**
     * 
     */
    EFFECT_COMMON_EVENT: number;

    /**
     * 
     */
    SPECIAL_EFFECT_ESCAPE: number;

    /**
     * 
     */
    HITTYPE_CERTAIN: number;

    /**
     * 
     */
    HITTYPE_PHYSICAL: number;

    /**
     * 
     */
    HITTYPE_MAGICAL: number;

    /**
     * 
     */
    _subjectActorId: number;

    /**
     * 
     */
    _subjectEnemyIndex: number;

    /**
     * 
     */
    _forcing: boolean;

    /**
     * 
     */
    _targetIndex: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_ActionResult
 * 
 * The game object class for a result of a battle action. For convinience, all
 * member variables in this class are public.
 */
declare class Game_ActionResult {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @return  
     */
    addedStateObjects(): Game_ActionResult.prototype.AddedStateObjectsRet;

    /**
     * 
     * @return  
     */
    removedStateObjects(): Game_ActionResult.prototype.RemovedStateObjectsRet;

    /**
     * 
     * @return  
     */
    isStatusAffected(): boolean;

    /**
     * 
     * @return  
     */
    isHit(): /* !this.used */ any;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateAdded(stateId: number): boolean;

    /**
     * 
     * @param stateId 
     */
    pushAddedState(stateId: number): void;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateRemoved(stateId: number): boolean;

    /**
     * 
     * @param stateId 
     */
    pushRemovedState(stateId: number): void;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isBuffAdded(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     */
    pushAddedBuff(paramId: any): void;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isDebuffAdded(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     */
    pushAddedDebuff(paramId: any): void;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isBuffRemoved(paramId: number): boolean;

    /**
     * 
     * @param paramId 
     */
    pushRemovedBuff(paramId: number): void;

    /**
     * 
     */
    used: boolean;

    /**
     * 
     */
    missed: boolean;

    /**
     * 
     */
    evaded: boolean;

    /**
     * 
     */
    physical: boolean;

    /**
     * 
     */
    drain: boolean;

    /**
     * 
     */
    critical: boolean;

    /**
     * 
     */
    success: boolean;

    /**
     * 
     */
    hpAffected: boolean;

    /**
     * 
     */
    hpDamage: number;

    /**
     * 
     */
    mpDamage: number;

    /**
     * 
     */
    tpDamage: number;

    /**
     * 
     */
    addedStates: Array<number>;

    /**
     * 
     */
    removedStates: Array<number>;

    /**
     * 
     */
    addedBuffs: Array<any>;

    /**
     * 
     */
    addedDebuffs: Array<any>;

    /**
     * 
     */
    removedBuffs: Array<number>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_BattlerBase
 * 
 * The superclass of Game_Battler. It mainly contains parameters calculation.
 */
declare class Game_BattlerBase {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     */
    clearParamPlus(): void;

    /**
     * 
     */
    clearStates(): void;

    /**
     * 
     * @param stateId 
     */
    eraseState(stateId: number): void;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateAffected(stateId: number): boolean;

    /**
     * 
     * @return  
     */
    isDeathStateAffected(): boolean;

    /**
     * 
     * @return  
     */
    deathStateId(): number;

    /**
     * 
     * @param stateId 
     */
    resetStateCounts(stateId: number): void;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateExpired(stateId: any): boolean;

    /**
     * 
     */
    updateStateTurns(): void;

    /**
     * 
     */
    clearBuffs(): void;

    /**
     * 
     * @param paramId 
     */
    eraseBuff(paramId: number): void;

    /**
     * 
     * @return  
     */
    buffLength(): /* !this._buffs.length */ any;

    /**
     * 
     * @param paramId 
     * @return  
     */
    buff(paramId: any): /* !this._buffs.<i> */ any;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isBuffAffected(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isDebuffAffected(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isBuffOrDebuffAffected(paramId: number): boolean;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isMaxBuffAffected(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isMaxDebuffAffected(paramId: any): boolean;

    /**
     * 
     * @param paramId 
     */
    increaseBuff(paramId: any): void;

    /**
     * 
     * @param paramId 
     */
    decreaseBuff(paramId: any): void;

    /**
     * 
     * @param paramId 
     * @param turns 
     */
    overwriteBuffTurns(paramId: any, turns: any): void;

    /**
     * 
     * @param paramId 
     * @return  
     */
    isBuffExpired(paramId: number): boolean;

    /**
     * 
     */
    updateBuffTurns(): void;

    /**
     * 
     */
    die(): void;

    /**
     * 
     */
    revive(): void;

    /**
     * 
     * @return  
     */
    states(): Game_BattlerBase.prototype.StatesRet;

    /**
     * 
     * @return  
     */
    stateIcons(): Game_BattlerBase.prototype.StateIconsRet;

    /**
     * 
     * @return  
     */
    buffIcons(): Game_BattlerBase.prototype.BuffIconsRet;

    /**
     * 
     * @param buffLevel 
     * @param paramId 
     * @return  
     */
    buffIconIndex(buffLevel: number, paramId: number): number;

    /**
     * 
     * @return  
     */
    allIcons(): Array<any>;

    /**
     * 
     * @return  
     */
    traitObjects(): Array<any>;

    /**
     * 
     * @return  
     */
    allTraits(): Game_BattlerBase.prototype.AllTraitsRet;

    /**
     * 
     * @param code 
     * @return  
     */
    traits(code: number): Array<any>;

    /**
     * 
     * @param code 
     * @param id 
     * @return  
     */
    traitsWithId(code: number, id: number): Array<any>;

    /**
     * 
     * @param code 
     * @param id 
     * @return  
     */
    traitsPi(code: number, id: number): number;

    /**
     * 
     * @param code 
     * @param id 
     */
    traitsSum(code: number, id: number): void;

    /**
     * 
     * @param code 
     */
    traitsSumAll(code: number): void;

    /**
     * 
     * @param code 
     * @return  
     */
    traitsSet(code: number): Array<number>;

    /**
     * 
     * @return  
     */
    paramBase(): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramPlus(paramId: number): /* !this._paramPlus.<i> */ any;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramBasePlus(paramId: number): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramMin(paramId: number): number;

    /**
     * 
     * @return  
     */
    paramMax(): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramRate(paramId: number): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramBuffRate(paramId: number): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    param(paramId: number): number;

    /**
     * 
     * @param xparamId 
     */
    xparam(xparamId: any): void;

    /**
     * 
     * @param sparamId 
     * @return  
     */
    sparam(sparamId: any): number;

    /**
     * 
     * @param elementId 
     * @return  
     */
    elementRate(elementId: any): number;

    /**
     * 
     * @param paramId 
     * @return  
     */
    debuffRate(paramId: any): number;

    /**
     * 
     * @param stateId 
     * @return  
     */
    stateRate(stateId: any): number;

    /**
     * 
     * @return  
     */
    stateResistSet(): Array<number>;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateResist(stateId: number): boolean;

    /**
     * 
     * @return  
     */
    attackElements(): Array<number>;

    /**
     * 
     * @return  
     */
    attackStates(): Array<number>;

    /**
     * 
     * @param stateId 
     */
    attackStatesRate(stateId: number): void;

    /**
     * 
     */
    attackSpeed(): void;

    /**
     * 
     * @return  
     */
    attackTimesAdd(): number;

    /**
     * 
     * @return  
     */
    attackSkillId(): number;

    /**
     * 
     * @return  
     */
    addedSkillTypes(): Array<number>;

    /**
     * 
     * @param stypeId 
     * @return  
     */
    isSkillTypeSealed(stypeId: any): boolean;

    /**
     * 
     * @return  
     */
    addedSkills(): Array<number>;

    /**
     * 
     * @param skillId 
     * @return  
     */
    isSkillSealed(skillId: any): boolean;

    /**
     * 
     * @param wtypeId 
     * @return  
     */
    isEquipWtypeOk(wtypeId: any): boolean;

    /**
     * 
     * @param atypeId 
     * @return  
     */
    isEquipAtypeOk(atypeId: any): boolean;

    /**
     * 
     * @param etypeId 
     * @return  
     */
    isEquipTypeLocked(etypeId: number): boolean;

    /**
     * 
     * @param etypeId 
     * @return  
     */
    isEquipTypeSealed(etypeId: number): boolean;

    /**
     * 
     * @return  
     */
    slotType(): number;

    /**
     * 
     * @return  
     */
    isDualWield(): boolean;

    /**
     * 
     * @return  
     */
    actionPlusSet(): Game_BattlerBase.prototype.ActionPlusSetRet;

    /**
     * 
     * @param flagId 
     * @return  
     */
    specialFlag(flagId: number): boolean;

    /**
     * 
     * @return  
     */
    collapseType(): number;

    /**
     * 
     * @param abilityId 
     * @return  
     */
    partyAbility(abilityId: number): boolean;

    /**
     * 
     * @return  
     */
    isAutoBattle(): boolean;

    /**
     * 
     * @return  
     */
    isGuard(): boolean;

    /**
     * 
     * @return  
     */
    isSubstitute(): boolean;

    /**
     * 
     * @return  
     */
    isPreserveTp(): boolean;

    /**
     * 
     * @param paramId 
     * @param value 
     */
    addParam(paramId: any, value: any): void;

    /**
     * 
     * @param hp 
     */
    setHp(hp: number): void;

    /**
     * 
     * @param mp 
     */
    setMp(mp: any): void;

    /**
     * 
     * @param tp 
     */
    setTp(tp: number): void;

    /**
     * 
     * @return  
     */
    maxTp(): number;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     */
    recoverAll(): void;

    /**
     * 
     * @return  
     */
    hpRate(): number;

    /**
     * 
     * @return  
     */
    mpRate(): number;

    /**
     * 
     * @return  
     */
    tpRate(): number;

    /**
     * 
     */
    hide(): void;

    /**
     * 
     */
    appear(): void;

    /**
     * 
     * @return  
     */
    isHidden(): /* !this._hidden */ any;

    /**
     * 
     * @return  
     */
    isAppeared(): boolean;

    /**
     * 
     * @return  
     */
    isDead(): boolean;

    /**
     * 
     * @return  
     */
    isAlive(): boolean;

    /**
     * 
     * @return  
     */
    isDying(): boolean;

    /**
     * 
     * @return  
     */
    isRestricted(): boolean;

    /**
     * 
     * @return  
     */
    canInput(): boolean;

    /**
     * 
     * @return  
     */
    canMove(): boolean;

    /**
     * 
     * @return  
     */
    isConfused(): boolean;

    /**
     * 
     * @return  
     */
    confusionLevel(): number;

    /**
     * 
     * @return  
     */
    isActor(): boolean;

    /**
     * 
     * @return  
     */
    isEnemy(): boolean;

    /**
     * 
     */
    sortStates(): void;

    /**
     * 
     * @return  
     */
    restriction(): number;

    /**
     * 
     * @param stateId 
     */
    addNewState(stateId: number): void;

    /**
     * 
     */
    onRestrict(): void;

    /**
     * 
     * @return  
     */
    mostImportantStateText(): string;

    /**
     * 
     * @return  
     */
    stateMotionIndex(): number;

    /**
     * 
     * @return  
     */
    stateOverlayIndex(): number;

    /**
     * 
     * @return  
     */
    isSkillWtypeOk(): boolean;

    /**
     * 
     * @param skill 
     * @return  
     */
    skillMpCost(skill: any): number;

    /**
     * 
     * @param skill 
     * @return  
     */
    skillTpCost(skill: any):  /* error */ any;

    /**
     * 
     * @param skill 
     * @return  
     */
    canPaySkillCost(skill: any): boolean;

    /**
     * 
     * @param skill 
     */
    paySkillCost(skill: any): void;

    /**
     * 
     * @param item 
     * @return  
     */
    isOccasionOk(item: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    meetsUsableItemConditions(item: any): boolean;

    /**
     * 
     * @param skill 
     * @return  
     */
    meetsSkillConditions(skill: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    meetsItemConditions(item: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    canUse(item: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    canEquip(item: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    canEquipWeapon(item: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    canEquipArmor(item: any): boolean;

    /**
     * 
     * @return  
     */
    guardSkillId(): number;

    /**
     * 
     * @return  
     */
    canAttack(): boolean;

    /**
     * 
     * @return  
     */
    canGuard(): boolean;

    /**
     * 
     */
    TRAIT_ELEMENT_RATE: number;

    /**
     * 
     */
    TRAIT_DEBUFF_RATE: number;

    /**
     * 
     */
    TRAIT_STATE_RATE: number;

    /**
     * 
     */
    TRAIT_STATE_RESIST: number;

    /**
     * 
     */
    TRAIT_PARAM: number;

    /**
     * 
     */
    TRAIT_XPARAM: number;

    /**
     * 
     */
    TRAIT_SPARAM: number;

    /**
     * 
     */
    TRAIT_ATTACK_ELEMENT: number;

    /**
     * 
     */
    TRAIT_ATTACK_STATE: number;

    /**
     * 
     */
    TRAIT_ATTACK_SPEED: number;

    /**
     * 
     */
    TRAIT_ATTACK_TIMES: number;

    /**
     * 
     */
    TRAIT_ATTACK_SKILL: number;

    /**
     * 
     */
    TRAIT_STYPE_ADD: number;

    /**
     * 
     */
    TRAIT_STYPE_SEAL: number;

    /**
     * 
     */
    TRAIT_SKILL_ADD: number;

    /**
     * 
     */
    TRAIT_SKILL_SEAL: number;

    /**
     * 
     */
    TRAIT_EQUIP_WTYPE: number;

    /**
     * 
     */
    TRAIT_EQUIP_ATYPE: number;

    /**
     * 
     */
    TRAIT_EQUIP_LOCK: number;

    /**
     * 
     */
    TRAIT_EQUIP_SEAL: number;

    /**
     * 
     */
    TRAIT_SLOT_TYPE: number;

    /**
     * 
     */
    TRAIT_ACTION_PLUS: number;

    /**
     * 
     */
    TRAIT_SPECIAL_FLAG: number;

    /**
     * 
     */
    TRAIT_COLLAPSE_TYPE: number;

    /**
     * 
     */
    TRAIT_PARTY_ABILITY: number;

    /**
     * 
     */
    FLAG_ID_AUTO_BATTLE: number;

    /**
     * 
     */
    FLAG_ID_GUARD: number;

    /**
     * 
     */
    FLAG_ID_SUBSTITUTE: number;

    /**
     * 
     */
    FLAG_ID_PRESERVE_TP: number;

    /**
     * 
     */
    ICON_BUFF_START: number;

    /**
     * 
     */
    ICON_DEBUFF_START: number;

    /**
     * 
     */
    _hp: number;

    /**
     * 
     */
    _mp: number;

    /**
     * 
     */
    _tp: number;

    /**
     * 
     */
    _hidden: boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Battler
 * 
 * The superclass of Game_Actor and Game_Enemy. It contains methods for sprites
 * and actions.
 */
declare class Game_Battler extends Game_BattlerBase {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     */
    clearDamagePopup(): void;

    /**
     * 
     */
    clearWeaponAnimation(): void;

    /**
     * 
     */
    clearEffect(): void;

    /**
     * 
     */
    clearMotion(): void;

    /**
     * 
     * @param effectType 
     */
    requestEffect(effectType: string): void;

    /**
     * 
     * @param motionType 
     */
    requestMotion(motionType: string): void;

    /**
     * 
     */
    requestMotionRefresh(): void;

    /**
     * 
     */
    select(): void;

    /**
     * 
     */
    deselect(): void;

    /**
     * 
     * @return  
     */
    isDamagePopupRequested(): /* !this._damagePopup */ any;

    /**
     * 
     * @return  
     */
    isEffectRequested(): boolean;

    /**
     * 
     * @return  
     */
    isMotionRequested(): boolean;

    /**
     * 
     * @return  
     */
    isWeaponAnimationRequested(): boolean;

    /**
     * 
     * @return  
     */
    isMotionRefreshRequested(): /* !this._motionRefresh */ any;

    /**
     * 
     * @return  
     */
    isSelected(): /* !this._selected */ any;

    /**
     * 
     * @return  
     */
    effectType(): /* !this._effectType */ any;

    /**
     * 
     * @return  
     */
    motionType(): /* !this._motionType */ any;

    /**
     * 
     * @return  
     */
    weaponImageId(): /* !this._weaponImageId */ any;

    /**
     * 
     */
    startDamagePopup(): void;

    /**
     * 
     * @return  
     */
    shouldPopupDamage(): /* !this._result.missed */ any;

    /**
     * 
     * @param weaponImageId 
     */
    startWeaponAnimation(weaponImageId: any): void;

    /**
     * 
     * @param index 
     * @return  
     */
    action(index: number): /* !this._actions.<i> */ any;

    /**
     * 
     * @param index 
     * @param action 
     */
    setAction(index: number, action: Game_Action): void;

    /**
     * 
     * @return  
     */
    numActions(): /* !this._actions.length */ any;

    /**
     * 
     */
    clearActions(): void;

    /**
     * 
     * @return  
     */
    result(): /* !this._result */ any;

    /**
     * 
     */
    clearResult(): void;

    /**
     * 
     */
    clearTpbChargeTime(): void;

    /**
     * 
     */
    applyTpbPenalty(): void;

    /**
     * 
     * @param advantageous 
     */
    initTpbChargeTime(advantageous: any): void;

    /**
     * 
     * @return  
     */
    tpbChargeTime(): /* !this._tpbChargeTime */ any;

    /**
     * 
     */
    startTpbCasting(): void;

    /**
     * 
     */
    startTpbAction(): void;

    /**
     * 
     * @return  
     */
    isTpbCharged(): boolean;

    /**
     * 
     * @return  
     */
    isTpbReady(): boolean;

    /**
     * 
     * @return  
     */
    isTpbTimeout(): boolean;

    /**
     * 
     */
    updateTpb(): void;

    /**
     * 
     */
    updateTpbChargeTime(): void;

    /**
     * 
     */
    updateTpbCastTime(): void;

    /**
     * 
     */
    updateTpbAutoBattle(): void;

    /**
     * 
     */
    updateTpbIdleTime(): void;

    /**
     * 
     * @return  
     */
    tpbAcceleration(): number;

    /**
     * 
     * @return  
     */
    tpbRelativeSpeed(): number;

    /**
     * 
     * @return  
     */
    tpbSpeed(): number;

    /**
     * 
     * @return  
     */
    tpbBaseSpeed(): number;

    /**
     * 
     * @return  
     */
    tpbRequiredCastTime(): number;

    /**
     * 
     */
    onTpbCharged(): void;

    /**
     * 
     * @return  
     */
    shouldDelayTpbCharge(): boolean;

    /**
     * 
     */
    finishTpbCharge(): void;

    /**
     * 
     * @return  
     */
    isTpbTurnEnd(): /* !this._tpbTurnEnd */ any;

    /**
     * 
     */
    initTpbTurn(): void;

    /**
     * 
     */
    startTpbTurn(): void;

    /**
     * 
     */
    makeTpbActions(): void;

    /**
     * 
     */
    onTpbTimeout(): void;

    /**
     * 
     * @return  
     */
    turnCount(): /* !this._tpbTurnCount */ any;

    /**
     * 
     * @return  
     */
    canInput(): boolean;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @param stateId 
     */
    addState(stateId: number): void;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateAddable(stateId: number): boolean;

    /**
     * 
     * @param stateId 
     * @return  
     */
    isStateRestrict(stateId: number): boolean;

    /**
     * 
     */
    onRestrict(): void;

    /**
     * 
     * @param stateId 
     */
    removeState(stateId: number): void;

    /**
     * 
     */
    escape(): void;

    /**
     * 
     * @param paramId 
     * @param turns 
     */
    addBuff(paramId: any, turns: any): void;

    /**
     * 
     * @param paramId 
     * @param turns 
     */
    addDebuff(paramId: any, turns: any): void;

    /**
     * 
     * @param paramId 
     */
    removeBuff(paramId: number): void;

    /**
     * 
     */
    removeBattleStates(): void;

    /**
     * 
     */
    removeAllBuffs(): void;

    /**
     * 
     * @param timing 
     */
    removeStatesAuto(timing: number): void;

    /**
     * 
     */
    removeBuffsAuto(): void;

    /**
     * 
     */
    removeStatesByDamage(): void;

    /**
     * 
     * @return  
     */
    makeActionTimes(): number;

    /**
     * 
     */
    makeActions(): void;

    /**
     * 
     * @return  
     */
    speed(): /* !this._speed */ any;

    /**
     * 
     */
    makeSpeed(): void;

    /**
     * 
     * @return  
     */
    currentAction(): /* !this._actions.0 */ any;

    /**
     * 
     */
    removeCurrentAction(): void;

    /**
     * 
     * @param target 
     */
    setLastTarget(target: any): void;

    /**
     * 
     * @param skillId 
     * @param targetIndex 
     */
    forceAction(skillId: any, targetIndex: any): void;

    /**
     * 
     * @param item 
     */
    useItem(item: any): void;

    /**
     * 
     * @param item 
     */
    consumeItem(item: any): void;

    /**
     * 
     * @param value 
     */
    gainHp(value: number): void;

    /**
     * 
     * @param value 
     */
    gainMp(value: number): void;

    /**
     * 
     * @param value 
     */
    gainTp(value: any): void;

    /**
     * 
     * @param value 
     */
    gainSilentTp(value: number): void;

    /**
     * 
     */
    initTp(): void;

    /**
     * 
     */
    clearTp(): void;

    /**
     * 
     * @param damageRate 
     */
    chargeTpByDamage(damageRate: number): void;

    /**
     * 
     */
    regenerateHp(): void;

    /**
     * 
     * @return  
     */
    maxSlipDamage(): /* !this.hp */ any;

    /**
     * 
     */
    regenerateMp(): void;

    /**
     * 
     */
    regenerateTp(): void;

    /**
     * 
     */
    regenerateAll(): void;

    /**
     * 
     * @param advantageous 
     */
    onBattleStart(advantageous: any): void;

    /**
     * 
     */
    onAllActionsEnd(): void;

    /**
     * 
     */
    onTurnEnd(): void;

    /**
     * 
     */
    onBattleEnd(): void;

    /**
     * 
     * @param value 
     */
    onDamage(value: any): void;

    /**
     * 
     * @param actionState 
     */
    setActionState(actionState: string): void;

    /**
     * 
     * @return  
     */
    isUndecided(): boolean;

    /**
     * 
     * @return  
     */
    isInputting(): boolean;

    /**
     * 
     * @return  
     */
    isWaiting(): boolean;

    /**
     * 
     * @return  
     */
    isActing(): boolean;

    /**
     * 
     * @return  
     */
    isChanting(): boolean;

    /**
     * 
     * @return  
     */
    isGuardWaiting(): boolean;

    /**
     * 
     * @param action 
     */
    performActionStart(action: any): void;

    /**
     * 
     */
    performAction(): void;

    /**
     * 
     */
    performActionEnd(): void;

    /**
     * 
     */
    performDamage(): void;

    /**
     * 
     */
    performMiss(): void;

    /**
     * 
     */
    performRecovery(): void;

    /**
     * 
     */
    performEvasion(): void;

    /**
     * 
     */
    performMagicEvasion(): void;

    /**
     * 
     */
    performCounter(): void;

    /**
     * 
     */
    performReflection(): void;

    /**
     * 
     */
    performSubstitute(): void;

    /**
     * 
     */
    performCollapse(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Actor
 * 
 * The game object class for an actor.
 */
declare class Game_Actor extends Game_Battler {

    /**
     * 
     */
    new();

    /**
     * 
     * @param actorId 
     */
    initialize(actorId: any): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @param actorId 
     */
    setup(actorId: any): void;

    /**
     * 
     * @return  
     */
    actorId(): /* !this._actorId */ any;

    /**
     * 
     */
    actor(): void;

    /**
     * 
     * @return  
     */
    name(): /* !this._name */ any;

    /**
     * 
     * @param name 
     */
    setName(name: string | number): void;

    /**
     * 
     * @return  
     */
    nickname(): /* !this._nickname */ any;

    /**
     * 
     * @param nickname 
     */
    setNickname(nickname: any): void;

    /**
     * 
     * @return  
     */
    profile(): /* !this._profile */ any;

    /**
     * 
     * @param profile 
     */
    setProfile(profile: any): void;

    /**
     * 
     * @return  
     */
    characterName(): /* !this._characterName */ any;

    /**
     * 
     * @return  
     */
    characterIndex(): /* !this._characterIndex */ any;

    /**
     * 
     * @return  
     */
    faceName(): /* !this._faceName */ any;

    /**
     * 
     * @return  
     */
    faceIndex(): /* !this._faceIndex */ any;

    /**
     * 
     * @return  
     */
    battlerName(): /* !this._battlerName */ any;

    /**
     * 
     */
    clearStates(): void;

    /**
     * 
     * @param stateId 
     */
    eraseState(stateId: number): void;

    /**
     * 
     * @param stateId 
     */
    resetStateCounts(stateId: number): void;

    /**
     * 
     */
    initImages(): void;

    /**
     * 
     * @param level 
     * @return  
     */
    expForLevel(level: number): number;

    /**
     * 
     */
    initExp(): void;

    /**
     * 
     * @return  
     */
    currentExp(): /* !this._exp.<i> */ any;

    /**
     * 
     * @return  
     */
    currentLevelExp(): number;

    /**
     * 
     * @return  
     */
    nextLevelExp(): number;

    /**
     * 
     * @return  
     */
    nextRequiredExp(): number;

    /**
     * 
     */
    maxLevel(): void;

    /**
     * 
     * @return  
     */
    isMaxLevel(): boolean;

    /**
     * 
     */
    initSkills(): void;

    /**
     * 
     * @param equips 
     */
    initEquips(equips: any): void;

    /**
     * 
     * @return  
     */
    equipSlots(): Game_Actor.prototype.EquipSlotsRet;

    /**
     * 
     * @return  
     */
    equips(): Game_Actor.prototype.EquipsRet;

    /**
     * 
     * @return  
     */
    weapons(): Array<any>;

    /**
     * 
     * @return  
     */
    armors(): Array<any>;

    /**
     * 
     * @param weapon 
     * @return  
     */
    hasWeapon(weapon: any): boolean;

    /**
     * 
     * @param armor 
     * @return  
     */
    hasArmor(armor: any): boolean;

    /**
     * 
     * @param slotId 
     * @return  
     */
    isEquipChangeOk(slotId: number): boolean;

    /**
     * 
     * @param slotId 
     * @param item 
     */
    changeEquip(slotId: number, item: any): void;

    /**
     * 
     * @param slotId 
     * @param item 
     */
    forceChangeEquip(slotId: any, item: any): void;

    /**
     * 
     * @param newItem 
     * @param oldItem 
     * @return  
     */
    tradeItemWithParty(newItem: any, oldItem: any): boolean;

    /**
     * 
     * @param etypeId 
     * @param itemId 
     */
    changeEquipById(etypeId: any, itemId: any): void;

    /**
     * 
     * @param item 
     * @return  
     */
    isEquipped(item: any): boolean;

    /**
     * 
     * @param item 
     */
    discardEquip(item: any): void;

    /**
     * 
     * @param forcing 
     */
    releaseUnequippableItems(forcing: boolean): void;

    /**
     * 
     */
    clearEquipments(): void;

    /**
     * 
     */
    optimizeEquipments(): void;

    /**
     * 
     * @param slotId 
     */
    bestEquipItem(slotId: number): void;

    /**
     * 
     * @param item 
     */
    calcEquipItemPerformance(item: any): void;

    /**
     * 
     * @param skill 
     * @return  
     */
    isSkillWtypeOk(skill: any): boolean;

    /**
     * 
     * @param wtypeId 
     * @return  
     */
    isWtypeEquipped(wtypeId: any): boolean;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     */
    hide(): void;

    /**
     * 
     * @return  
     */
    isActor(): boolean;

    /**
     * 
     * @return  
     */
    friendsUnit(): Game_Party;

    /**
     * 
     * @return  
     */
    opponentsUnit(): Game_Troop;

    /**
     * 
     * @return  
     */
    index(): number;

    /**
     * 
     * @return  
     */
    isBattleMember(): boolean;

    /**
     * 
     * @return  
     */
    isFormationChangeOk(): boolean;

    /**
     * 
     */
    currentClass(): void;

    /**
     * 
     * @param gameClass 
     * @return  
     */
    isClass(gameClass: any): any;

    /**
     * 
     */
    skillTypes(): void;

    /**
     * 
     * @return  
     */
    skills(): Game_Actor.prototype.SkillsRet;

    /**
     * 
     * @return  
     */
    usableSkills(): Array<any>;

    /**
     * 
     * @return  
     */
    traitObjects(): Array<any>;

    /**
     * 
     * @return  
     */
    attackElements(): Array<number>;

    /**
     * 
     * @return  
     */
    hasNoWeapons(): boolean;

    /**
     * 
     * @return  
     */
    bareHandsElementId(): number;

    /**
     * 
     * @param paramId 
     */
    paramBase(paramId: number): void;

    /**
     * 
     * @param paramId 
     * @return  
     */
    paramPlus(paramId: number): number;

    /**
     * 
     * @return  
     */
    attackAnimationId1(): number;

    /**
     * 
     * @return  
     */
    attackAnimationId2(): number;

    /**
     * 
     * @return  
     */
    bareHandsAnimationId(): number;

    /**
     * 
     * @param exp 
     * @param show 
     */
    changeExp(exp: number, show: boolean): void;

    /**
     * 
     */
    levelUp(): void;

    /**
     * 
     */
    levelDown(): void;

    /**
     * 
     * @param lastSkills 
     * @return  
     */
    findNewSkills(lastSkills: Array<any>): Array<any>;

    /**
     * 
     * @param newSkills 
     */
    displayLevelUp(newSkills: Array<any>): void;

    /**
     * 
     * @param exp 
     */
    gainExp(exp: any): void;

    /**
     * 
     * @return  
     */
    finalExpRate(): number;

    /**
     * 
     * @return  
     */
    benchMembersExpRate(): number;

    /**
     * 
     * @return  
     */
    shouldDisplayLevelUp(): boolean;

    /**
     * 
     * @param level 
     * @param show 
     */
    changeLevel(level: any, show: boolean): void;

    /**
     * 
     * @param skillId 
     */
    learnSkill(skillId: any): void;

    /**
     * 
     * @param skillId 
     */
    forgetSkill(skillId: any): void;

    /**
     * 
     * @param skillId 
     * @return  
     */
    isLearnedSkill(skillId: any): boolean;

    /**
     * 
     * @param skillId 
     * @return  
     */
    hasSkill(skillId: any): boolean;

    /**
     * 
     * @param classId 
     * @param keepExp 
     */
    changeClass(classId: any, keepExp: any): void;

    /**
     * 
     * @param characterName 
     * @param characterIndex 
     */
    setCharacterImage(characterName: any, characterIndex: any): void;

    /**
     * 
     * @param faceName 
     * @param faceIndex 
     */
    setFaceImage(faceName: any, faceIndex: any): void;

    /**
     * 
     * @param battlerName 
     */
    setBattlerImage(battlerName: any): void;

    /**
     * 
     */
    isSpriteVisible(): void;

    /**
     * 
     * @param action 
     */
    performActionStart(action: any): void;

    /**
     * 
     * @param action 
     */
    performAction(action: any): void;

    /**
     * 
     */
    performActionEnd(): void;

    /**
     * 
     */
    performAttack(): void;

    /**
     * 
     */
    performDamage(): void;

    /**
     * 
     */
    performEvasion(): void;

    /**
     * 
     */
    performMagicEvasion(): void;

    /**
     * 
     */
    performCounter(): void;

    /**
     * 
     */
    performCollapse(): void;

    /**
     * 
     */
    performVictory(): void;

    /**
     * 
     */
    performEscape(): void;

    /**
     * 
     * @return  
     */
    makeActionList(): Game_Actor.prototype.MakeActionListRet;

    /**
     * 
     */
    makeAutoBattleActions(): void;

    /**
     * 
     */
    makeConfusionActions(): void;

    /**
     * 
     */
    makeActions(): void;

    /**
     * 
     */
    onPlayerWalk(): void;

    /**
     * 
     * @param state 
     */
    updateStateSteps(state: any): void;

    /**
     * 
     */
    showAddedStates(): void;

    /**
     * 
     */
    showRemovedStates(): void;

    /**
     * 
     * @return  
     */
    stepsForTurn(): number;

    /**
     * 
     */
    turnEndOnMap(): void;

    /**
     * 
     */
    checkFloorEffect(): void;

    /**
     * 
     */
    executeFloorDamage(): void;

    /**
     * 
     * @return  
     */
    basicFloorDamage(): number;

    /**
     * 
     * @return  
     */
    maxFloorDamage(): /* !this.hp */ any;

    /**
     * 
     */
    performMapDamage(): void;

    /**
     * 
     */
    clearActions(): void;

    /**
     * 
     * @return  
     */
    inputtingAction(): Game_Action;

    /**
     * 
     * @return  
     */
    selectNextCommand(): boolean;

    /**
     * 
     * @return  
     */
    selectPreviousCommand(): boolean;

    /**
     * 
     */
    lastSkill(): void;

    /**
     * 
     */
    lastMenuSkill(): void;

    /**
     * 
     * @param skill 
     */
    setLastMenuSkill(skill: any): void;

    /**
     * 
     */
    lastBattleSkill(): void;

    /**
     * 
     * @param skill 
     */
    setLastBattleSkill(skill: any): void;

    /**
     * 
     * @return  
     */
    lastCommandSymbol(): /* !this._lastCommandSymbol */ any;

    /**
     * 
     * @param symbol 
     */
    setLastCommandSymbol(symbol: string): void;

    /**
     * 
     * @param item 
     */
    testEscape(item: any): void;

    /**
     * 
     * @param item 
     * @return  
     */
    meetsUsableItemConditions(item: any): boolean;

    /**
     * 
     */
    onEscapeFailure(): void;

    /**
     * 
     */
    _actions: Array<Game_Action>;

    /**
     * 
     */
    _speed: number;

    /**
     * 
     */
    _result: Game_ActionResult;

    /**
     * 
     */
    _actionState: string;

    /**
     * 
     */
    _lastTargetIndex: number;

    /**
     * 
     */
    _damagePopup: boolean;

    /**
     * 
     */
    _motionType: string;

    /**
     * 
     */
    _weaponImageId: number;

    /**
     * 
     */
    _motionRefresh: boolean;

    /**
     * 
     */
    _selected: boolean;

    /**
     * 
     */
    _tpbState: string;

    /**
     * 
     */
    _tpbChargeTime: number;

    /**
     * 
     */
    _tpbCastTime: number;

    /**
     * 
     */
    _tpbIdleTime: number;

    /**
     * 
     */
    _tpbTurnCount: number;

    /**
     * 
     */
    _tpbTurnEnd: boolean;

    /**
     * 
     */
    _hp: number;

    /**
     * 
     */
    _mp: number;

    /**
     * 
     */
    _tp: number;

    /**
     * 
     */
    _hidden: boolean;

    /**
     * 
     */
    _paramPlus: Array<number>;

    /**
     * 
     */
    _states: Array<number>;

    /**
     * 
     */
    _stateTurns: /*no type*/{};

    /**
     * 
     */
    _buffs: Array<number>;

    /**
     * 
     */
    _buffTurns: Array<number>;

    /**
     * 
     */
    _actorId: number;

    /**
     * 
     */
    _nickname: string;

    /**
     * 
     */
    _classId: number;

    /**
     * 
     */
    _level: number;

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
    _faceName: string;

    /**
     * 
     */
    _faceIndex: number;

    /**
     * 
     */
    _battlerName: string;

    /**
     * 
     */
    _exp: {
    }

    /**
     * 
     */
    _skills: Array<any>;

    /**
     * 
     */
    _equips: Array<Game_Item>;

    /**
     * 
     */
    _actionInputIndex: number;

    /**
     * 
     */
    _lastMenuSkill: Game_Item;

    /**
     * 
     */
    _lastCommandSymbol: string;

    /**
     * 
     */
    _stateSteps: /*no type*/{};
}

/**
 * -----------------------------------------------------------------------------
 * Game_Enemy
 * 
 * The game object class for an enemy.
 */
declare class Game_Enemy extends Game_Battler {

    /**
     * 
     */
    new();

    /**
     * 
     * @param enemyId 
     * @param x 
     * @param y 
     */
    initialize(enemyId: any, x: any, y: any): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @param enemyId 
     * @param x 
     * @param y 
     */
    setup(enemyId: any, x: any, y: any): void;

    /**
     * 
     * @return  
     */
    isEnemy(): boolean;

    /**
     * 
     * @return  
     */
    friendsUnit(): Game_Troop;

    /**
     * 
     * @return  
     */
    opponentsUnit(): Game_Party;

    /**
     * 
     * @return  
     */
    index(): number;

    /**
     * 
     * @return  
     */
    isBattleMember(): boolean;

    /**
     * 
     * @return  
     */
    enemyId(): /* !this._enemyId */ any;

    /**
     * 
     */
    enemy(): void;

    /**
     * 
     * @return  
     */
    traitObjects(): Array<any>;

    /**
     * 
     * @param paramId 
     */
    paramBase(paramId: number): void;

    /**
     * 
     */
    exp(): void;

    /**
     * 
     */
    gold(): void;

    /**
     * 
     */
    makeDropItems(): void;

    /**
     * 
     * @return  
     */
    dropItemRate(): number;

    /**
     * 
     * @param kind 
     * @param dataId 
     */
    itemObject(kind: any, dataId: any): void;

    /**
     * 
     * @return  
     */
    isSpriteVisible(): boolean;

    /**
     * 
     * @return  
     */
    screenX(): /* !this._screenX */ any;

    /**
     * 
     * @return  
     */
    screenY(): /* !this._screenY */ any;

    /**
     * 
     */
    battlerName(): void;

    /**
     * 
     */
    battlerHue(): void;

    /**
     * 
     */
    originalName(): void;

    /**
     * 
     * @return  
     */
    name(): string;

    /**
     * 
     * @return  
     */
    isLetterEmpty(): boolean;

    /**
     * 
     * @param letter 
     */
    setLetter(letter: string): void;

    /**
     * 
     * @param plural 
     */
    setPlural(plural: boolean): void;

    /**
     * 
     * @param action 
     */
    performActionStart(action: any): void;

    /**
     * 
     * @param action 
     */
    performAction(action: any): void;

    /**
     * 
     */
    performActionEnd(): void;

    /**
     * 
     */
    performDamage(): void;

    /**
     * 
     */
    performCollapse(): void;

    /**
     * 
     * @param enemyId 
     */
    transform(enemyId: any): void;

    /**
     * 
     * @param action 
     * @return  
     */
    meetsCondition(action: any): boolean;

    /**
     * 
     * @param param1 
     * @param param2 
     * @return  
     */
    meetsTurnCondition(param1: any, param2: any): boolean;

    /**
     * 
     * @param param1 
     * @param param2 
     * @return  
     */
    meetsHpCondition(param1: any, param2: any): boolean;

    /**
     * 
     * @param param1 
     * @param param2 
     * @return  
     */
    meetsMpCondition(param1: any, param2: any): boolean;

    /**
     * 
     * @param param 
     * @return  
     */
    meetsStateCondition(param: any): boolean;

    /**
     * 
     * @param param 
     * @return  
     */
    meetsPartyLevelCondition(param: any): boolean;

    /**
     * 
     * @param param 
     * @return  
     */
    meetsSwitchCondition(param: any): boolean;

    /**
     * 
     * @param action 
     * @return  
     */
    isActionValid(action: any): boolean;

    /**
     * 
     * @param actionList 
     * @param ratingZero 
     */
    selectAction(actionList: any, ratingZero: number): void;

    /**
     * 
     * @param actionList 
     */
    selectAllActions(actionList: any): void;

    /**
     * 
     */
    makeActions(): void;

    /**
     * 
     */
    _actions: Array<Game_Action>;

    /**
     * 
     */
    _speed: number;

    /**
     * 
     */
    _actionState: string;

    /**
     * 
     */
    _lastTargetIndex: number;

    /**
     * 
     */
    _damagePopup: boolean;

    /**
     * 
     */
    _effectType: string;

    /**
     * 
     */
    _weaponImageId: number;

    /**
     * 
     */
    _motionRefresh: boolean;

    /**
     * 
     */
    _selected: boolean;

    /**
     * 
     */
    _tpbState: string;

    /**
     * 
     */
    _tpbChargeTime: number;

    /**
     * 
     */
    _tpbCastTime: number;

    /**
     * 
     */
    _tpbIdleTime: number;

    /**
     * 
     */
    _tpbTurnCount: number;

    /**
     * 
     */
    _tpbTurnEnd: boolean;

    /**
     * 
     */
    _hp: number;

    /**
     * 
     */
    _mp: number;

    /**
     * 
     */
    _tp: number;

    /**
     * 
     */
    _hidden: boolean;

    /**
     * 
     */
    _enemyId: number;

    /**
     * 
     */
    _letter: string;

    /**
     * 
     */
    _plural: boolean;

    /**
     * 
     */
    _screenX: number;

    /**
     * 
     */
    _screenY: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Actors
 * 
 * The wrapper class for an actor array.
 */
declare class Game_Actors {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @param actorId 
     * @return  
     */
    actor(actorId: number): /* !this._data.<i> */ any;

    /**
     * 
     */
    _data: Array<Game_Actor>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Unit
 * 
 * The superclass of Game_Party and Game_Troop.
 */
declare class Game_Unit {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @return  
     */
    inBattle(): /* !this._inBattle */ any;

    /**
     * 
     * @return  
     */
    members(): Game_Unit.prototype.MembersRet;

    /**
     * 
     * @return  
     */
    aliveMembers(): Array<Game_Enemy>;

    /**
     * 
     * @return  
     */
    deadMembers(): Array<any>;

    /**
     * 
     * @return  
     */
    movableMembers(): Game_Unit.prototype.MovableMembersRet;

    /**
     * 
     */
    clearActions(): void;

    /**
     * 
     * @return  
     */
    agility(): number;

    /**
     * 
     */
    tgrSum(): void;

    /**
     * 
     * @return  
     */
    randomTarget(): Game_Enemy;

    /**
     * 
     * @return  
     */
    randomDeadTarget(): Game_Enemy;

    /**
     * 
     * @param index 
     * @return  
     */
    smoothTarget(index: number): Game_Enemy;

    /**
     * 
     * @param index 
     * @return  
     */
    smoothDeadTarget(index: number): Game_Enemy;

    /**
     * 
     */
    clearResults(): void;

    /**
     * 
     * @param advantageous 
     */
    onBattleStart(advantageous: boolean): void;

    /**
     * 
     */
    onBattleEnd(): void;

    /**
     * 
     */
    makeActions(): void;

    /**
     * 
     * @param activeMember 
     */
    select(activeMember: Game_Actor): void;

    /**
     * 
     * @return  
     */
    isAllDead(): boolean;

    /**
     * 
     */
    substituteBattler(): void;

    /**
     * 
     * @return  
     */
    tpbBaseSpeed(): number;

    /**
     * 
     * @return  
     */
    tpbReferenceTime(): number;

    /**
     * 
     */
    updateTpb(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Party
 * 
 * The game object class for the party. Information such as gold and items is
 * included.
 */
declare class Game_Party extends Game_Unit {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initAllItems(): void;

    /**
     * 
     * @return  
     */
    exists(): boolean;

    /**
     * 
     * @return  
     */
    size(): number;

    /**
     * 
     * @return  
     */
    isEmpty(): boolean;

    /**
     * 
     * @return  
     */
    members(): Array<Game_Actor>;

    /**
     * 
     * @return  
     */
    allMembers(): Array<Game_Actor>;

    /**
     * 
     * @return  
     */
    battleMembers(): Array<Game_Actor>;

    /**
     * 
     * @return  
     */
    maxBattleMembers(): number;

    /**
     * 
     * @return  
     */
    leader(): Game_Actor;

    /**
     * 
     */
    removeInvalidMembers(): void;

    /**
     * 
     */
    reviveBattleMembers(): void;

    /**
     * 
     * @return  
     */
    items(): Game_Party.prototype.ItemsRet;

    /**
     * 
     * @return  
     */
    weapons(): Game_Party.prototype.WeaponsRet;

    /**
     * 
     * @return  
     */
    armors(): Game_Party.prototype.ArmorsRet;

    /**
     * 
     * @return  
     */
    equipItems(): Array<any>;

    /**
     * 
     * @return  
     */
    allItems(): Array<any>;

    /**
     * 
     * @param item 
     * @return  
     */
    itemContainer(item: any): /* !this._items */ any;

    /**
     * 
     */
    setupStartingMembers(): void;

    /**
     * 
     * @return  
     */
    name(): string;

    /**
     * 
     */
    setupBattleTest(): void;

    /**
     * 
     */
    setupBattleTestMembers(): void;

    /**
     * 
     */
    setupBattleTestItems(): void;

    /**
     * 
     * @return  
     */
    highestLevel(): number;

    /**
     * 
     * @param actorId 
     */
    addActor(actorId: any): void;

    /**
     * 
     * @param actorId 
     */
    removeActor(actorId: any): void;

    /**
     * 
     * @return  
     */
    gold(): /* !this._gold */ any;

    /**
     * 
     * @param amount 
     */
    gainGold(amount: number): void;

    /**
     * 
     * @param amount 
     */
    loseGold(amount: number): void;

    /**
     * 
     * @return  
     */
    maxGold(): number;

    /**
     * 
     * @return  
     */
    steps(): /* !this._steps */ any;

    /**
     * 
     */
    increaseSteps(): void;

    /**
     * 
     * @param item 
     * @return  
     */
    numItems(item: any): number;

    /**
     * 
     * @return  
     */
    maxItems(): number;

    /**
     * 
     * @param item 
     * @return  
     */
    hasMaxItems(item: any): boolean;

    /**
     * 
     * @param item 
     * @param includeEquip 
     * @return  
     */
    hasItem(item: any, includeEquip: any): boolean;

    /**
     * 
     * @param item 
     * @return  
     */
    isAnyMemberEquipped(item: any): boolean;

    /**
     * 
     * @param item 
     * @param amount 
     * @param includeEquip 
     */
    gainItem(item: any, amount: number, includeEquip: any): void;

    /**
     * 
     * @param item 
     * @param amount 
     */
    discardMembersEquip(item: any, amount: number): void;

    /**
     * 
     * @param item 
     * @param amount 
     * @param includeEquip 
     */
    loseItem(item: any, amount: number, includeEquip: any): void;

    /**
     * 
     * @param item 
     */
    consumeItem(item: any): void;

    /**
     * 
     * @param item 
     * @return  
     */
    canUse(item: any): boolean;

    /**
     * 
     * @return  
     */
    canInput(): boolean;

    /**
     * 
     * @return  
     */
    isAllDead(): boolean;

    /**
     * 
     */
    onPlayerWalk(): void;

    /**
     * 
     * @return  
     */
    menuActor(): Game_Actor;

    /**
     * 
     * @param actor 
     */
    setMenuActor(actor: Game_Actor): void;

    /**
     * 
     */
    makeMenuActorNext(): void;

    /**
     * 
     */
    makeMenuActorPrevious(): void;

    /**
     * 
     * @return  
     */
    targetActor(): Game_Actor;

    /**
     * 
     * @param actor 
     */
    setTargetActor(actor: Game_Actor): void;

    /**
     * 
     */
    lastItem(): void;

    /**
     * 
     * @param item 
     */
    setLastItem(item: any): void;

    /**
     * 
     * @param index1 
     * @param index2 
     */
    swapOrder(index1: number, index2: number): void;

    /**
     * 
     * @return  
     */
    charactersForSavefile(): Game_Party.prototype.CharactersForSavefileRet;

    /**
     * 
     * @return  
     */
    facesForSavefile(): Game_Party.prototype.FacesForSavefileRet;

    /**
     * 
     * @param abilityId 
     * @return  
     */
    partyAbility(abilityId: number): boolean;

    /**
     * 
     * @return  
     */
    hasEncounterHalf(): boolean;

    /**
     * 
     * @return  
     */
    hasEncounterNone(): boolean;

    /**
     * 
     * @return  
     */
    hasCancelSurprise(): boolean;

    /**
     * 
     * @return  
     */
    hasRaisePreemptive(): boolean;

    /**
     * 
     * @return  
     */
    hasGoldDouble(): boolean;

    /**
     * 
     * @return  
     */
    hasDropItemDouble(): boolean;

    /**
     * 
     * @param troopAgi 
     * @return  
     */
    ratePreemptive(troopAgi: number): number;

    /**
     * 
     * @param troopAgi 
     * @return  
     */
    rateSurprise(troopAgi: number): number;

    /**
     * 
     */
    performVictory(): void;

    /**
     * 
     */
    performEscape(): void;

    /**
     * 
     */
    removeBattleStates(): void;

    /**
     * 
     */
    requestMotionRefresh(): void;

    /**
     * 
     */
    onEscapeFailure(): void;

    /**
     * 
     */
    ABILITY_ENCOUNTER_HALF: number;

    /**
     * 
     */
    ABILITY_ENCOUNTER_NONE: number;

    /**
     * 
     */
    ABILITY_CANCEL_SURPRISE: number;

    /**
     * 
     */
    ABILITY_RAISE_PREEMPTIVE: number;

    /**
     * 
     */
    ABILITY_GOLD_DOUBLE: number;

    /**
     * 
     */
    ABILITY_DROP_ITEM_DOUBLE: number;

    /**
     * 
     */
    _inBattle: boolean;

    /**
     * 
     */
    _gold: number;

    /**
     * 
     */
    _steps: number;

    /**
     * 
     */
    _menuActorId: number;

    /**
     * 
     */
    _targetActorId: number;

    /**
     * 
     */
    _actors: Array<any>;

    /**
     * 
     */
    _items: {
    }
}

/**
 * -----------------------------------------------------------------------------
 * Game_Troop
 * 
 * The game object class for a troop and the battle-related data.
 */
declare class Game_Troop extends Game_Unit {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @return  
     */
    isEventRunning(): boolean;

    /**
     * 
     */
    updateInterpreter(): void;

    /**
     * 
     * @return  
     */
    turnCount(): /* !this._turnCount */ any;

    /**
     * 
     * @return  
     */
    members(): /* !this._enemies */ any;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     */
    troop(): void;

    /**
     * 
     * @param troopId 
     */
    setup(troopId: number): void;

    /**
     * 
     */
    makeUniqueNames(): void;

    /**
     * 
     */
    updatePluralFlags(): void;

    /**
     * 
     * @return  
     */
    letterTable(): Array<string>;

    /**
     * 
     * @return  
     */
    enemyNames(): Game_Troop.prototype.EnemyNamesRet;

    /**
     * 
     * @param page 
     * @return  
     */
    meetsConditions(page: any): boolean;

    /**
     * 
     */
    setupBattleEvent(): void;

    /**
     * 
     */
    increaseTurn(): void;

    /**
     * 
     */
    expTotal(): void;

    /**
     * 
     * @return  
     */
    goldTotal(): number;

    /**
     * 
     * @return  
     */
    goldRate(): number;

    /**
     * 
     * @return  
     */
    makeDropItems(): Game_Troop.prototype.MakeDropItemsRet;

    /**
     * 
     * @return  
     */
    isTpbTurnEnd(): boolean;

    /**
     * prettier-ignore
     */
    LETTER_TABLE_HALF: Array<string>;

    /**
     * prettier-ignore
     */
    LETTER_TABLE_FULL: Array<string>;

    /**
     * 
     */
    _inBattle: boolean;

    /**
     * 
     */
    _interpreter: Game_Interpreter;

    /**
     * 
     */
    _troopId: number;

    /**
     * 
     */
    _eventFlags: {
    }

    /**
     * 
     */
    _enemies: Array</* Game_Troop.+Game_Enemy */ any>;

    /**
     * 
     */
    _turnCount: number;

    /**
     * 
     */
    _namesCount: {
    }
}

/**
 * -----------------------------------------------------------------------------
 * Game_Map
 * 
 * The game object class for a map. It contains scrolling and passage
 * determination functions.
 */
declare class Game_Map {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     * @param mapId 
     */
    setup(mapId: number): void;

    /**
     * 
     * @return  
     */
    isEventRunning(): boolean;

    /**
     * 
     * @return  
     */
    tileWidth(): number;

    /**
     * 
     * @return  
     */
    tileHeight(): number;

    /**
     * 
     * @return  
     */
    mapId(): /* !this._mapId */ any;

    /**
     * 
     * @return  
     */
    tilesetId(): /* !this._tilesetId */ any;

    /**
     * 
     * @return  
     */
    displayX(): /* !this._displayX */ any;

    /**
     * 
     * @return  
     */
    displayY(): /* !this._displayY */ any;

    /**
     * 
     * @return  
     */
    parallaxName(): /* !this._parallaxName */ any;

    /**
     * 
     * @return  
     */
    battleback1Name(): /* !this._battleback1Name */ any;

    /**
     * 
     * @return  
     */
    battleback2Name(): /* !this._battleback2Name */ any;

    /**
     * 
     */
    requestRefresh(): void;

    /**
     * 
     * @return  
     */
    isNameDisplayEnabled(): /* !this._nameDisplay */ any;

    /**
     * 
     */
    disableNameDisplay(): void;

    /**
     * 
     */
    enableNameDisplay(): void;

    /**
     * 
     */
    createVehicles(): void;

    /**
     * 
     */
    refereshVehicles(): void;

    /**
     * 
     * @return  
     */
    vehicles(): Game_Map.prototype.VehiclesRet;

    /**
     * 
     * @param type 
     * @return  
     */
    vehicle(type: string): Game_Vehicle;

    /**
     * 
     * @return  
     */
    boat(): /* !this._vehicles.0 */ any;

    /**
     * 
     * @return  
     */
    ship(): /* !this._vehicles.1 */ any;

    /**
     * 
     * @return  
     */
    airship(): /* !this._vehicles.2 */ any;

    /**
     * 
     */
    setupEvents(): void;

    /**
     * 
     * @return  
     */
    events(): Game_Map.prototype.EventsRet;

    /**
     * 
     * @param eventId 
     * @return  
     */
    event(eventId: number): /* !this._events.<i> */ any;

    /**
     * 
     * @param eventId 
     */
    eraseEvent(eventId: number): void;

    /**
     * 
     */
    autorunCommonEvents(): void;

    /**
     * 
     */
    parallelCommonEvents(): void;

    /**
     * 
     */
    setupScroll(): void;

    /**
     * 
     */
    setupParallax(): void;

    /**
     * 
     */
    setupBattleback(): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    setDisplayPos(x: number, y: number): void;

    /**
     * 
     * @return  
     */
    parallaxOx(): number;

    /**
     * 
     * @return  
     */
    parallaxOy(): number;

    /**
     * 
     */
    tileset(): void;

    /**
     * 
     * @return  
     */
    tilesetFlags(): Game_Map.prototype.TilesetFlagsRet;

    /**
     * 
     */
    displayName(): void;

    /**
     * 
     * @return  
     */
    width(): number;

    /**
     * 
     * @return  
     */
    height(): number;

    /**
     * 
     * @return  
     */
    data(): Array<any>;

    /**
     * 
     * @return  
     */
    isLoopHorizontal(): boolean;

    /**
     * 
     * @return  
     */
    isLoopVertical(): boolean;

    /**
     * 
     */
    isDashDisabled(): void;

    /**
     * 
     */
    encounterList(): void;

    /**
     * 
     */
    encounterStep(): void;

    /**
     * 
     * @return  
     */
    isOverworld(): boolean;

    /**
     * 
     * @return  
     */
    screenTileX(): number;

    /**
     * 
     * @return  
     */
    screenTileY(): number;

    /**
     * 
     * @param x 
     * @return  
     */
    adjustX(x: number): number;

    /**
     * 
     * @param y 
     * @return  
     */
    adjustY(y: number): number;

    /**
     * 
     * @param x 
     * @return  
     */
    roundX(x: number): number;

    /**
     * 
     * @param y 
     * @return  
     */
    roundY(y: number): number;

    /**
     * 
     * @param x 
     * @param d 
     * @return  
     */
    xWithDirection(x: number, d: number): number;

    /**
     * 
     * @param y 
     * @param d 
     * @return  
     */
    yWithDirection(y: number, d: number): number;

    /**
     * 
     * @param x 
     * @param d 
     * @return  
     */
    roundXWithDirection(x: number, d: number): number;

    /**
     * 
     * @param y 
     * @param d 
     * @return  
     */
    roundYWithDirection(y: number, d: number): number;

    /**
     * 
     * @param x1 
     * @param x2 
     * @return  
     */
    deltaX(x1: number, x2: number): number;

    /**
     * 
     * @param y1 
     * @param y2 
     * @return  
     */
    deltaY(y1: number, y2: number): number;

    /**
     * 
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @return  
     */
    distance(x1: number, y1: number, x2: number, y2: number): number;

    /**
     * 
     * @param x 
     * @return  
     */
    canvasToMapX(x: Game_Map.prototype.CanvasToMapX0): number;

    /**
     * 
     * @param y 
     * @return  
     */
    canvasToMapY(y: Game_Map.prototype.CanvasToMapY0): number;

    /**
     * 
     */
    autoplay(): void;

    /**
     * 
     */
    refreshIfNeeded(): void;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     */
    refreshTileEvents(): void;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    eventsXy(x: number, y: number): Array<Game_Event>;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    eventsXyNt(x: number, y: number): Array<Game_Event>;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    tileEventsXy(x: number, y: number): Array<Game_Event>;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    eventIdXy(x: number, y: number): number;

    /**
     * 
     * @param distance 
     */
    scrollDown(distance: number): void;

    /**
     * 
     * @param distance 
     */
    scrollLeft(distance: number): void;

    /**
     * 
     * @param distance 
     */
    scrollRight(distance: number): void;

    /**
     * 
     * @param distance 
     */
    scrollUp(distance: number): void;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isValid(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param bit 
     * @return  
     */
    checkPassage(x: number, y: number, bit: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     * @return  
     */
    tileId(x: number, y: number, z: number): number;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    layeredTiles(x: number, y: number): Game_Map.prototype.LayeredTilesRet;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    allTiles(x: number, y: number): Game_Map.prototype.AllTilesRet;

    /**
     * 
     * @param x 
     * @param y 
     * @param z 
     * @return  
     */
    autotileType(x: any, y: any, z: any): number;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    isPassable(x: number, y: number, d: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isBoatPassable(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isShipPassable(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isAirshipLandOk(x: any, y: any): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param bit 
     * @return  
     */
    checkLayeredTilesFlags(x: number, y: number, bit: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isLadder(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isBush(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCounter(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isDamageFloor(x: any, y: any): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    terrainTag(x: number, y: number): number;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    regionId(x: number, y: number): number;

    /**
     * 
     * @param direction 
     * @param distance 
     * @param speed 
     */
    startScroll(direction: any, distance: any, speed: any): void;

    /**
     * 
     * @return  
     */
    isScrolling(): boolean;

    /**
     * 
     * @param sceneActive 
     */
    update(sceneActive: any): void;

    /**
     * 
     */
    updateScroll(): void;

    /**
     * 
     * @return  
     */
    scrollDistance(): number;

    /**
     * 
     * @param direction 
     * @param distance 
     */
    doScroll(direction: number, distance: number): void;

    /**
     * 
     */
    updateEvents(): void;

    /**
     * 
     */
    updateVehicles(): void;

    /**
     * 
     */
    updateParallax(): void;

    /**
     * 
     * @param tilesetId 
     */
    changeTileset(tilesetId: any): void;

    /**
     * 
     * @param battleback1Name 
     * @param battleback2Name 
     */
    changeBattleback(battleback1Name: any, battleback2Name: any): void;

    /**
     * 
     * @param name 
     * @param loopX 
     * @param loopY 
     * @param sx 
     * @param sy 
     */
    changeParallax(name: any, loopX: any, loopY: any, sx: any, sy: any): void;

    /**
     * 
     */
    updateInterpreter(): void;

    /**
     * 
     * @param eventId 
     */
    unlockEvent(eventId: number): void;

    /**
     * 
     * @return  
     */
    setupStartingEvent(): boolean;

    /**
     * 
     * @return  
     */
    setupTestEvent(): boolean;

    /**
     * 
     * @return  
     */
    setupStartingMapEvent(): boolean;

    /**
     * 
     * @return  
     */
    setupAutorunCommonEvent(): boolean;

    /**
     * 
     * @return  
     */
    isAnyEventStarting(): boolean;

    /**
     * 
     */
    _mapId: number;

    /**
     * 
     */
    _tilesetId: number;

    /**
     * 
     */
    _events: Array</* Game_Map._eventsI */ any>;

    /**
     * 
     */
    _commonEvents: Array</* Game_Map.+Game_CommonEvent */ any>;

    /**
     * 
     */
    _vehicles: Array</* Game_Map.+Game_Vehicle */ any>;

    /**
     * 
     */
    _displayX: number;

    /**
     * 
     */
    _displayY: number;

    /**
     * 
     */
    _nameDisplay: boolean;

    /**
     * 
     */
    _scrollDirection: number;

    /**
     * 
     */
    _scrollRest: number;

    /**
     * 
     */
    _scrollSpeed: number;

    /**
     * 
     */
    _parallaxName: string;

    /**
     * 
     */
    _parallaxZero: boolean;

    /**
     * 
     */
    _parallaxLoopX: boolean;

    /**
     * 
     */
    _parallaxLoopY: boolean;

    /**
     * 
     */
    _parallaxSx: number;

    /**
     * 
     */
    _parallaxSy: number;

    /**
     * 
     */
    _parallaxX: number;

    /**
     * 
     */
    _parallaxY: number;

    /**
     * 
     */
    _needsRefresh: boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Game_CommonEvent
 * 
 * The game object class for a common event. It contains functionality for
 * running parallel process events.
 */
declare class Game_CommonEvent {

    /**
     * 
     */
    new();

    /**
     * 
     * @param commonEventId 
     */
    initialize(commonEventId: any): void;

    /**
     * 
     */
    event(): void;

    /**
     * 
     */
    list(): void;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @return  
     */
    isActive(): boolean;

    /**
     * 
     */
    update(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Game_CharacterBase
 * 
 * The superclass of Game_Character. It handles basic information, such as
 * coordinates and images, shared by all characters.
 */
declare class Game_CharacterBase {

    x: number;
    y: number;

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    pos(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    posNt(x: number, y: number): boolean;

    /**
     * 
     * @return  
     */
    moveSpeed(): /* !this._moveSpeed */ any;

    /**
     * 
     * @param moveSpeed 
     */
    setMoveSpeed(moveSpeed: number): void;

    /**
     * 
     * @return  
     */
    moveFrequency(): /* !this._moveFrequency */ any;

    /**
     * 
     * @param moveFrequency 
     */
    setMoveFrequency(moveFrequency: any): void;

    /**
     * 
     * @return  
     */
    opacity(): /* !this._opacity */ any;

    /**
     * 
     * @param opacity 
     */
    setOpacity(opacity: number): void;

    /**
     * 
     * @return  
     */
    blendMode(): /* !this._blendMode */ any;

    /**
     * 
     * @param blendMode 
     */
    setBlendMode(blendMode: number): void;

    /**
     * 
     * @return  
     */
    isNormalPriority(): boolean;

    /**
     * 
     * @param priorityType 
     */
    setPriorityType(priorityType: number): void;

    /**
     * 
     * @return  
     */
    isMoving(): boolean;

    /**
     * 
     * @return  
     */
    isJumping(): boolean;

    /**
     * 
     * @return  
     */
    jumpHeight(): number;

    /**
     * 
     * @return  
     */
    isStopping(): boolean;

    /**
     * 
     * @param threshold 
     * @return  
     */
    checkStop(threshold: number): boolean;

    /**
     * 
     */
    resetStopCount(): void;

    /**
     * 
     * @return  
     */
    realMoveSpeed(): number;

    /**
     * 
     * @return  
     */
    distancePerFrame(): number;

    /**
     * 
     * @return  
     */
    isDashing(): boolean;

    /**
     * 
     * @return  
     */
    isDebugThrough(): boolean;

    /**
     * 
     */
    straighten(): void;

    /**
     * 
     * @param d 
     * @return  
     */
    reverseDir(d: number): number;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    canPass(x: number, y: number, d: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param horz 
     * @param vert 
     * @return  
     */
    canPassDiagonally(x: number, y: number, horz: number, vert: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    isMapPassable(x: number, y: number, d: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithCharacters(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithEvents(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollidedWithVehicles(x: number, y: number): boolean;

    /**
     * 
     * @param x 
     * @param y 
     */
    setPosition(x: number, y: number): void;

    /**
     * 
     * @param character 
     */
    copyPosition(character: Game_Player): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    locate(x: number, y: number): void;

    /**
     * 
     * @return  
     */
    direction(): /* !this._direction */ any;

    /**
     * 
     * @param d 
     */
    setDirection(d: number): void;

    /**
     * 
     * @return  
     */
    isTile(): boolean;

    /**
     * 
     * @return  
     */
    isObjectCharacter(): /* !this._isObjectCharacter */ any;

    /**
     * 
     * @return  
     */
    shiftY(): number;

    /**
     * 
     * @return  
     */
    scrolledX(): number;

    /**
     * 
     * @return  
     */
    scrolledY(): number;

    /**
     * 
     * @return  
     */
    screenX(): number;

    /**
     * 
     * @return  
     */
    screenY(): number;

    /**
     * 
     * @return  
     */
    screenZ(): number;

    /**
     * 
     * @return  
     */
    isNearTheScreen(): boolean;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateStop(): void;

    /**
     * 
     */
    updateJump(): void;

    /**
     * 
     */
    updateMove(): void;

    /**
     * 
     */
    updateAnimation(): void;

    /**
     * 
     * @return  
     */
    animationWait(): number;

    /**
     * 
     */
    updateAnimationCount(): void;

    /**
     * 
     */
    updatePattern(): void;

    /**
     * 
     * @return  
     */
    maxPattern(): number;

    /**
     * 
     * @return  
     */
    pattern(): /* !this._pattern */ any;

    /**
     * 
     * @param pattern 
     */
    setPattern(pattern: number): void;

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
     */
    refreshBushDepth(): void;

    /**
     * 
     * @return  
     */
    isOnLadder(): boolean;

    /**
     * 
     * @return  
     */
    isOnBush(): boolean;

    /**
     * 
     * @return  
     */
    terrainTag(): number;

    /**
     * 
     * @return  
     */
    regionId(): number;

    /**
     * 
     */
    increaseSteps(): void;

    /**
     * 
     * @return  
     */
    tileId(): /* !this._tileId */ any;

    /**
     * 
     * @return  
     */
    characterName(): /* !this._characterName */ any;

    /**
     * 
     * @return  
     */
    characterIndex(): /* !this._characterIndex */ any;

    /**
     * 
     * @param characterName 
     * @param characterIndex 
     */
    setImage(characterName: string, characterIndex: number): void;

    /**
     * 
     * @param tileId 
     */
    setTileImage(tileId: any): void;

    /**
     * 
     * @param d 
     */
    checkEventTriggerTouchFront(d: number): void;

    /**
     * 
     * @return  
     */
    checkEventTriggerTouch(): boolean;

    /**
     * 
     * @return  
     */
    isMovementSucceeded(): /* !this._movementSuccess */ any;

    /**
     * 
     * @param success 
     */
    setMovementSuccess(success: boolean): void;

    /**
     * 
     * @param d 
     */
    moveStraight(d: number): void;

    /**
     * 
     * @param horz 
     * @param vert 
     */
    moveDiagonally(horz: number, vert: number): void;

    /**
     * 
     * @param xPlus 
     * @param yPlus 
     */
    jump(xPlus: number, yPlus: number): void;

    /**
     * 
     * @return  
     */
    hasWalkAnime(): /* !this._walkAnime */ any;

    /**
     * 
     * @param walkAnime 
     */
    setWalkAnime(walkAnime: boolean): void;

    /**
     * 
     * @return  
     */
    hasStepAnime(): /* !this._stepAnime */ any;

    /**
     * 
     * @param stepAnime 
     */
    setStepAnime(stepAnime: boolean): void;

    /**
     * 
     * @return  
     */
    isDirectionFixed(): /* !this._directionFix */ any;

    /**
     * 
     * @param directionFix 
     */
    setDirectionFix(directionFix: boolean): void;

    /**
     * 
     * @return  
     */
    isThrough(): /* !this._through */ any;

    /**
     * 
     * @param through 
     */
    setThrough(through: boolean): void;

    /**
     * 
     * @return  
     */
    isTransparent(): /* !this._transparent */ any;

    /**
     * 
     * @return  
     */
    bushDepth(): /* !this._bushDepth */ any;

    /**
     * 
     * @param transparent 
     */
    setTransparent(transparent: boolean): void;

    /**
     * 
     */
    startAnimation(): void;

    /**
     * 
     */
    startBalloon(): void;

    /**
     * 
     * @return  
     */
    isAnimationPlaying(): /* !this._animationPlaying */ any;

    /**
     * 
     * @return  
     */
    isBalloonPlaying(): /* !this._balloonPlaying */ any;

    /**
     * 
     */
    endAnimation(): void;

    /**
     * 
     */
    endBalloon(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Character
 * 
 * The superclass of Game_Player, Game_Follower, GameVehicle, and Game_Event.
 */
declare class Game_Character extends Game_CharacterBase {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     */
    memorizeMoveRoute(): void;

    /**
     * 
     */
    restoreMoveRoute(): void;

    /**
     * 
     * @return  
     */
    isMoveRouteForcing(): /* !this._moveRouteForcing */ any;

    /**
     * 
     * @param moveRoute 
     */
    setMoveRoute(moveRoute: any): void;

    /**
     * 
     * @param moveRoute 
     */
    forceMoveRoute(moveRoute: any): void;

    /**
     * 
     */
    updateStop(): void;

    /**
     * 
     */
    updateRoutineMove(): void;

    /**
     * 
     * @param command 
     */
    processMoveCommand(command: any): void;

    /**
     * 
     * @param x 
     * @return  
     */
    deltaXFrom(x: number): number;

    /**
     * 
     * @param y 
     * @return  
     */
    deltaYFrom(y: number): number;

    /**
     * 
     */
    moveRandom(): void;

    /**
     * 
     * @param character 
     */
    moveTowardCharacter(character: Game_Player): void;

    /**
     * 
     * @param character 
     */
    moveAwayFromCharacter(character: Game_Player): void;

    /**
     * 
     * @param character 
     */
    turnTowardCharacter(character: Game_Player): void;

    /**
     * 
     * @param character 
     */
    turnAwayFromCharacter(character: Game_Player): void;

    /**
     * 
     */
    turnTowardPlayer(): void;

    /**
     * 
     */
    turnAwayFromPlayer(): void;

    /**
     * 
     */
    moveTowardPlayer(): void;

    /**
     * 
     */
    moveAwayFromPlayer(): void;

    /**
     * 
     */
    moveForward(): void;

    /**
     * 
     */
    moveBackward(): void;

    /**
     * 
     */
    processRouteEnd(): void;

    /**
     * 
     */
    advanceMoveRouteIndex(): void;

    /**
     * 
     */
    turnRight90(): void;

    /**
     * 
     */
    turnLeft90(): void;

    /**
     * 
     */
    turn180(): void;

    /**
     * 
     */
    turnRightOrLeft90(): void;

    /**
     * 
     */
    turnRandom(): void;

    /**
     * 
     * @param character 
     */
    swap(character: Game_Player): void;

    /**
     * 
     * @param goalX 
     * @param goalY 
     * @return  
     */
    findDirectionTo(goalX: number, goalY: number): number;

    /**
     * 
     * @return  
     */
    searchLimit(): number;

    /**
     * 
     */
    ROUTE_END: number;

    /**
     * 
     */
    ROUTE_MOVE_DOWN: number;

    /**
     * 
     */
    ROUTE_MOVE_LEFT: number;

    /**
     * 
     */
    ROUTE_MOVE_RIGHT: number;

    /**
     * 
     */
    ROUTE_MOVE_UP: number;

    /**
     * 
     */
    ROUTE_MOVE_LOWER_L: number;

    /**
     * 
     */
    ROUTE_MOVE_LOWER_R: number;

    /**
     * 
     */
    ROUTE_MOVE_UPPER_L: number;

    /**
     * 
     */
    ROUTE_MOVE_UPPER_R: number;

    /**
     * 
     */
    ROUTE_MOVE_RANDOM: number;

    /**
     * 
     */
    ROUTE_MOVE_TOWARD: number;

    /**
     * 
     */
    ROUTE_MOVE_AWAY: number;

    /**
     * 
     */
    ROUTE_MOVE_FORWARD: number;

    /**
     * 
     */
    ROUTE_MOVE_BACKWARD: number;

    /**
     * 
     */
    ROUTE_JUMP: number;

    /**
     * 
     */
    ROUTE_WAIT: number;

    /**
     * 
     */
    ROUTE_TURN_DOWN: number;

    /**
     * 
     */
    ROUTE_TURN_LEFT: number;

    /**
     * 
     */
    ROUTE_TURN_RIGHT: number;

    /**
     * 
     */
    ROUTE_TURN_UP: number;

    /**
     * 
     */
    ROUTE_TURN_90D_R: number;

    /**
     * 
     */
    ROUTE_TURN_90D_L: number;

    /**
     * 
     */
    ROUTE_TURN_180D: number;

    /**
     * 
     */
    ROUTE_TURN_90D_R_L: number;

    /**
     * 
     */
    ROUTE_TURN_RANDOM: number;

    /**
     * 
     */
    ROUTE_TURN_TOWARD: number;

    /**
     * 
     */
    ROUTE_TURN_AWAY: number;

    /**
     * 
     */
    ROUTE_SWITCH_ON: number;

    /**
     * 
     */
    ROUTE_SWITCH_OFF: number;

    /**
     * 
     */
    ROUTE_CHANGE_SPEED: number;

    /**
     * 
     */
    ROUTE_CHANGE_FREQ: number;

    /**
     * 
     */
    ROUTE_WALK_ANIME_ON: number;

    /**
     * 
     */
    ROUTE_WALK_ANIME_OFF: number;

    /**
     * 
     */
    ROUTE_STEP_ANIME_ON: number;

    /**
     * 
     */
    ROUTE_STEP_ANIME_OFF: number;

    /**
     * 
     */
    ROUTE_DIR_FIX_ON: number;

    /**
     * 
     */
    ROUTE_DIR_FIX_OFF: number;

    /**
     * 
     */
    ROUTE_THROUGH_ON: number;

    /**
     * 
     */
    ROUTE_THROUGH_OFF: number;

    /**
     * 
     */
    ROUTE_TRANSPARENT_ON: number;

    /**
     * 
     */
    ROUTE_TRANSPARENT_OFF: number;

    /**
     * 
     */
    ROUTE_CHANGE_IMAGE: number;

    /**
     * 
     */
    ROUTE_CHANGE_OPACITY: number;

    /**
     * 
     */
    ROUTE_CHANGE_BLEND_MODE: number;

    /**
     * 
     */
    ROUTE_PLAY_SE: number;

    /**
     * 
     */
    ROUTE_SCRIPT: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Player
 * 
 * The game object class for the player. It contains event starting
 * determinants and map scrolling functions.
 */
declare class Game_Player extends Game_Character {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     */
    clearTransferInfo(): void;

    /**
     * 
     * @return  
     */
    followers(): /* !this._followers */ any;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @return  
     */
    isStopping(): boolean;

    /**
     * 
     * @param mapId 
     * @param x 
     * @param y 
     * @param d 
     * @param fadeType 
     */
    reserveTransfer(mapId: number, x: number, y: number, d: number, fadeType: number): void;

    /**
     * 
     */
    setupForNewGame(): void;

    /**
     * 
     */
    requestMapReload(): void;

    /**
     * 
     * @return  
     */
    isTransferring(): /* !this._transferring */ any;

    /**
     * 
     * @return  
     */
    newMapId(): /* !this._newMapId */ any;

    /**
     * 
     * @return  
     */
    fadeType(): /* !this._fadeType */ any;

    /**
     * 
     */
    performTransfer(): void;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    isMapPassable(x: number, y: number, d: number): boolean;

    /**
     * 
     * @return  
     */
    vehicle(): Game_Vehicle;

    /**
     * 
     * @return  
     */
    isInBoat(): boolean;

    /**
     * 
     * @return  
     */
    isInShip(): boolean;

    /**
     * 
     * @return  
     */
    isInAirship(): boolean;

    /**
     * 
     * @return  
     */
    isInVehicle(): boolean;

    /**
     * 
     * @return  
     */
    isNormal(): boolean;

    /**
     * 
     * @return  
     */
    isDashing(): /* !this._dashing */ any;

    /**
     * 
     * @return  
     */
    isDebugThrough(): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isCollided(x: any, y: any): boolean;

    /**
     * 
     * @return  
     */
    centerX(): number;

    /**
     * 
     * @return  
     */
    centerY(): number;

    /**
     * 
     * @param x 
     * @param y 
     */
    center(x: number, y: number): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    locate(x: number, y: number): void;

    /**
     * 
     */
    increaseSteps(): void;

    /**
     * 
     */
    makeEncounterCount(): void;

    /**
     * 
     * @return  
     */
    makeEncounterTroopId(): number;

    /**
     * 
     * @param encounter 
     * @return  
     */
    meetsEncounterConditions(encounter: any): boolean;

    /**
     * 
     * @return  
     */
    executeEncounter(): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param triggers 
     * @param normal 
     */
    startMapEvent(x: number, y: number, triggers: Game_Player.prototype.StartMapEvent2, normal: boolean): void;

    /**
     * 
     */
    moveByInput(): void;

    /**
     * 
     * @return  
     */
    canMove(): boolean;

    /**
     * 
     */
    getInputDirection(): void;

    /**
     * 
     * @param direction 
     */
    executeMove(direction: number): void;

    /**
     * 
     * @param sceneActive 
     */
    update(sceneActive: boolean): void;

    /**
     * 
     */
    updateDashing(): void;

    /**
     * 
     * @return  
     */
    isDashButtonPressed(): boolean;

    /**
     * 
     * @param lastScrolledX 
     * @param lastScrolledY 
     */
    updateScroll(lastScrolledX: number, lastScrolledY: number): void;

    /**
     * 
     */
    updateVehicle(): void;

    /**
     * 
     */
    updateVehicleGetOn(): void;

    /**
     * 
     */
    updateVehicleGetOff(): void;

    /**
     * 
     * @param wasMoving 
     * @param sceneActive 
     */
    updateNonmoving(wasMoving: boolean, sceneActive: boolean): void;

    /**
     * 
     * @return  
     */
    triggerAction(): boolean;

    /**
     * 
     * @return  
     */
    triggerButtonAction(): boolean;

    /**
     * 
     * @return  
     */
    triggerTouchAction(): boolean;

    /**
     * 
     * @param x1 
     * @param y1 
     * @return  
     */
    triggerTouchActionD1(x1: any, y1: any): boolean;

    /**
     * 
     * @param x2 
     * @param y2 
     * @return  
     */
    triggerTouchActionD2(x2: number, y2: number): boolean;

    /**
     * 
     * @param x2 
     * @param y2 
     * @return  
     */
    triggerTouchActionD3(x2: number, y2: number): boolean;

    /**
     * 
     */
    updateEncounterCount(): void;

    /**
     * 
     * @return  
     */
    canEncounter(): boolean;

    /**
     * 
     * @return  
     */
    encounterProgressValue(): number;

    /**
     * 
     * @param triggers 
     */
    checkEventTriggerHere(triggers: Game_Player.prototype.CheckEventTriggerHere0): void;

    /**
     * 
     * @param triggers 
     */
    checkEventTriggerThere(triggers: Game_Player.prototype.CheckEventTriggerThere0): void;

    /**
     * 
     * @param x 
     * @param y 
     */
    checkEventTriggerTouch(x: any, y: any): void;

    /**
     * 
     * @return  
     */
    canStartLocalEvents(): boolean;

    /**
     * 
     * @return  
     */
    getOnOffVehicle(): boolean;

    /**
     * 
     * @return  
     */
    getOnVehicle(): /* !this._vehicleGettingOn */ any;

    /**
     * 
     * @return  
     */
    getOffVehicle(): /* !this._vehicleGettingOff */ any;

    /**
     * 
     */
    forceMoveForward(): void;

    /**
     * 
     * @return  
     */
    isOnDamageFloor(): boolean;

    /**
     * 
     * @param d 
     */
    moveStraight(d: any): void;

    /**
     * 
     * @param horz 
     * @param vert 
     */
    moveDiagonally(horz: any, vert: any): void;

    /**
     * 
     * @param xPlus 
     * @param yPlus 
     */
    jump(xPlus: any, yPlus: any): void;

    /**
     * 
     */
    showFollowers(): void;

    /**
     * 
     */
    hideFollowers(): void;

    /**
     * 
     */
    gatherFollowers(): void;

    /**
     * 
     * @return  
     */
    areFollowersGathering(): boolean;

    /**
     * 
     * @return  
     */
    areFollowersGathered(): boolean;

    /**
     * 
     */
    _transparent: boolean;

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
    _vehicleType: string;

    /**
     * 
     */
    _vehicleGettingOn: boolean;

    /**
     * 
     */
    _vehicleGettingOff: boolean;

    /**
     * 
     */
    _dashing: boolean;

    /**
     * 
     */
    _needsMapReload: boolean;

    /**
     * 
     */
    _transferring: boolean;

    /**
     * 
     */
    _newMapId: number;

    /**
     * 
     */
    _newX: number;

    /**
     * 
     */
    _newY: number;

    /**
     * 
     */
    _newDirection: number;

    /**
     * 
     */
    _fadeType: number;

    /**
     * 
     */
    _followers: Game_Followers;

    /**
     * 
     */
    _encounterCount: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Follower
 * 
 * The game object class for a follower. A follower is an allied character,
 * other than the front character, displayed in the party.
 */
declare class Game_Follower extends Game_Character {

    /**
     * 
     */
    new();

    /**
     * 
     * @param memberIndex 
     */
    initialize(memberIndex: any): void;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @return  
     */
    actor(): Game_Actor;

    /**
     * 
     * @return  
     */
    isVisible(): Game_Actor;
    /**
     * 
     */
    isVisible();

    /**
     * 
     * @return  
     */
    isGathered(): boolean;

    /**
     * 
     */
    update(): void;

    /**
     * 
     * @param character 
     */
    chaseCharacter(character: Game_Player): void;

    /**
     * 
     */
    _through: boolean;

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
    _moveSpeed: number;

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
    _realX: number;

    /**
     * 
     */
    _realY: number;

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
    _animationCount: number;

    /**
     * 
     */
    _bushDepth: number;

    /**
     * 
     */
    _pattern: number;

    /**
     * 
     */
    _movementSuccess: boolean;

    /**
     * 
     */
    _waitCount: number;

    /**
     * 
     */
    _moveRouteIndex: number;

    /**
     * 
     */
    _moveRouteForcing: boolean;

    /**
     * 
     */
    _jumpPeak: number;

    /**
     * 
     */
    _jumpCount: number;

    /**
     * 
     */
    _direction: number;

    /**
     * 
     */
    _stopCount: number;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Followers
 * 
 * The wrapper class for a follower array.
 */
declare class Game_Followers {

    /**
     * 
     */
    new();

    /**
     * 
     */
    initialize(): void;

    /**
     * 
     */
    setup(): void;

    /**
     * 
     * @return  
     */
    isVisible(): /* !this._visible */ any;

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
     * @return  
     */
    data(): Array<number>;

    /**
     * 
     */
    reverseData(): void;

    /**
     * 
     * @param index 
     * @return  
     */
    follower(index: any): /* !this._data.<i> */ any;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateMove(): void;

    /**
     * 
     */
    jumpAll(): void;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     */
    synchronize(x: number, y: number, d: number): void;

    /**
     * 
     */
    gather(): void;

    /**
     * 
     * @return  
     */
    areGathering(): /* !this._gathering */ any;

    /**
     * 
     * @return  
     */
    visibleFollowers(): Game_Followers.prototype.VisibleFollowersRet;

    /**
     * 
     * @return  
     */
    areMoving(): boolean;

    /**
     * 
     * @return  
     */
    areGathered(): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    isSomeoneCollided(x: any, y: any): boolean;

    /**
     * 
     */
    _visible: boolean;

    /**
     * 
     */
    _gathering: boolean;

    /**
     * 
     */
    _data: Array</* Game_Followers.+Game_Follower */ any>;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Vehicle
 * 
 * The game object class for a vehicle.
 */
declare class Game_Vehicle extends Game_Character {

    /**
     * 
     */
    new();

    /**
     * 
     * @param type 
     */
    initialize(type: any): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @return  
     */
    isBoat(): boolean;

    /**
     * 
     * @return  
     */
    isShip(): boolean;

    /**
     * 
     * @return  
     */
    isAirship(): boolean;

    /**
     * 
     */
    resetDirection(): void;

    /**
     * 
     */
    initMoveSpeed(): void;

    /**
     * 
     */
    vehicle(): void;

    /**
     * 
     */
    loadSystemSettings(): void;

    /**
     * 
     */
    refresh(): void;

    /**
     * 
     * @param mapId 
     * @param x 
     * @param y 
     */
    setLocation(mapId: number, x: number, y: number): void;

    /**
     * 
     * @param x 
     * @param y 
     * @return  
     */
    pos(x: any, y: any): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    isMapPassable(x: any, y: any, d: any): boolean;

    /**
     * 
     */
    getOn(): void;

    /**
     * 
     */
    getOff(): void;

    /**
     * 
     * @param bgm 
     */
    setBgm(bgm: any): void;

    /**
     * 
     */
    playBgm(): void;

    /**
     * 
     */
    syncWithPlayer(): void;

    /**
     * 
     * @return  
     */
    screenY(): number;

    /**
     * 
     * @return  
     */
    shadowX(): number;

    /**
     * 
     * @return  
     */
    shadowY(): number;

    /**
     * 
     * @return  
     */
    shadowOpacity(): number;

    /**
     * 
     * @return  
     */
    canMove(): boolean;

    /**
     * 
     */
    update(): void;

    /**
     * 
     */
    updateAirship(): void;

    /**
     * 
     */
    updateAirshipAltitude(): void;

    /**
     * 
     * @return  
     */
    maxAltitude(): number;

    /**
     * 
     * @return  
     */
    isLowest(): boolean;

    /**
     * 
     * @return  
     */
    isHighest(): boolean;

    /**
     * 
     * @return  
     */
    isTakeoffOk(): boolean;

    /**
     * 
     * @param x 
     * @param y 
     * @param d 
     * @return  
     */
    isLandOk(x: any, y: any, d: number): boolean;

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
    _type: string;

    /**
     * 
     */
    _mapId: number;

    /**
     * 
     */
    _altitude: number;

    /**
     * 
     */
    _driving: boolean;
}

/**
 * -----------------------------------------------------------------------------
 * Game_Event
 * 
 * The game object class for an event. It contains functionality for event page
 * switching and running parallel process events.
 */
declare class Game_Event extends Game_Character {

    /**
     * 
     */
    new();

    /**
     * 
     * @param mapId 
     * @param eventId 
     */
    initialize(mapId: any, eventId: any): void;

    /**
     * 
     */
    initMembers(): void;

    /**
     * 
     * @return  
     */
    eventId(): /* !this._eventId */ any;

    /**
     * 
     */
    event(): void;

    /**
     * 
     */
    page(): void;

    /**
     * 
     */
    list(): void;

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
    checkEventTriggerTouch(x: any, y: any): void;

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

/**
 * -----------------------------------------------------------------------------
 * Game_Interpreter
 * 
 * The interpreter for running event commands.
 */
declare class Game_Interpreter {

    /**
     * 
     */
    new();

    /**
     * 
     * @param depth 
     */
    initialize(depth: any): void;

    /**
     * 
     */
    checkOverflow(): void;

    /**
     * 
     */
    clear(): void;

    /**
     * 
     * @param list 
     * @param eventId 
     */
    setup(list: any, eventId: number): void;

    /**
     * 
     */
    loadImages(): void;

    /**
     * 
     * @return  
     */
    eventId(): /* !this._eventId */ any;

    /**
     * 
     * @return  
     */
    isOnCurrentMap(): boolean;

    /**
     * 
     * @return  
     */
    setupReservedCommonEvent(): boolean;

    /**
     * 
     * @return  
     */
    isRunning(): boolean;

    /**
     * 
     */
    update(): void;

    /**
     * 
     * @return  
     */
    updateChild(): boolean;

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
    setWaitMode(waitMode: string): void;

    /**
     * 
     * @param duration 
     */
    wait(duration: number): void;

    /**
     * 
     * @return  
     */
    fadeSpeed(): number;

    /**
     * 
     * @return  
     */
    executeCommand(): boolean;

    /**
     * 
     * @return  
     */
    checkFreeze(): boolean;

    /**
     * 
     */
    terminate(): void;

    /**
     * 
     */
    skipBranch(): void;

    /**
     * 
     * @return  
     */
    currentCommand(): /* !this._list.<i> */ any;

    /**
     * 
     * @return  
     */
    nextEventCode(): number;

    /**
     * 
     * @param param 
     * @param callback 
     */
    iterateActorId(param: number, callback: Game_Interpreter.prototype.IterateActorId1): void;

    /**
     * 
     * @param param1 
     * @param param2 
     * @param callback 
     */
    iterateActorEx(param1: any, param2: any, callback: Game_Interpreter.prototype.IterateActorEx2): void;

    /**
     * 
     * @param param 
     * @param callback 
     */
    iterateActorIndex(param: any, callback: any): void;

    /**
     * 
     * @param param 
     * @param callback 
     */
    iterateEnemyIndex(param: number, callback: () => void): void;

    /**
     * 
     * @param param1 
     * @param param2 
     * @param callback 
     */
    iterateBattler(param1: any, param2: any, callback: () => void): void;

    /**
     * 
     * @param param 
     * @return  
     */
    character(param: number): Game_Player;

    /**
     * prettier-ignore
     * @param operation 
     * @param operandType 
     * @param operand 
     * @return  
     */
    operateValue(operation: any, operandType: any, operand: any): any;

    /**
     * 
     * @param target 
     * @param value 
     * @param allowDeath 
     */
    changeHp(target: Game_Actor, value: number, allowDeath: any): void;

    /**
     * Show Text
     * @param params 
     * @return  
     */
    command101(params: any): boolean;

    /**
     * Show Choices
     * @param params 
     * @return  
     */
    command102(params: any): boolean;

    /**
     * 
     * @param params 
     */
    setupChoices(params: any): void;

    /**
     * When [**]
     * @param params 
     * @return  
     */
    command402(params: any): boolean;

    /**
     * When Cancel
     * @return  
     */
    command403(): boolean;

    /**
     * Input Number
     * @param params 
     * @return  
     */
    command103(params: any): boolean;

    /**
     * 
     * @param params 
     */
    setupNumInput(params: any): void;

    /**
     * Select Item
     * @param params 
     * @return  
     */
    command104(params: any): boolean;

    /**
     * 
     * @param params 
     */
    setupItemChoice(params: any): void;

    /**
     * Show Scrolling Text
     * @param params 
     * @return  
     */
    command105(params: any): boolean;

    /**
     * Comment
     * @param params 
     * @return  
     */
    command108(params: any): boolean;

    /**
     * Conditional Branch
     * @param params 
     * @return  
     */
    command111(params: any): boolean;

    /**
     * Else
     * @return  
     */
    command411(): boolean;

    /**
     * Loop
     * @return  
     */
    command112(): boolean;

    /**
     * Repeat Above
     * @return  
     */
    command413(): boolean;

    /**
     * Break Loop
     * @return  
     */
    command113(): boolean;

    /**
     * Exit Event Processing
     * @return  
     */
    command115(): boolean;

    /**
     * Common Event
     * @param params 
     * @return  
     */
    command117(params: any): boolean;

    /**
     * 
     * @param list 
     * @param eventId 
     */
    setupChild(list: any, eventId: number): void;

    /**
     * Label
     * @return  
     */
    command118(): boolean;

    /**
     * Jump to Label
     * @param params 
     * @return  
     */
    command119(params: any): boolean;

    /**
     * 
     * @param index 
     */
    jumpTo(index: number): void;

    /**
     * Control Switches
     * @param params 
     * @return  
     */
    command121(params: any): boolean;

    /**
     * Control Variables
     * @param params 
     * @return  
     */
    command122(params: any): boolean;

    /**
     * 
     * @param type 
     * @param param1 
     * @param param2 
     * @return  
     */
    gameDataOperand(type: any, param1: any, param2: any): number;

    /**
     * 
     * @param variableId 
     * @param operationType 
     * @param value 
     */
    operateVariable(variableId: any, operationType: any, value: number): void;

    /**
     * Control Self Switch
     * @param params 
     * @return  
     */
    command123(params: any): boolean;

    /**
     * Control Timer
     * @param params 
     * @return  
     */
    command124(params: any): boolean;

    /**
     * Change Gold
     * @param params 
     * @return  
     */
    command125(params: any): boolean;

    /**
     * Change Items
     * @param params 
     * @return  
     */
    command126(params: any): boolean;

    /**
     * Change Weapons
     * @param params 
     * @return  
     */
    command127(params: any): boolean;

    /**
     * Change Armors
     * @param params 
     * @return  
     */
    command128(params: any): boolean;

    /**
     * Change Party Member
     * @param params 
     * @return  
     */
    command129(params: any): boolean;

    /**
     * Change Battle BGM
     * @param params 
     * @return  
     */
    command132(params: any): boolean;

    /**
     * Change Victory ME
     * @param params 
     * @return  
     */
    command133(params: any): boolean;

    /**
     * Change Save Access
     * @param params 
     * @return  
     */
    command134(params: any): boolean;

    /**
     * Change Menu Access
     * @param params 
     * @return  
     */
    command135(params: any): boolean;

    /**
     * Change Encounter
     * @param params 
     * @return  
     */
    command136(params: any): boolean;

    /**
     * Change Formation Access
     * @param params 
     * @return  
     */
    command137(params: any): boolean;

    /**
     * Change Window Color
     * @param params 
     * @return  
     */
    command138(params: any): boolean;

    /**
     * Change Defeat ME
     * @param params 
     * @return  
     */
    command139(params: any): boolean;

    /**
     * Change Vehicle BGM
     * @param params 
     * @return  
     */
    command140(params: any): boolean;

    /**
     * Transfer Player
     * @param params 
     * @return  
     */
    command201(params: any): boolean;

    /**
     * Set Vehicle Location
     * @param params 
     * @return  
     */
    command202(params: any): boolean;

    /**
     * Set Event Location
     * @param params 
     * @return  
     */
    command203(params: any): boolean;

    /**
     * Scroll Map
     * @param params 
     * @return  
     */
    command204(params: any): boolean;

    /**
     * Set Movement Route
     * @param params 
     * @return  
     */
    command205(params: any): boolean;

    /**
     * Get on/off Vehicle
     * @return  
     */
    command206(): boolean;

    /**
     * Change Transparency
     * @param params 
     * @return  
     */
    command211(params: any): boolean;

    /**
     * Show Animation
     * @param params 
     * @return  
     */
    command212(params: any): boolean;

    /**
     * Show Balloon Icon
     * @param params 
     * @return  
     */
    command213(params: any): boolean;

    /**
     * Erase Event
     * @return  
     */
    command214(): boolean;

    /**
     * Change Player Followers
     * @param params 
     * @return  
     */
    command216(params: any): boolean;

    /**
     * Gather Followers
     * @return  
     */
    command217(): boolean;

    /**
     * Fadeout Screen
     * @return  
     */
    command221(): boolean;

    /**
     * Fadein Screen
     * @return  
     */
    command222(): boolean;

    /**
     * Tint Screen
     * @param params 
     * @return  
     */
    command223(params: any): boolean;

    /**
     * Flash Screen
     * @param params 
     * @return  
     */
    command224(params: any): boolean;

    /**
     * Shake Screen
     * @param params 
     * @return  
     */
    command225(params: any): boolean;

    /**
     * Wait
     * @param params 
     * @return  
     */
    command230(params: any): boolean;

    /**
     * Show Picture
     * @param params 
     * @return  
     */
    command231(params: any): boolean;

    /**
     * Move Picture
     * @param params 
     * @return  
     */
    command232(params: any): boolean;

    /**
     * 
     * @param params 
     * @return  
     */
    picturePoint(params: any): Game_Interpreter.prototype.PicturePointRet;

    /**
     * Rotate Picture
     * @param params 
     * @return  
     */
    command233(params: any): boolean;

    /**
     * Tint Picture
     * @param params 
     * @return  
     */
    command234(params: any): boolean;

    /**
     * Erase Picture
     * @param params 
     * @return  
     */
    command235(params: any): boolean;

    /**
     * Set Weather Effect
     * @param params 
     * @return  
     */
    command236(params: any): boolean;

    /**
     * Play BGM
     * @param params 
     * @return  
     */
    command241(params: any): boolean;

    /**
     * Fadeout BGM
     * @param params 
     * @return  
     */
    command242(params: any): boolean;

    /**
     * Save BGM
     * @return  
     */
    command243(): boolean;

    /**
     * Resume BGM
     * @return  
     */
    command244(): boolean;

    /**
     * Play BGS
     * @param params 
     * @return  
     */
    command245(params: any): boolean;

    /**
     * Fadeout BGS
     * @param params 
     * @return  
     */
    command246(params: any): boolean;

    /**
     * Play ME
     * @param params 
     * @return  
     */
    command249(params: any): boolean;

    /**
     * Play SE
     * @param params 
     * @return  
     */
    command250(params: any): boolean;

    /**
     * Stop SE
     * @return  
     */
    command251(): boolean;

    /**
     * Play Movie
     * @param params 
     * @return  
     */
    command261(params: any): boolean;

    /**
     * 
     * @return  
     */
    videoFileExt(): string;

    /**
     * Change Map Name Display
     * @param params 
     * @return  
     */
    command281(params: any): boolean;

    /**
     * Change Tileset
     * @param params 
     * @return  
     */
    command282(params: any): boolean;

    /**
     * Change Battle Background
     * @param params 
     * @return  
     */
    command283(params: any): boolean;

    /**
     * Change Parallax
     * @param params 
     * @return  
     */
    command284(params: any): boolean;

    /**
     * Get Location Info
     * @param params 
     * @return  
     */
    command285(params: any): boolean;

    /**
     * Battle Processing
     * @param params 
     * @return  
     */
    command301(params: any): boolean;

    /**
     * If Win
     * @return  
     */
    command601(): boolean;

    /**
     * If Escape
     * @return  
     */
    command602(): boolean;

    /**
     * If Lose
     * @return  
     */
    command603(): boolean;

    /**
     * Shop Processing
     * @param params 
     * @return  
     */
    command302(params: any): boolean;

    /**
     * Name Input Processing
     * @param params 
     * @return  
     */
    command303(params: any): boolean;

    /**
     * Change HP
     * @param params 
     * @return  
     */
    command311(params: any): boolean;

    /**
     * Change MP
     * @param params 
     * @return  
     */
    command312(params: any): boolean;

    /**
     * Change TP
     * @param params 
     * @return  
     */
    command326(params: any): boolean;

    /**
     * Change State
     * @param params 
     * @return  
     */
    command313(params: any): boolean;

    /**
     * Recover All
     * @param params 
     * @return  
     */
    command314(params: any): boolean;

    /**
     * Change EXP
     * @param params 
     * @return  
     */
    command315(params: any): boolean;

    /**
     * Change Level
     * @param params 
     * @return  
     */
    command316(params: any): boolean;

    /**
     * Change Parameter
     * @param params 
     * @return  
     */
    command317(params: any): boolean;

    /**
     * Change Skill
     * @param params 
     * @return  
     */
    command318(params: any): boolean;

    /**
     * Change Equipment
     * @param params 
     * @return  
     */
    command319(params: any): boolean;

    /**
     * Change Name
     * @param params 
     * @return  
     */
    command320(params: any): boolean;

    /**
     * Change Class
     * @param params 
     * @return  
     */
    command321(params: any): boolean;

    /**
     * Change Actor Images
     * @param params 
     * @return  
     */
    command322(params: any): boolean;

    /**
     * Change Vehicle Image
     * @param params 
     * @return  
     */
    command323(params: any): boolean;

    /**
     * Change Nickname
     * @param params 
     * @return  
     */
    command324(params: any): boolean;

    /**
     * Change Profile
     * @param params 
     * @return  
     */
    command325(params: any): boolean;

    /**
     * Change Enemy HP
     * @param params 
     * @return  
     */
    command331(params: any): boolean;

    /**
     * Change Enemy MP
     * @param params 
     * @return  
     */
    command332(params: any): boolean;

    /**
     * Change Enemy TP
     * @param params 
     * @return  
     */
    command342(params: any): boolean;

    /**
     * Change Enemy State
     * @param params 
     * @return  
     */
    command333(params: any): boolean;

    /**
     * Enemy Recover All
     * @param params 
     * @return  
     */
    command334(params: any): boolean;

    /**
     * Enemy Appear
     * @param params 
     * @return  
     */
    command335(params: any): boolean;

    /**
     * Enemy Transform
     * @param params 
     * @return  
     */
    command336(params: any): boolean;

    /**
     * Show Battle Animation
     * @param params 
     * @return  
     */
    command337(params: any): boolean;

    /**
     * Force Action
     * @param params 
     * @return  
     */
    command339(params: any): boolean;

    /**
     * Abort Battle
     * @return  
     */
    command340(): boolean;

    /**
     * Open Menu Screen
     * @return  
     */
    command351(): boolean;

    /**
     * Open Save Screen
     * @return  
     */
    command352(): boolean;

    /**
     * Game Over
     * @return  
     */
    command353(): boolean;

    /**
     * Return to Title Screen
     * @return  
     */
    command354(): boolean;

    /**
     * Script
     * @return  
     */
    command355(): boolean;

    /**
     * Plugin Command MV (deprecated)
     * @param params 
     * @return  
     */
    command356(params: any): boolean;

    /**
     * 
     */
    pluginCommand(): void;

    /**
     * Plugin Command
     * @param params 
     * @return  
     */
    command357(params: any): boolean;

    /**
     * 
     */
    _depth: number;

    /**
     * 
     */
    _branch: /*no type*/{};

    /**
     * 
     */
    _indent: number;

    /**
     * 
     */
    _frameCount: number;

    /**
     * 
     */
    _freezeChecker: number;

    /**
     * 
     */
    _mapId: number;

    /**
     * 
     */
    _eventId: number;

    /**
     * 
     */
    _index: number;

    /**
     * 
     */
    _waitCount: number;

    /**
     * 
     */
    _waitMode: string;

    /**
     * 
     */
    _characterId: number;
}
