import { DEntityCategoryId } from "../DCommon";


export interface BasicEntityKinds {
    actor: DEntityCategoryId;
    
    //static OtherKindId: DEntityKindId;             // その他・未分類
    WeaponKindId: DEntityCategoryId;            // 武器
    ShieldKindId: DEntityCategoryId;            // 盾
    armor: DEntityCategoryId;                   // 鎧
    ArrowKindId: DEntityCategoryId;             // 矢
    BraceletKindId: DEntityCategoryId;          // 腕輪
    FoodKindId: DEntityCategoryId;              // 食料
    grass: DEntityCategoryId;              // 草
    ScrollKindId: DEntityCategoryId;            // 巻物
    WandKindId: DEntityCategoryId;              // 杖
    PotKindId: DEntityCategoryId;               // 壺
    DiscountTicketKindId: DEntityCategoryId;    // 割引券
    BuildingMaterialKindId: DEntityCategoryId;  // 建材
    TrapKindId: DEntityCategoryId;              // 罠
    FigurineKindId: DEntityCategoryId;          // 土偶
    MonsterKindId: DEntityCategoryId;           // モンスター
    entryPoint: DEntityCategoryId;               //
    exitPoint: DEntityCategoryId;               // 出口
    Ornament: DEntityCategoryId;
}
