//==============================================================================
// TerrainSetting 設定ファイル
//------------------------------------------------------------------------------
// マップの形状や出現する構造物を決めるためのファイルです。
// 
// TerrainSetting_設定ひとつ分の記述例は次のようになります。
// ``````````````````````````````````````````````````
// "【TerrainSettingのKey】": {
//     shapes: {
//         "【TerrainShapeのKey】": 【レーティング】,
//         "【TerrainShapeのKey】": 【レーティング】,
//     },
//     structures: {
//         "【構造物の名前】": 【出現率】,
//     }
// },
// ``````````````````````````````````````````````````
// 【TerrainSettingのKey】
//      TerrainSetting を識別するための Key です。
//      FloorPresets.js で使います。
// 【TerrainShapeのKey】
//      この TerrainSetting はどのような地形を生成できるのかを指定します。
//      【レーティング】は、Shape の採用順位です。
//      [敵キャラ] の行動パターンのレーティングと同様の仕様で、いずれかから1つ選択されます。
// 【構造物の名前】
//      マップのいずれかの部屋に出現しえる構造物を指定します。
//      (現在は MonsterHouse のみ使用可能。将来的に、店や柱部屋、堀部屋などを検討中)
//==============================================================================
db.terrainSettings = {
    // デフォルト。一般的な 3x3 部屋のフロア形状に、1/16 の確率でモンスターハウスが出現する。
    "kTerrainSetting_Default": {
        shapes: {
            "kTerrainShape_Default": 1,
        },
        structures: {
            "MonsterHouse": 1/16,   // モンスターハウス出現率 1/16
        }
    },
    // アルファベット。shapes の中のいずれかひとつが選択される。
    "kTerrainSetting_Alphabet": {
        shapes: {
            "kTerrainShape_C": 1,
            "kTerrainShape_H": 1,
        },
        structures: {
            "MonsterHouse": 1/16,   // モンスターハウス出現率 1/16
        }
    },
    // 一般的な 3x3 部屋のフロア形状でだた、通路生成の複雑度を低くした地形生成モード。
    "kTerrainSetting_SimpleDefault": {
        shapes: {
            "kTerrainShape_SimpleDefault": 1,
        }
    },
    // 2x2 部屋のフロア形状。序盤用の簡単なフロア。
    "kTerrainSetting_Small2x2": {
        shapes: {
            "kTerrainShape_Small2x2": 1,
        }
    },
    // 大部屋。
    "kTerrainSetting_GreatHall": {
        shapes: {
            "kTerrainShape_GreatHall": 1,
        }
    },
    // 中部屋。
    "kTerrainSetting_HalfHall": {
        shapes: {
            "kTerrainShape_HalfHall": 1,
        }
    },
    // 確定モンスターハウス大部屋。
    "kTerrainSetting_GreatHallMH": {
        shapes: {
            "kTerrainShape_GreatHall": 1,
        },
        structures: {
            "MonsterHouse": 1.0,    // 100%
        }
    },
    // テスト用。モンスターハウスが必ず出現する。
    "kTerrainSetting_Test_DefaultMH": {
        shapes: {
            "kTerrainShape_Default": 1,
        },
        structures: {
            "MonsterHouse": 1.0,    // 100%
        }
    },
}