import { MRBasics } from "../data";
import { LEntity } from "../lively/entity/LEntity";
import { LEntityId } from "../lively/LObject";
import { MRLively } from "../lively/MRLively";

declare global {
    interface Game_BattlerBase {
        _entityId_MR: LEntityId | undefined;
        getEntity_MR(): LEntity | undefined;
    }
}

Object.defineProperties(Game_BattlerBase.prototype, {
    hp: {
        get: function() {
            const entuty = this.getEntity_MR();
            if (entuty)
                return entuty.getActualParam(MRBasics.params.hp);
            else
                return this._hp;
        },
        configurable: true
    },
});

Game_BattlerBase.prototype.getEntity_MR = function(): LEntity | undefined {
    if (this._entityId_MR && this._entityId_MR.hasAny()) {
        return MRLively.world.entity(this._entityId_MR);
    }
    return undefined;
};

const _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
Game_BattlerBase.prototype.param = function(paramId) {
    const entuty = this.getEntity_MR();
    if (entuty) {
        switch (paramId) {
            case 0: return entuty.getIdealParamBase(paramId + 1); // mhp
            case 1: return entuty.getIdealParamBase(paramId + 1); // mmp
            default: return entuty.getActualParam(paramId + 1);
        }
    }
    return _Game_BattlerBase_param.call(this, paramId);
};
