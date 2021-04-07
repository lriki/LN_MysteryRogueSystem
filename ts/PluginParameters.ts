
var pluginName = 'LN_RoguelikeEngine';

// 固定マップで部屋をマークするためのリージョンID
export var paramFixedMapRoomRegionId = 1;

// 固定マップで部屋及びモンスターハウスをマークするためのリージョンID
export var paramFixedMapMonsterHouseRoomRegionId = 2;

// 固定マップで通路をマークするためのリージョンID
export var paramFixedMapPassagewayRegionId = 8;

// ランダムマップの最大幅 (12の倍数)
export var paramRandomMapDefaultWidth = 60;

// ランダムマップの最大高さ (12の倍数)
export var paramRandomMapDefaultHeight = 48;

// エネミーのランダム出現時、自分の周囲に生成しないようにする範囲
export var paramEnemySpawnInvalidArea  = 12;

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



