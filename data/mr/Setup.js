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

MR.db.entities3 = {

    // "kEntity_ドラゴンキラーA": {
    //     setup: (entity) => {
    //         entity.equipmentTraits.push({code: MRBasics.traits.RaceRate, dataId: MRData.getRace("kRace_ドラゴン系").id, value: 1.5});
    //     }
    // },
    "kEntity_目覚めの指輪A": {
        setup: (entity) => {
            entity.equipmentTraits.push({code: MRBasics.traits.AwakeStep, dataId: 0, value: 0});
        }
    },
    "kEntity_忍び足の指輪A": {
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

//     // "kEntity_ドラゴンキラーA": {
//     //     equipmentTraits: [
//     //         { code: "RaceRate", data: "kRace_ドラゴン系", value: 1.5 }
//     //     ]
//     // },
//     // "kEntity_目覚めの指輪A": {
//     //     equipmentTraits: [
//     //         { code: "AwakeStep" }
//     //     ]
//     // },
//     // "kEntity_忍び足の指輪A": {
//     //     equipmentTraits: [
//     //         { code: "SilentStep" }
//     //     ]
//     // },

// }


//------------------------------------------------------------------------------
// 移行メモ
/*
草アイテム
---------
- [共通] 飲んだ時に FP を回復する。
- [共通] 投げ当てた時に、飲んだ時と同様の効果を与える
- [一部例外ありの共通] 飲んだ時と投げ当てた時で効果が変わる (火炎草・ドラゴン草)

まず、エディタで効果を指定しただけでは、アイテムを使うことはできない。
SetupScript で、 Reacton と関連付ける必要がある。
[食べる] と [投げる] では、効果が同じでも、FPの回復有無が違うので、異なる Emittor が必要になる。

```
"kEntity_薬草A": Entity({
    reactions: [
        Reaction({
            action: "kAction_食べる",
            emittor: "kEmittor_薬草A_食べる",
        }),
        Reaction({
            action: "kAction_投げ当て",
            emittor: "kEmittor_薬草A",
        }),
    ]
})
```

```
emittors = {
    "kEmittor_薬草A": Emittor({
    }),
    "kEmittor_薬草A_食べる": Emittor({
        base: "kEmittor_薬草A",
        effects: [
            "kEffect_満腹度微回復",
            "kEffect_薬草A",
        }),
    }),
}
```

*/


