import { DEntityKindId } from "../DEntityKind";


export interface BasicEntityKinds {
    actor: DEntityKindId;
    
    //static OtherKindId: DEntityKindId;             // その他・未分類
    WeaponKindId: DEntityKindId;            // 武器
    ShieldKindId: DEntityKindId;            // 盾
    ArrowKindId: DEntityKindId;             // 矢
    BraceletKindId: DEntityKindId;          // 腕輪
    FoodKindId: DEntityKindId;              // 食料
    HerbKindId: DEntityKindId;              // 草
    ScrollKindId: DEntityKindId;            // 巻物
    WandKindId: DEntityKindId;              // 杖
    PotKindId: DEntityKindId;               // 壺
    DiscountTicketKindId: DEntityKindId;    // 割引券
    BuildingMaterialKindId: DEntityKindId;  // 建材
    TrapKindId: DEntityKindId;              // 罠
    FigurineKindId: DEntityKindId;          // 土偶
    MonsterKindId: DEntityKindId;           // モンスター
    exitPoint: DEntityKindId;               // 出口
}
