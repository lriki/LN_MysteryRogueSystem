//==============================================================================
// EntityTemplate 設定ファイル
//------------------------------------------------------------------------------
// 
//==============================================================================
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem/ts/main");

MR.db.entityTemplates = {
    //--------------------------------------------------------------------------
    // 武器
    //--------------------------------------------------------------------------
    "kEntityTemplate_Weapon": EntityTemplate({
        type: "Weapon",
    }),
    //--------------------------------------------------------------------------
    // 盾
    //--------------------------------------------------------------------------
    "kEntityTemplate_Shield": EntityTemplate({
        type: "Shield",
    }),
    //--------------------------------------------------------------------------
    // 防具
    //--------------------------------------------------------------------------
    "kEntityTemplate_Armor": EntityTemplate({
        type: "Armor",
    }),
    //--------------------------------------------------------------------------
    // 装飾品
    //--------------------------------------------------------------------------
    "kEntityTemplate_Accessory": EntityTemplate({
        type: "Accessory",
    }),
    //--------------------------------------------------------------------------
    // 草・薬
    //--------------------------------------------------------------------------
    "kEntityTemplate_Grass": EntityTemplate({
        type: "Grass",
        recoverFP: 500,
    }),
    //--------------------------------------------------------------------------
    // 食料
    //--------------------------------------------------------------------------
    "kEntityTemplate_Food": EntityTemplate({
        type: "Food",
    }),
    //--------------------------------------------------------------------------
    // 壺・収納箱
    //--------------------------------------------------------------------------
    "kEntityTemplate_Storage": EntityTemplate({
        type: "Storage",
    }),
};

