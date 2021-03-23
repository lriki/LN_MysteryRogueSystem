import { REGame_Map } from "./REGame_Map";
import { REEntityFactory } from "../system/REEntityFactory";
import { LEntity } from "./LEntity";
import { LWorld } from "./LWorld";
import { LEntityId } from "./LObject";

/**
 * 未分類グローバル変数
 */
export class LSystem
{
    // experimental: "場所移動" 等の基準となる、メインプレイヤーの Entity.
    // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。
    mainPlayerEntityId: LEntityId = {index:0, key: 0};

    uniqueActorUnits: LEntityId[] = [];

}

