import { LMap } from "./LMap";
import { LEntity } from "./LEntity";
import { LWorld } from "./LWorld";
import { LEntityId } from "./LObject";
import { MRSerializable } from "../Common";

/**
 * 未分類グローバル変数
 */
@MRSerializable
export class LSystem
{
    // experimental: "場所移動" 等の基準となる、メインプレイヤーの Entity.
    // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。
    mainPlayerEntityId: LEntityId = LEntityId.makeEmpty();

    uniqueActorUnits: LEntityId[] = [];

}

