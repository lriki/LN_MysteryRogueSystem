//==============================================================================
// FloorPreset 設定ファイル
//------------------------------------------------------------------------------
// フロアの形状や出現する構造物を決めるためのファイルです。
// 簡易的なデータはイベント実行内容の注釈 @MR-Floor にて設定できますが、
// これらのデータは複雑であるため、注釈ではなく別ファイルに分けています。
// 
// FloorPreset 設定ひとつ分の書き方は次のようになります。
// ``````````````````````````````````````````````````
// "【FloorPresetのKey】": {
//     terrains: {
//         "【TerrainSettingのKey】": 【レーティング】,
//         "【TerrainSettingのKey】": 【レーティング】,
//     },
//     monsterHouses: {
//         "【モンスターハウス種類の名前】": 【レーティング】,
//     }
//     shops: {
//         "【店種類の名前】": 【レーティング】,
//     }
// },
// ``````````````````````````````````````````````````
// 【FloorPresetのKey】
//      イベント注釈の @MR-Floor の preset に指定する Key です。
// 【TerrainSettingのKey】
//      TerrainSettings.js で定義される、TerrainSetting の Key です。
//      レーティングは、このフロアの地形及び構造物を生成するときに使用する TerrainSetting の採用順位です。
//      [敵キャラ] の行動パターンのレーティングと同様の仕様です。
// 【モンスターハウス種類の名前】
//      地形及び構造物の生成処理の結果、モンスターハウスが生成されることとなった場合、
//      どのような種類のモンスターハウスを選択するかを指定します。
//      (現在は Default のみ使用可能。将来的に、特殊モンスターハウスの生成に使用する)
// 【店種類の名前】
//      地形及び構造物の生成処理の結果、店が生成されることとなった場合、
//      どのような種類の店を選択するかを指定します。
//      (現在は未対応。将来的に、武器屋、巻物屋など特殊店の生成に使用する)
//
//==============================================================================
db.floorPresets = {
    // デフォルト。Preset 指定の無いフロアに自動的に適用される。
    "kFloorPreset_Default": {
        terrains: {
            "kTerrainSetting_Default": 1,
        }
    },
    // 難易度 Level1: 2x2フロアのみ。
    "kFloorPreset_Level1": {
        terrains: {
            "kTerrainSetting_Small2x2": 1,
        }
    },
    // 難易度 Level2: SimpleDefault とアルファベット
    "kFloorPreset_Level2": {
        terrains: {
            "kTerrainSetting_SimpleDefault": 1,
            "kTerrainSetting_Alphabet": 1,
        }
    },
    // 難易度 Level3 の 1F 用。ダンジョン突入直後はシンプルな形状のみとすることで、理不尽さを減らす。
    "kFloorPreset_Level3_First": {
        terrains: {
            "kTerrainSetting_SimpleDefault": 1,
        }
    },
    // 難易度 Level3 の 2F 以降用。
    "kFloorPreset_Level3": {
        terrains: {
            "kTerrainSetting_Default": 1,
            "kTerrainSetting_Alphabet": 1,
        }
    },
    // 難易度 Level4 の 1F 用。ダンジョン突入直後はシンプルな形状のみとすることで、理不尽さを減らす。
    "kFloorPreset_Level4_First": {
        terrains: {
            "kTerrainSetting_SimpleDefault": 1,
        }
    },
    // 難易度 Level4 の 2F 以降用。
    "kFloorPreset_Level4": {
        terrains: {
            "kTerrainSetting_Default": 2,
            "kTerrainSetting_Alphabet": 2,  // アルファベット型
            "kTerrainSetting_GreatHall": 1, // 大部屋
            "kTerrainSetting_HalfHall": 1,  // 中部屋
        },
        monsterHouses: {
            "Default": 1,
        }
    },
    // 難易度 Level5 の 1F 用。ダンジョン突入直後はシンプルな形状のみとすることで、理不尽さを減らす。
    "kFloorPreset_Level5_First": {
        terrains: {
            "kTerrainSetting_SimpleDefault": 1,
        }
    },
    // 難易度 Level5 の 2F 以降用。
    "kFloorPreset_Level5": {
        terrains: {
            "kTerrainSetting_Default": 2,
            "kTerrainSetting_Alphabet": 2,  // アルファベット型
            "kTerrainSetting_GreatHall": 1, // 大部屋
            "kTerrainSetting_HalfHall": 1,  // 中部屋
        },
        monsterHouses: {
            "Default": 1,
        }
    },
    // テスト用。モンスターハウス有り。
    "kFloorPreset_Test_DefaultMH": {
        terrains: {
            "kTerrainSetting_Test_DefaultMH": 1,
        },
        monsterHouses: {
            "Default": 1,
        }
    },
    // テスト用。大部屋のみが発生するフロア。
    "kFloorPreset_GreatHall": {
        terrains: {
            "kTerrainSetting_GreatHall": 1,
        }
    },
    // テスト用。大部屋モンスターハウスのみが発生するフロア。
    "kFloorPreset_GreatHallMH": {
        terrains: {
            "kTerrainSetting_GreatHallMH": 1,
        },
        monsterHouses: {
            "Default": 1,
        }
    },
}