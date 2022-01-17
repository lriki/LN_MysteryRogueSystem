db.items = {

    "kアイアンシールド": {
        // params: {
        //     "grade": "0",   // 初期値。"2-5" とかにすると、その範囲をランダムに設定
        // }
    },

    "kワープリング": {
        equipmentTraits: [
            { code: "SuddenSkillEffect", data: "kSkill_Warp", value: 1.0 / 16.0 }
        ]
    },
    
    "kItem_キュアリーフ_A": {
        emittors: [
            { code: "SuddenSkillEffect", data: "kSkill_Warp", value: 1.0 / 16.0 }
        ]
    }
}