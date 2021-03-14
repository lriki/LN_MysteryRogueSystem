import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { LEntity } from "./LEntity";
import { RE_Game_World } from "./REGame_World";
import { LEntityId } from "./LObject";

export class REGame_Core
{
    // experimental: "場所移動" 等の基準となる、メインプレイヤーの Entity.
    // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。
    mainPlayerEntiyId: LEntityId = {index:0, key: 0};


}

