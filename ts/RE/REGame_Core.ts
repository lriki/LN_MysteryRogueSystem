import { REGame_Map } from "./REGame_Map";
import { REGame_EntityFactory } from "./REGame_EntityFactory";
import { REGame_UnitAttribute } from "./REGame_Attribute";
import { REGame_Entity } from "./REGame_Entity";
import { RE_Game_World } from "./REGame_World";

export class REGame_Core
{
    // experimental: "場所移動" 等の基準となる、メインプレイヤーの Entity.
    // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。
    mainPlayerEntiyId: number = 0;


}

