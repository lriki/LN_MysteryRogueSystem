/// <reference path="./MysteryRogueSystem.d.ts" />

//const { MRData } = require("rmmz-game/ts/main");

//==============================================================================
// Entity 設定ファイル
//------------------------------------------------------------------------------
// データベースで設定された各種データに対して追加の設定を行うためのファイルです。
// 
//==============================================================================
// const { mrdb } = require("./bundle");
//const { AAAA } = require("./bundle.d.ts");
// const { MRData } = require("cool-project");
// const { AAAA } = require("./bundle");


// import { MRData } from "./bundle";
// MRData.entities;
// const { MRData } = require("cool-project");
// const { main } = require("rmmz-game");
// const { Window_Location } = require("rmmz-game/ts/mr/visual/windows/Window_Location");
// MRData
/// <reference path="./MysteryRogueSystem.d.ts" />
const MR = require("MysteryRogueSystem/ts/main");

MR.db.entities = {

    "kEntity_ドラゴンキラー_A": {
        setup: (entity) => {
            entity.equipmentTraits.push({code: MRBasics.traits.RaceRate, dataId: MRData.getRace("kRace_ドラゴン系").id, value: 1.5});
        }
    },
    "kEntity_目覚めの指輪_A": {
        setup: (entity) => {
            entity.equipmentTraits.push({code: MRBasics.traits.AwakeStep, dataId: 0, value: 0});
        }
    },
    "kEntity_忍び足の指輪_A": {
        setup: (entity) => {
            entity.equipmentTraits.push({code: MRBasics.traits.SilentStep, dataId: 0, value: 0});
        }
    },
};

//==============================================================================
// 
//==============================================================================
const { DEntity } = require("../../ts/mr/data/DEntity");
const { MRBasics } = require("../../ts/mr/data/MRBasics");
const { MRData } = require("../../ts/mr/data/MRData");


// db.entities = {

//     // "kEntity_ドラゴンキラー_A": {
//     //     equipmentTraits: [
//     //         { code: "RaceRate", data: "kRace_ドラゴン系", value: 1.5 }
//     //     ]
//     // },
//     // "kEntity_目覚めの指輪_A": {
//     //     equipmentTraits: [
//     //         { code: "AwakeStep" }
//     //     ]
//     // },
//     // "kEntity_忍び足の指輪_A": {
//     //     equipmentTraits: [
//     //         { code: "SilentStep" }
//     //     ]
//     // },

// }