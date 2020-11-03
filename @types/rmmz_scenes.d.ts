// Type definitions for rmmz_scenes.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/**
 * -----------------------------------------------------------------------------
 * Scene_Base
 * 
 * The superclass of all scenes within the game.
 */
declare class Scene_Base {

	_windowLayer: WindowLayer;

	/**
	 * 
	 * @return  
	 */
    new(): Scene_Base;

    initialize(): void;
    create(): void;
    isActive(): boolean;
    isReady(): boolean;
    start(): void;
    update(): void;
    stop(): void;
    isStarted(): boolean;
    isBusy(): boolean;
    isFading(): boolean;
    terminate(): void;
    createWindowLayer(): void;
    addWindow(window: Window_Base): void;
    startFadeIn(duration: number, white: boolean): void;
    startFadeOut(duration: number, white: boolean): void;
    startFadeOut(): void;
    updateColorFilter(): void;
    updateFade(): void;
    updateChildren(): void;
    popScene(): void;
    checkGameover(): void;
    fadeOutAll(): void;
    fadeSpeed(): number;
    slowFadeSpeed(): number;
    scaleSprite(): void;
    centerSprite(sprite: Sprite_Base): void;
    isBottomHelpMode(): boolean;
    isBottomButtonMode(): boolean;
    isRightInputMode(): boolean;
    mainCommandWidth(): number;
    buttonAreaTop(): number;
    buttonAreaBottom(): number;
    buttonAreaHeight(): number;
    buttonY(): number;
    calcWindowHeight(numLines: number, selectable: boolean): number;
    requestAutosave(): void;
    isAutosaveEnabled(): boolean;
    executeAutosave(): void;
    onAutosaveSuccess(): void;
    onAutosaveFailure(): void;
}


/**
 * -----------------------------------------------------------------------------
 * Scene_Boot
 * 
 * The scene class for initializing the entire game.
 */
declare class Scene_Boot {

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
    create(): void;

	/**
	 * 
	 * @return  
	 */
    isReady(): boolean;

	/**
	 * 
	 */
    onDatabaseLoaded(): void;

	/**
	 * 
	 */
    setEncryptionInfo(): void;

	/**
	 * 
	 */
    loadSystemImages(): void;

	/**
	 * 
	 */
    loadPlayerData(): void;

	/**
	 * 
	 */
    loadGameFonts(): void;

	/**
	 * 
	 * @return  
	 */
    isPlayerDataLoaded(): boolean;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 */
    startNormalGame(): void;

	/**
	 * 
	 */
    resizeScreen(): void;

	/**
	 * 
	 */
    adjustBoxSize(): void;

	/**
	 * 
	 */
    adjustWindow(): void;

	/**
	 * 
	 */
    updateDocumentTitle(): void;

	/**
	 * 
	 */
    checkPlayerLocation(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Title
 * 
 * The scene class of the title screen.
 */
declare class Scene_Title {

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
    create(): void;

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
	 * @return  
	 */
    isBusy(): boolean;

	/**
	 * 
	 */
    terminate(): void;

	/**
	 * 
	 */
    createBackground(): void;

	/**
	 * 
	 */
    createForeground(): void;

	/**
	 * 
	 */
    drawGameTitle(): void;

	/**
	 * 
	 */
    adjustBackground(): void;

	/**
	 * 
	 */
    createCommandWindow(): void;

	/**
	 * 
	 */
    commandWindowRect(): void;

	/**
	 * 
	 */
    commandNewGame(): void;

	/**
	 * 
	 */
    commandContinue(): void;

	/**
	 * 
	 */
    commandOptions(): void;

	/**
	 * 
	 */
    playTitleMusic(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Message
 * 
 * The superclass of Scene_Map and Scene_Battle.
 */
declare class Scene_Message {

	/**
	 * 
	 * @return  
	 */
    new(): Scene_Message;
}


/**
 * -----------------------------------------------------------------------------
 * Scene_Map
 * 
 * The scene class of the map screen.
 */
declare class Scene_Map {

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
    create(): void;

	/**
	 * 
	 * @return  
	 */
    isReady(): /* !this._mapLoaded */ any;

	/**
	 * 
	 */
    onMapLoaded(): void;

	/**
	 * 
	 */
    onTransfer(): void;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 */
    onTransferEnd(): void;

	/**
	 * 
	 * @return  
	 */
    shouldAutosave(): boolean;

	/**
	 * 
	 */
    update(): void;

	/**
	 * 
	 */
    updateMainMultiply(): void;

	/**
	 * 
	 */
    updateMain(): void;

	/**
	 * 
	 * @return  
	 */
    isPlayerActive(): boolean;

	/**
	 * 
	 * @return  
	 */
    isFastForward(): boolean;

	/**
	 * 
	 */
    stop(): void;

	/**
	 * 
	 * @return  
	 */
    isBusy(): boolean;

	/**
	 * 
	 */
    terminate(): void;

	/**
	 * 
	 * @return  
	 */
    needsFadeIn(): boolean;

	/**
	 * 
	 * @return  
	 */
    needsSlowFadeOut(): /* Scene_Map.prototype.+Scene_Map */ any;

	/**
	 * 
	 * @return  
	 */
    updateWaitCount(): boolean;

	/**
	 * 
	 */
    updateDestination(): void;

	/**
	 * 
	 */
    updateMenuButton(): void;

	/**
	 * 
	 */
    hideMenuButton(): void;

	/**
	 * 
	 */
    updateMapNameWindow(): void;

	/**
	 * 
	 * @return  
	 */
    isMenuEnabled(): boolean;

	/**
	 * 
	 * @return  
	 */
    isMapTouchOk(): boolean;

	/**
	 * 
	 */
    processMapTouch(): void;

	/**
	 * 
	 * @return  
	 */
    isAnyButtonPressed(): /* !this._menuButton */ any;

	/**
	 * 
	 */
    onMapTouch(): void;

	/**
	 * 
	 * @return  
	 */
    isSceneChangeOk(): boolean;

	/**
	 * 
	 */
    updateScene(): void;

	/**
	 * 
	 */
    createDisplayObjects(): void;

	/**
	 * 
	 */
    createSpriteset(): void;

	/**
	 * 
	 */
    createAllWindows(): void;

	/**
	 * 
	 */
    createMapNameWindow(): void;

	/**
	 * 
	 */
    mapNameWindowRect(): void;

	/**
	 * 
	 */
    createButtons(): void;

	/**
	 * 
	 */
    createMenuButton(): void;

	/**
	 * 
	 */
    updateTransferPlayer(): void;

	/**
	 * 
	 */
    updateEncounter(): void;

	/**
	 * 
	 */
    updateCallMenu(): void;

	/**
	 * 
	 * @return  
	 */
    isMenuCalled(): boolean;

	/**
	 * 
	 */
    callMenu(): void;

	/**
	 * 
	 */
    updateCallDebug(): void;

	/**
	 * 
	 * @return  
	 */
    isDebugCalled(): boolean;

	/**
	 * 
	 */
    fadeInForTransfer(): void;

	/**
	 * 
	 */
    fadeOutForTransfer(): void;

	/**
	 * 
	 */
    launchBattle(): void;

	/**
	 * 
	 */
    stopAudioOnBattleStart(): void;

	/**
	 * 
	 */
    startEncounterEffect(): void;

	/**
	 * 
	 */
    updateEncounterEffect(): void;

	/**
	 * 
	 */
    snapForBattleBackground(): void;

	/**
	 * 
	 * @param duration 
	 */
    startFlashForEncounter(duration: number): void;

	/**
	 * 
	 * @return  
	 */
    encounterEffectSpeed(): number;

	/**
	 * 
	 */
    _waitCount: number;

	/**
	 * 
	 */
    _encounterEffectDuration: number;

	/**
	 * 
	 */
    _mapLoaded: boolean;

	/**
	 * 
	 */
    _touchCount: number;

	/**
	 * 
	 */
    _menuEnabled: boolean;

	/**
	 * 
	 */
    _transfer: boolean;

	/**
	 * 
	 */
    _lastMapWasNull: boolean;

	/**
	 * 
	 */
    menuCalling: boolean;

	/**
	 * 
	 */
    _spriteset: /*no type*/{};

	/**
	 * 
	 */
    _mapNameWindow: /*no type*/{};

	/**
	 * 
	 */
    _menuButton: /*no type*/{};
}

/**
 * -----------------------------------------------------------------------------
 * Scene_MenuBase
 * 
 * The superclass of all the menu-type scenes.
 */
declare class Scene_MenuBase extends Scene_Base {

	/**
	 * 
	 * @return  
	 */
    new(): Scene_MenuBase;
}


/**
 * -----------------------------------------------------------------------------
 * Scene_Menu
 * 
 * The scene class of the menu screen.
 */
declare class Scene_Menu {

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
    helpAreaHeight(): number;

	/**
	 * 
	 */
    create(): void;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 */
    createCommandWindow(): void;

	/**
	 * 
	 */
    commandWindowRect(): void;

	/**
	 * 
	 */
    createGoldWindow(): void;

	/**
	 * 
	 */
    goldWindowRect(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    commandItem(): void;

	/**
	 * 
	 */
    commandPersonal(): void;

	/**
	 * 
	 */
    commandFormation(): void;

	/**
	 * 
	 */
    commandOptions(): void;

	/**
	 * 
	 */
    commandSave(): void;

	/**
	 * 
	 */
    commandGameEnd(): void;

	/**
	 * 
	 */
    onPersonalOk(): void;

	/**
	 * 
	 */
    onPersonalCancel(): void;

	/**
	 * 
	 */
    onFormationOk(): void;

	/**
	 * 
	 */
    onFormationCancel(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_ItemBase
 * 
 * The superclass of Scene_Item and Scene_Skill.
 */
declare class Scene_ItemBase {

	/**
	 * 
	 * @return  
	 */
    new(): Scene_ItemBase;
}


/**
 * -----------------------------------------------------------------------------
 * Scene_Item
 * 
 * The scene class of the item screen.
 */
declare class Scene_Item {

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
    create(): void;

	/**
	 * 
	 */
    createCategoryWindow(): void;

	/**
	 * 
	 */
    categoryWindowRect(): void;

	/**
	 * 
	 */
    createItemWindow(): void;

	/**
	 * 
	 */
    itemWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    user(): Game_Actor;

	/**
	 * 
	 */
    onCategoryOk(): void;

	/**
	 * 
	 */
    onItemOk(): void;

	/**
	 * 
	 */
    onItemCancel(): void;

	/**
	 * 
	 */
    playSeForItem(): void;

	/**
	 * 
	 */
    useItem(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Skill
 * 
 * The scene class of the skill screen.
 */
declare class Scene_Skill {

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
    create(): void;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 */
    createSkillTypeWindow(): void;

	/**
	 * 
	 */
    skillTypeWindowRect(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    createItemWindow(): void;

	/**
	 * 
	 */
    itemWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    needsPageButtons(): boolean;

	/**
	 * 
	 * @return  
	 */
    arePageButtonsEnabled(): boolean;

	/**
	 * 
	 */
    refreshActor(): void;

	/**
	 * 
	 */
    user(): void;

	/**
	 * 
	 */
    commandSkill(): void;

	/**
	 * 
	 */
    onItemOk(): void;

	/**
	 * 
	 */
    onItemCancel(): void;

	/**
	 * 
	 */
    playSeForItem(): void;

	/**
	 * 
	 */
    useItem(): void;

	/**
	 * 
	 */
    onActorChange(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Equip
 * 
 * The scene class of the equipment screen.
 */
declare class Scene_Equip {

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
    create(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    createCommandWindow(): void;

	/**
	 * 
	 */
    commandWindowRect(): void;

	/**
	 * 
	 */
    createSlotWindow(): void;

	/**
	 * 
	 */
    slotWindowRect(): void;

	/**
	 * 
	 */
    createItemWindow(): void;

	/**
	 * 
	 */
    itemWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    statusWidth(): number;

	/**
	 * 
	 * @return  
	 */
    needsPageButtons(): boolean;

	/**
	 * 
	 * @return  
	 */
    arePageButtonsEnabled(): boolean;

	/**
	 * 
	 */
    refreshActor(): void;

	/**
	 * 
	 */
    commandEquip(): void;

	/**
	 * 
	 */
    commandOptimize(): void;

	/**
	 * 
	 */
    commandClear(): void;

	/**
	 * 
	 */
    onSlotOk(): void;

	/**
	 * 
	 */
    onSlotCancel(): void;

	/**
	 * 
	 */
    onItemOk(): void;

	/**
	 * 
	 */
    executeEquipChange(): void;

	/**
	 * 
	 */
    onItemCancel(): void;

	/**
	 * 
	 */
    onActorChange(): void;

	/**
	 * 
	 */
    hideItemWindow(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Status
 * 
 * The scene class of the status screen.
 */
declare class Scene_Status {

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
    create(): void;

	/**
	 * 
	 * @return  
	 */
    helpAreaHeight(): number;

	/**
	 * 
	 */
    createProfileWindow(): void;

	/**
	 * 
	 */
    profileWindowRect(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    createStatusParamsWindow(): void;

	/**
	 * 
	 */
    statusParamsWindowRect(): void;

	/**
	 * 
	 */
    createStatusEquipWindow(): void;

	/**
	 * 
	 */
    statusEquipWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    statusParamsWidth(): number;

	/**
	 * 
	 */
    statusParamsHeight(): void;

	/**
	 * 
	 */
    profileHeight(): void;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 * @return  
	 */
    needsPageButtons(): boolean;

	/**
	 * 
	 */
    refreshActor(): void;

	/**
	 * 
	 */
    onActorChange(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Options
 * 
 * The scene class of the options screen.
 */
declare class Scene_Options {

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
    create(): void;

	/**
	 * 
	 */
    terminate(): void;

	/**
	 * 
	 */
    createOptionsWindow(): void;

	/**
	 * 
	 */
    optionsWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    maxCommands(): number;

	/**
	 * 
	 * @return  
	 */
    maxVisibleCommands(): number;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_File
 * 
 * The superclass of Scene_Save and Scene_Load.
 */
declare class Scene_File {

	/**
	 * 
	 * @return  
	 */
    new(): Scene_File;
}


/**
 * -----------------------------------------------------------------------------
 * Scene_Save
 * 
 * The scene class of the save screen.
 */
declare class Scene_Save {

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
    mode(): string;

	/**
	 * 
	 */
    helpWindowText(): void;

	/**
	 * 
	 * @return  
	 */
    firstSavefileId(): number;

	/**
	 * 
	 */
    onSavefileOk(): void;

	/**
	 * 
	 * @param savefileId 
	 */
    executeSave(savefileId: any): void;

	/**
	 * 
	 */
    onSaveSuccess(): void;

	/**
	 * 
	 */
    onSaveFailure(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Load
 * 
 * The scene class of the load screen.
 */
declare class Scene_Load {

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
    terminate(): void;

	/**
	 * 
	 * @return  
	 */
    mode(): string;

	/**
	 * 
	 */
    helpWindowText(): void;

	/**
	 * 
	 * @return  
	 */
    firstSavefileId(): number;

	/**
	 * 
	 */
    onSavefileOk(): void;

	/**
	 * 
	 * @param savefileId 
	 */
    executeLoad(savefileId: any): void;

	/**
	 * 
	 */
    onLoadSuccess(): void;

	/**
	 * 
	 */
    onLoadFailure(): void;

	/**
	 * 
	 */
    reloadMapIfUpdated(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_GameEnd
 * 
 * The scene class of the game end screen.
 */
declare class Scene_GameEnd {

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
    create(): void;

	/**
	 * 
	 */
    stop(): void;

	/**
	 * 
	 */
    createBackground(): void;

	/**
	 * 
	 */
    createCommandWindow(): void;

	/**
	 * 
	 */
    commandWindowRect(): void;

	/**
	 * 
	 */
    commandToTitle(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Shop
 * 
 * The scene class of the shop screen.
 */
declare class Scene_Shop {

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
	 * @param goods 
	 * @param purchaseOnly 
	 */
    prepare(goods: any, purchaseOnly: any): void;

	/**
	 * 
	 */
    create(): void;

	/**
	 * 
	 */
    createGoldWindow(): void;

	/**
	 * 
	 */
    goldWindowRect(): void;

	/**
	 * 
	 */
    createCommandWindow(): void;

	/**
	 * 
	 */
    commandWindowRect(): void;

	/**
	 * 
	 */
    createDummyWindow(): void;

	/**
	 * 
	 */
    dummyWindowRect(): void;

	/**
	 * 
	 */
    createNumberWindow(): void;

	/**
	 * 
	 */
    numberWindowRect(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    createBuyWindow(): void;

	/**
	 * 
	 */
    buyWindowRect(): void;

	/**
	 * 
	 */
    createCategoryWindow(): void;

	/**
	 * 
	 */
    categoryWindowRect(): void;

	/**
	 * 
	 */
    createSellWindow(): void;

	/**
	 * 
	 */
    sellWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    statusWidth(): number;

	/**
	 * 
	 */
    activateBuyWindow(): void;

	/**
	 * 
	 */
    activateSellWindow(): void;

	/**
	 * 
	 */
    commandBuy(): void;

	/**
	 * 
	 */
    commandSell(): void;

	/**
	 * 
	 */
    onBuyOk(): void;

	/**
	 * 
	 */
    onBuyCancel(): void;

	/**
	 * 
	 */
    onCategoryOk(): void;

	/**
	 * 
	 */
    onCategoryCancel(): void;

	/**
	 * 
	 */
    onSellOk(): void;

	/**
	 * 
	 */
    onSellCancel(): void;

	/**
	 * 
	 */
    onNumberOk(): void;

	/**
	 * 
	 */
    onNumberCancel(): void;

	/**
	 * 
	 * @param number 
	 */
    doBuy(number: number): void;

	/**
	 * 
	 * @param number 
	 */
    doSell(number: number): void;

	/**
	 * 
	 */
    endNumberInput(): void;

	/**
	 * 
	 * @return  
	 */
    maxBuy(): number;

	/**
	 * 
	 * @return  
	 */
    maxSell(): number;

	/**
	 * 
	 * @return  
	 */
    money(): number;

	/**
	 * 
	 */
    currencyUnit(): void;

	/**
	 * 
	 */
    buyingPrice(): void;

	/**
	 * 
	 * @return  
	 */
    sellingPrice(): number;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Name
 * 
 * The scene class of the name input screen.
 */
declare class Scene_Name {

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
	 * @param maxLength 
	 */
    prepare(actorId: any, maxLength: any): void;

	/**
	 * 
	 */
    create(): void;

	/**
	 * 
	 */
    start(): void;

	/**
	 * 
	 */
    createEditWindow(): void;

	/**
	 * 
	 */
    editWindowRect(): void;

	/**
	 * 
	 */
    createInputWindow(): void;

	/**
	 * 
	 */
    inputWindowRect(): void;

	/**
	 * 
	 */
    onInputOk(): void;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Debug
 * 
 * The scene class of the debug screen.
 */
declare class Scene_Debug {

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
    create(): void;

	/**
	 * 
	 * @return  
	 */
    needsCancelButton(): boolean;

	/**
	 * 
	 */
    createRangeWindow(): void;

	/**
	 * 
	 */
    rangeWindowRect(): void;

	/**
	 * 
	 */
    createEditWindow(): void;

	/**
	 * 
	 */
    editWindowRect(): void;

	/**
	 * 
	 */
    createDebugHelpWindow(): void;

	/**
	 * 
	 */
    debugHelpWindowRect(): void;

	/**
	 * 
	 */
    onRangeOk(): void;

	/**
	 * 
	 */
    onEditCancel(): void;

	/**
	 * 
	 */
    refreshHelpWindow(): void;

	/**
	 * 
	 * @return  
	 */
    helpText(): string;
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Battle
 * 
 * The scene class of the battle screen.
 */
declare class Scene_Battle {

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
    create(): void;

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
    updateVisibility(): void;

	/**
	 * 
	 */
    updateBattleProcess(): void;

	/**
	 * 
	 * @return  
	 */
    isTimeActive(): boolean;

	/**
	 * 
	 * @return  
	 */
    isAnyInputWindowActive(): /* !this._partyCommandWindow.active */ any;

	/**
	 * 
	 */
    changeInputWindow(): void;

	/**
	 * 
	 */
    stop(): void;

	/**
	 * 
	 */
    terminate(): void;

	/**
	 * 
	 * @return  
	 */
    shouldAutosave(): /* Scene_Battle.prototype.+Scene_Battle */ any;

	/**
	 * 
	 * @return  
	 */
    needsSlowFadeOut(): any;

	/**
	 * 
	 */
    updateLogWindowVisibility(): void;

	/**
	 * 
	 */
    updateStatusWindowVisibility(): void;

	/**
	 * 
	 * @return  
	 */
    shouldOpenStatusWindow(): boolean;

	/**
	 * 
	 */
    updateStatusWindowPosition(): void;

	/**
	 * 
	 * @return  
	 */
    statusWindowX(): number;

	/**
	 * 
	 */
    updateInputWindowVisibility(): void;

	/**
	 * 
	 * @return  
	 */
    needsInputWindowChange(): boolean;

	/**
	 * 
	 */
    updateCancelButton(): void;

	/**
	 * 
	 */
    createDisplayObjects(): void;

	/**
	 * 
	 */
    createSpriteset(): void;

	/**
	 * 
	 */
    createAllWindows(): void;

	/**
	 * 
	 */
    createLogWindow(): void;

	/**
	 * 
	 */
    logWindowRect(): void;

	/**
	 * 
	 */
    createStatusWindow(): void;

	/**
	 * 
	 */
    statusWindowRect(): void;

	/**
	 * 
	 */
    createPartyCommandWindow(): void;

	/**
	 * 
	 */
    partyCommandWindowRect(): void;

	/**
	 * 
	 */
    createActorCommandWindow(): void;

	/**
	 * 
	 */
    actorCommandWindowRect(): void;

	/**
	 * 
	 */
    createHelpWindow(): void;

	/**
	 * 
	 */
    helpWindowRect(): void;

	/**
	 * 
	 */
    createSkillWindow(): void;

	/**
	 * 
	 */
    skillWindowRect(): void;

	/**
	 * 
	 */
    createItemWindow(): void;

	/**
	 * 
	 */
    itemWindowRect(): void;

	/**
	 * 
	 */
    createActorWindow(): void;

	/**
	 * 
	 */
    actorWindowRect(): void;

	/**
	 * 
	 */
    createEnemyWindow(): void;

	/**
	 * 
	 */
    enemyWindowRect(): void;

	/**
	 * 
	 * @return  
	 */
    helpAreaTop(): number;

	/**
	 * 
	 */
    helpAreaBottom(): void;

	/**
	 * 
	 */
    helpAreaHeight(): void;

	/**
	 * 
	 */
    buttonAreaTop(): void;

	/**
	 * 
	 */
    windowAreaHeight(): void;

	/**
	 * 
	 */
    createButtons(): void;

	/**
	 * 
	 */
    createCancelButton(): void;

	/**
	 * 
	 */
    closeCommandWindows(): void;

	/**
	 * 
	 */
    hideSubInputWindows(): void;

	/**
	 * 
	 */
    startPartyCommandSelection(): void;

	/**
	 * 
	 */
    commandFight(): void;

	/**
	 * 
	 */
    commandEscape(): void;

	/**
	 * 
	 */
    startActorCommandSelection(): void;

	/**
	 * 
	 */
    commandAttack(): void;

	/**
	 * 
	 */
    commandSkill(): void;

	/**
	 * 
	 */
    commandGuard(): void;

	/**
	 * 
	 */
    commandItem(): void;

	/**
	 * 
	 */
    commandCancel(): void;

	/**
	 * 
	 */
    selectNextCommand(): void;

	/**
	 * 
	 */
    selectPreviousCommand(): void;

	/**
	 * 
	 */
    startActorSelection(): void;

	/**
	 * 
	 */
    onActorOk(): void;

	/**
	 * 
	 */
    onActorCancel(): void;

	/**
	 * 
	 */
    startEnemySelection(): void;

	/**
	 * 
	 */
    onEnemyOk(): void;

	/**
	 * 
	 */
    onEnemyCancel(): void;

	/**
	 * 
	 */
    onSkillOk(): void;

	/**
	 * 
	 */
    onSkillCancel(): void;

	/**
	 * 
	 */
    onItemOk(): void;

	/**
	 * 
	 */
    onItemCancel(): void;

	/**
	 * 
	 */
    onSelectAction(): void;

	/**
	 * 
	 */
    endCommandSelection(): void;

	/**
	 * 
	 */
    _statusWindow: /*no type*/{};

	/**
	 * 
	 */
    _partyCommandWindow: /*no type*/{};

	/**
	 * 
	 */
    _actorCommandWindow: /*no type*/{};

	/**
	 * 
	 */
    _helpWindow: /*no type*/{};

	/**
	 * 
	 */
    _skillWindow: /*no type*/{};

	/**
	 * 
	 */
    _itemWindow: /*no type*/{};

	/**
	 * 
	 */
    _actorWindow: /*no type*/{};

	/**
	 * 
	 */
    _enemyWindow: /*no type*/{};
}

/**
 * -----------------------------------------------------------------------------
 * Scene_Gameover
 * 
 * The scene class of the game over screen.
 */
declare class Scene_Gameover {

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
    create(): void;

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
    stop(): void;

	/**
	 * 
	 */
    terminate(): void;

	/**
	 * 
	 */
    playGameoverMusic(): void;

	/**
	 * 
	 */
    createBackground(): void;

	/**
	 * 
	 */
    adjustBackground(): void;

	/**
	 * 
	 * @return  
	 */
    isTriggered(): boolean;

	/**
	 * 
	 */
    gotoTitle(): void;
}
