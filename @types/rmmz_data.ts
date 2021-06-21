// Portig from: https://github.com/Narazaka/rpgmakermv_typescript_dts

declare interface IDataSound
{
    name: string;
    pan: number;
    pitch: number;
    volume: number;
}

declare interface IDataTrait
{
    code: number;
    dataId: number;
    value: number;
}

declare interface IDataActor
{
    id: number;
    battlerName: string;
    characterIndex: number;
    characterName: string;
    classId: number;
    equips: number[];
    faceIndex: number;
    faceName: string;
    traits: IDataTrait[];
    initialLevel: number;
    maxLevel: number;
    name: string;
    nickname: string;
    note: string;
    profile: string;
    meta: any;
}

declare interface IDataClass
{
    id?: number;
    expParams?: number[];
    traits?: IDataTrait[];
    learnings?: {
        level?: number;
        note?: string;
        skillId?: number;
    }[];
    name?: string;
    note?: string;
    params?: number[][];
    meta?: any;
}

declare interface IDataEffect
{
    code: number;
    dataId: number;
    value1: number;
    value2: number;
}
declare interface IDataDamage
{
    critical: boolean;
    elementId: number;
    formula: string;
    type: number;
    variance: number;
}

declare interface IDataSkill
{
    id: number;
    animationId: number;
    damage: IDataDamage;
    description: string;
    effects: IDataEffect[];
    hitType: number;
    iconIndex: number;
    message1: string;
    message2: string;
    mpCost: number;
    name: string;
    note: string;
    occasion: number;
    repeats: number;
    requiredWtypeId1: number;
    requiredWtypeId2: number;
    scope: number;
    speed: number;
    stypeId: number;
    successRate: number;
    tpCost: number;
    tpGain: number;
    messageType: number;
    meta: any;
}

declare interface IDataAllItem
{
    id: number;
    description?: string;
    name: string;
    note: string;
    iconIndex: number;
    price: number;
    meta: any;
}

declare interface IDataItem extends IDataAllItem
{
    animationId: number;
    consumable: boolean;
    damage: IDataDamage;
    effects: IDataEffect[];
    hitType: number;
    itypeId: number;
    occasion: number;
    repeats: number;
    scope: number;
    speed: number;
    successRate: number;
    tpGain: number;
}

declare interface IDataEquipItem extends IDataAllItem
{
    etypeId?: number;
    traits?: IDataTrait[];
    params?: number[];
}

declare interface IDataWeapon extends IDataEquipItem
{
    animationId?: number;
    wtypeId?: number;
}

declare interface IDataArmor extends IDataEquipItem
{
    atypeId?: number;
}

declare interface IDataAction
{
    conditionParam1?: number;
    conditionParam2?: number;
    conditionType?: number;
    rating: number;
    skillId: number;
}

declare interface IDataDropItem
{
    kind?: number;
    dataId?: number;
    denominator?: number;
}

declare interface IDataEnemy
{
    id: number;
    actions: IDataAction[];
    battlerHue: number;
    battlerName: string;
    dropItems: IDataDropItem[];
    exp: number;
    traits: IDataTrait[];
    gold: number;
    name: string;
    note: string;
    params: number[];
    meta: any;
}

declare interface IDataPage
{
    conditions?: {
        actorHP?: number;
        actorId?: number;
        actorValid?: boolean;
        enemyHp?: number;
        enemyIndex?: number;
        enemyValid?: boolean;
        switchId?: number;
        switchValid?: boolean;
        turnA?: number;
        turnB?: number;
        turnEnding?: boolean;
        turnValid?: boolean;
    };
    list?: {
        code?: number;
        indent?: number;
        parameters?: number[];
    }[];
    span?: number;
}

declare interface IDataTroop
{
    id?: number;
    members?: {
        enemyId?: number;
        x?: number;
        y?: number;
        hidden?: boolean;
    }[];
    name?: string;
    pages?: IDataPage[];
    meta?: any;
}

declare interface IDataState
{
    id: number;
    autoRemovalTiming: number;
    chanceByDamage: number;
    iconIndex: number;
    maxTurns: number;
    message1: string;
    message2: string;
    message3: string;
    message4: string;
    minTurns: number;
    motion: number;
    name: string;
    note: string;
    overlay: number;
    priority: number;
    releaseByDamage: boolean;
    removeAtBattleEnd: boolean;
    removeByDamage: boolean;
    removeByRestriction: boolean;
    removeByWalking: boolean;
    restriction: number;
    stepsToRemove: number;
    traits: IDataTrait[];
    meta?: any;
}

declare interface IDataTileset
{
    id: number;
    flags: number[];
    mode: number;
    name: string;
    note: string;
    tilesetNames: string[];
    meta: any;
}

declare interface IDataList
{
    code?: number;
    indent?: number;
    parameters?: number[];
}

declare interface IDataCommonEvent
{
    id?: number;
    list?: IDataList[];
    name: string;
    switchId: number;
    trigger: number;
    meta?: any;
}

declare interface IDataAdvanced
{
    gameId: number;
    screenWidth: number;
    screenHeight: number;
    uiAreaWidth: number;
    uiAreaHeight: number;
    numberFontFilename: string;
    fallbackFonts: string;
    fontSize: number;
    mainFontFilename: string;
}

declare interface IVehicle
{
    bgm?: IDataSound;
    characterIndex?: number;
    characterName?: string;
    startMapId?: number;
    startX?: number;
    startY?: number;
}

declare interface IDataSystem
{
    advanced?: IDataAdvanced;
    airship?: IVehicle;
    armorTypes?: string[];
    attackMotions?: {
        type?: number;
        weaponImageId?: number;
    }[];
    battleBgm?: IDataSound;
    battleback1Name?: string;
    battleback2Name?: string;
    battlerHue?: number;
    battlerName?: string;
    battleSystem?: number;
    boat?: IVehicle;
    currencyUnit?: string;
    defeatMe?: IDataSound;
    editMapId?: number;
    elements?: string[];
    equipTypes?: string[];
    gameTitle?: string;
    gameoverMe?: IDataSound;
    itemCategories?: boolean[];
    locale?: string;
    magicSkills?: number[];
    menuCommands?: boolean[];
    optAutosave?: boolean;
    optDisplayTp?: boolean;
    optDrawTitle?: boolean;
    optExtraExp?: boolean;
    optFloorDeath?: boolean;
    optFollowers?: boolean;
    optKeyItemsNumber?: boolean;
    optSideView?: boolean;
    optSlipDeath?: boolean;
    optTransparent?: boolean;
    partyMembers?: number[];
    ship?: IVehicle;
    skillTypes?: string[];
    sounds?: IDataSound[];
    startMapId?: number;
    startX?: number;
    startY?: number;
    switches?: string[];
    terms: {
        basic: string[];
        commands: string[];
        params: string[];
        messages: {
            alwaysDash?: string;
            commandRemember?: string;
            touchUI?: string;
            bgmVolume?: string;
            bgsVolume?: string;
            meVolume?: string;
            seVolume?: string;
            possession: string;
            expTotal: string;
            expNext: string;
            saveMessage: string;
            loadMessage: string;
            file?: string;
            autosave?: string;
            partyName?: string;
            emerge?: string;
            preemptive?: string;
            surprise?: string;
            escapeStart?: string;
            escapeFailure?: string;
            victory?: string;
            defeat?: string;
            obtainExp?: string;
            obtainGold?: string;
            obtainItem?: string;
            levelUp?: string;
            obtainSkill?: string;
            useItem?: string;
            criticalToEnemy?: string;
            criticalToActor?: string;
            actorDamage?: string;
            actorRecovery?: string;
            actorGain?: string;
            actorLoss?: string;
            actorDrain?: string;
            actorNoDamage?: string;
            actorNoHit?: string;
            enemyDamage?: string;
            enemyRecovery?: string;
            enemyGain?: string;
            enemyLoss?: string;
            enemyDrain?: string;
            enemyNoDamage?: string;
            enemyNoHit?: string;
            evasion?: string;
            magicEvasion?: string;
            magicReflection?: string;
            counterAttack?: string;
            substitute?: string;
            buffAdd?: string;
            debuffAdd?: string;
            buffRemove?: string;
            actionFailure?: string;
        };
    };
    testBattlers?: {
        actorId?: number;
        equips?: number[];
        level?: number;
    }[];
    testTroopId?: number;
    title1Name?: string;
    title2Name?: string;
    titleBgm?: IDataSound;
    titleCommandWindow?: {
        background?: number;
        offsetX?: number;
        offsetY?: number;
    }[];
    variables?: string[];
    versionId?: number;
    victoryMe?: IDataSound;
    weaponTypes?: string;
    windowTone?: number[];
    meta?: any;
}

declare interface IDataMapInfo
{
    id: number;
    expanded: boolean;
    name: string;
    order: number;
    parentId: number;
    scrollX: number;
    scrollY: number;
    meta: any;
}

declare interface IDataEncounterList
{
    troopId?: number;
    weight?: number;
    regionSet?: number[];
}

declare interface IDataMapEventPage
{
    conditions?: {
        actorId?: number;
        actorValid?: boolean;
        itemId?: number;
        itemValid?: boolean;
        selfSwitchCh?: string;
        selfSwitchValid: boolean;
        switch1Id?: number;
        switch1Valid?: boolean;
        switch2Id?: number;
        switch2Valid?: boolean;
        variableId?: number;
        variableValid?: boolean;
        variableValue?: number;
    };
    directionFix?: boolean;
    image: {
        tileId: number;
        characterName: string;
        direction: number;
        pattern: number;
        characterIndex: number;
    }
    list: IDataList[];
    moveFrequency?: number;
    moveRoute?: {
        list?: {
            code?: number;
            parameters?: number[];
        }[];
        repeat?: boolean;
        skippable?: boolean;
        wait?: boolean;
    };
    moveSpeed?: number;
    moveType?: number;
    priorityType?: number;
    stepAnime?: boolean;
    through?: boolean;
    trigger?: number;
    walkAnime?: boolean;
}

declare interface IDataMapEvent
{
    id: number;
    name: string;
    note: string;
    pages: IDataMapEventPage[];
    x: number;
    y: number;
}

declare interface IDataMap
{
    autoplayBgm: boolean;
    autoplayBgs: boolean;
    battleback1Name: string;
    battleback2Name: string;
    bgm: IDataSound;
    bgs: IDataSound;
    disableDashing: boolean;
    displayName: string;
    encounterList: IDataEncounterList[];
    encounterStep: number;
    height: number;
    note: string;
    parallaxLoopX: boolean;
    parallaxLoopY: boolean;
    parallaxName: string;
    parallaxShow: boolean;
    parallaxSx: number;
    parallaxSy: number;
    scrollType: number;
    specifyBattleback: boolean;
    tilesetId: number;
    width: number;
    data: number[];
    events: (IDataMapEvent | null)[];
    meta: any;
}

declare var $dataActors      : IDataActor[];
declare var $dataClasses     : IDataClass[];
declare var $dataSkills      : IDataSkill[];
declare var $dataItems       : IDataItem[];
declare var $dataWeapons     : IDataWeapon[];
declare var $dataArmors      : IDataArmor[];
declare var $dataEnemies     : IDataEnemy[];
declare var $dataTroops      : IDataTroop[];
declare var $dataStates      : IDataState[];
//declare var $dataAnimations  : IDataAnimation[];
declare var $dataTilesets    : IDataTileset[];
declare var $dataCommonEvents: IDataCommonEvent[];
declare var $dataSystem      : IDataSystem;
declare var $dataMapInfos    : (IDataMapInfo | undefined)[];
declare var $dataMap         : IDataMap;	// Runtime load
