
var pluginName = 'LN_MysteryRogueSystem';

function getNumber(key: string, defaultValue: number): number {
    if (typeof PluginManager == "undefined") return defaultValue;
    const v = PluginManager.parameters(pluginName)[key];
    if (v === undefined) return defaultValue;
    return Number(v);
    
}

function getBoolean(key: string, defaultValue: boolean): boolean {
    if (typeof PluginManager == "undefined") return defaultValue;
    const v = PluginManager.parameters(pluginName)[key];
    if (v === undefined) return defaultValue;
    return v.toLowerCase() === 'true';
}

// 固定マップで部屋をマークするためのリージョンID
export var paramFixedMapRoomRegionId = 1;

// 固定マップで部屋及びモンスターハウスをマークするためのリージョンID
export var paramFixedMapMonsterHouseRoomRegionId = 2;

// 固定マップで部屋及び店をマークするためのリージョンID
export var paramFixedMapItemShopRoomRegionId = 3;

// 固定マップで通路をマークするためのリージョンID
export var paramFixedMapPassagewayRegionId = 8;

// ランダムマップの最大幅 (12の倍数)
export var paramRandomMapDefaultWidth = 60;

// ランダムマップの最大高さ (12の倍数)
export var paramRandomMapDefaultHeight = 48;

// エネミーのランダム出現時、自分の周囲に生成しないようにする範囲
export var paramEnemySpawnInvalidArea  = 12;

export var paramPowerToAtk = true;

// 見えない罠を踏んだ時の発動率 (%)
export var paramHiddenTrapTriggerRate = 80;

// 見えている罠を踏んだ時の発動率 (%)
export var paramExposedTrapTriggerRate = 50;

// 物理間接攻撃の基本命中率 (%)
export var paraIndirectPhysicalHitRate = 85;

// 1ターンの満腹度減少量
export var paramFPLoss = getNumber("BasicFPLoss", 10);

export var paramMaxUnitsInMap = 50;
export var paramMaxItemsInMap = 100;
export var paramMaxTrapsInMap = 100;

export var paramMonsterHouseEnemiesMax = 20;
export var paramMonsterHouseEnemiesMin = 5;
export var paramMonsterHouseItemsMax = 20;  // アイテムまたはトラップ。同じマスに置けないし、ワナ師ダンジョンでは両方アイテムと考えるのが妥当だろう。
export var paramMonsterHouseItemsMin = 5;

// 視界不明瞭部屋での視界 (半径)
export var paramDefaultVisibiltyLength = 6;

export var paramRandomMapPaddingX = getNumber("RandomMapPaddingX", 8);
export var paramRandomMapPaddingY = getNumber("RandomMapPaddingY", 6);

// 投げた時の飛距離
export var paramThrowingDistance = 10;

export var paramSuspendMenuEnabled = getBoolean("SuspendMenuEnabled", false);


//Maximum number of items in the map

/*
// 
export var paramMapSkillEffectsMapId = Number(PluginManager.parameters(pluginName)['MapSkillEffectsMapId']);

// ガイドラインの地形タグ
export var paramGuideLineTerrainTag = Number(PluginManager.parameters(pluginName)['GuideLineTerrainTag']);

// オブジェクトの落下速度
export var paramFallingSpeed = 5;

export var paramAllowAllMapPuzzles: boolean = true;

var localAllowAllMapPuzzles = PluginManager.parameters(pluginName)['AllowAllMapPuzzles'];
if (localAllowAllMapPuzzles != undefined) {
    paramAllowAllMapPuzzles = (localAllowAllMapPuzzles.toLowerCase() === 'true');
}

// 滑る床リージョン ID
export var paramSlipperyTileRegionId = Number(PluginManager.parameters(pluginName)['SlipperyTileRegionId']);
// = 1;

// 滑り中のアニメーションパターン
export var paramSlippingAnimationPattern = Number(PluginManager.parameters(pluginName)['SlippingAnimationPattern']);
// = 2;
*/



