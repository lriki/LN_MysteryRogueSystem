import { SPhaseResult } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { LCharacterAI } from "./LCharacterAI";
import { LEntity } from "../LEntity";
import { LCharacterAI_Normal } from "./LStandardAI";
import { LConfusionAI } from "./LConfusionAI";
import { assert, RESerializable } from "ts/re/Common";

@RESerializable
export class LRatedRandomAI extends LCharacterAI {
    private _randomRate: number;
    private _rundomTurn: boolean;
    private _standardAI: LCharacterAI_Normal;
    private _randomAI: LConfusionAI;

    public constructor() {
        super();
        this._randomRate = 50;
        this._rundomTurn = false;
        this._standardAI  = new LCharacterAI_Normal();
        this._randomAI  = new LConfusionAI();
    }

    public clone(): LCharacterAI {
        const i = new LRatedRandomAI();
        i._standardAI = this._standardAI.clone() as LCharacterAI_Normal;
        i._randomAI = this._randomAI.clone() as LConfusionAI;
        return i;
    }
    
    public thinkMoving(cctx: SCommandContext, self: LEntity): SPhaseResult {

        // ターンの最初に、今回はランダム移動なのか普通の行動かのか決める
        this._rundomTurn = (cctx.random().nextIntWithMax(100) < this._randomRate);

        if (this._rundomTurn) {
            return this._randomAI.thinkMoving(cctx, self);
        }
        else {
            return this._standardAI.thinkMoving(cctx, self);
        }
    }
    
    public thinkAction(cctx: SCommandContext, self: LEntity): SPhaseResult {
        assert(!this._rundomTurn);
        return this._standardAI.thinkMoving(cctx, self);
    }
}

