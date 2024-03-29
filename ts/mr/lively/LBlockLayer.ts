import { MRSerializable } from "../Common";
import { LEntity } from "./entity/LEntity";
import { LEntityId } from "./LObject";
import { MRLively } from "./MRLively";


// 同一レイヤーに、同時に複数の Entity は存在可能。
// 例えばシレン2のかまいたちの矢は、発射直後の状態ではすべて同一タイル内に存在する。
// またシレン2のバグから推測することもできる。
// http://shiren2.lsx3.com/?plugin=paraedit&parnum=17&page=%A5%D0%A5%B0&refer=%A5%D0%A5%B0
@MRSerializable
export class REBlockLayer {
    private _entityIds: LEntityId[] = [];

    public constructor() {
    }

    public entityIds(): readonly LEntityId[] {
        return this._entityIds;
    }

    entities(): readonly LEntity[] {
        return this._entityIds.map(x => MRLively.world.entity(x));
    }

    firstEntity(): LEntity | undefined {
        if (this._entityIds.length > 0)
            return MRLively.world.entity(this._entityIds[0]);
        else
            return undefined;
    }

    isContainsAnyEntity(): boolean {
        return this._entityIds.length > 0;
    }

    isContains(entity: LEntity): boolean {
        return this._entityIds.findIndex(x => x.equals(entity.entityId())) >= 0;
    }

    isOccupied(): boolean {
        return this._entityIds.some(x => MRLively.world.entity(x).blockOccupied);
    }

    addEntity(entity: LEntity) {
        this._entityIds.push(entity.entityId());
    }

    removeEntity(entity: LEntity): boolean {
        const index = this._entityIds.findIndex(x => x.equals(entity.entityId()));
        if (index >= 0) {
            this._entityIds.splice(index, 1);
            return true;
        }
        else {
            return false;
        }
    }

    removeAllEntites() {
        this._entityIds.splice(0);
    }
}
