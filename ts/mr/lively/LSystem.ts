import { LMap } from "./LMap";
import { LEntity } from "./LEntity";
import { LWorld } from "./LWorld";
import { LEntityId } from "./LObject";
import { MRSerializable } from "../Common";
import { MRLively } from "./MRLively";
import { USearch } from "../utility/USearch";

/**
 */
@MRSerializable
export class LSystem
{
    // experimental: "場所移動" 等の基準となる、メインプレイヤーの Entity.
    // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。
    mainPlayerEntityId: LEntityId = LEntityId.makeEmpty();

    uniqueActorUnits: LEntityId[] = [];

    eventInterpreterContextKey: string | undefined;

    public constructor() {
        this.eventInterpreterContextKey = undefined;
    }

    public get mainPlayerEntity(): LEntity {
        return MRLively.world.entity(MRLively.system.mainPlayerEntityId);
    }

    public getEventCommandTarget(): LEntity | undefined {
        if (!this.eventInterpreterContextKey) {
            if (MRLively.map.floorId().isNormalMap()) {
                // key が指定されていないが、現在のマップがツクール標準システムのマップであれば、ツクール標準のコマンドを実行する
                return undefined;
            }
            else {
                // key が指定されていないが、現在のマップが MR システムのマップであれば、操作中 Player をターゲットにする
                return this.mainPlayerEntity;
            }
        }
        if (this.eventInterpreterContextKey == "${Player}") {
            // 操作中の Unit (Player) が対象
            return this.mainPlayerEntity;
        }
        return USearch.getEntityByKeyPattern(this.eventInterpreterContextKey);
    }
}

