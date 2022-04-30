db.floorPresets = {
    // デフォルト。Preset しての無いフロアに自動的に適用される。
    "kFloorPreset_Default": {
        terrains: {
            "kTerrainSetting_Default": 1,
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
            "kTerrainSetting_C": 1,
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
            "kTerrainSetting_C": 1,
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
            "kTerrainSetting_C": 2,         // C 型
            "kTerrainSetting_GreatHall": 1, // 大部屋
            "kTerrainSetting_HalfHall": 1,  // 中部屋
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
            "kTerrainSetting_C": 2,         // C 型
            "kTerrainSetting_GreatHall": 1, // 大部屋
            "kTerrainSetting_HalfHall": 1,  // 中部屋
        }
    },
}