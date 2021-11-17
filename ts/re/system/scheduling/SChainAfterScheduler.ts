import { SScheduler, SScheduler_old } from "./SScheduler";
import { LTOUnit } from "ts/re/objects/LScheduler";
import { LEntity } from "../../objects/LEntity";
import { LUnitBehavior } from "../../objects/behaviors/LUnitBehavior";
import { SCommandContext } from "../SCommandContext";
import { REGame } from "ts/re/objects/REGame";
import { SCommandResponse } from "../RECommand";
import { REBasics } from "ts/re/data/REBasics";
import { UAction } from "ts/re/usecases/UAction";
import { LGenerateDropItemCause } from "ts/re/objects/internal";
import { assert } from "ts/re/Common";
import { LActivity } from "ts/re/objects/activities/LActivity";

enum SChainAfterSchedulerPhase {
    Prologue,
    StabilizeSituation,
    PreviewDead,
    ResolvePermanentDeath,
    Epilogue,
}

export class SChainAfterScheduler {
    private _phase: SChainAfterSchedulerPhase;

    public constructor() {
        this._phase = SChainAfterSchedulerPhase.Prologue;
    }

    public reset(): void {
        this._phase = SChainAfterSchedulerPhase.Prologue;
    }

    public isRunning(): boolean {
        return this._phase != SChainAfterSchedulerPhase.Epilogue;
    }
    
    public isEnd(): boolean {
        return this._phase == SChainAfterSchedulerPhase.Epilogue;
    }
    
    public process(cctx: SCommandContext): void {
        while (this.isRunning()) {
            switch (this._phase) {
                case SChainAfterSchedulerPhase.Prologue:
                    this.process_Prologue(cctx);
                    break;
                case SChainAfterSchedulerPhase.StabilizeSituation:
                    this.process_StabilizeSituation(cctx);
                    break;
                case SChainAfterSchedulerPhase.PreviewDead:
                    this.process_PreviewDead(cctx);
                    break;
                case SChainAfterSchedulerPhase.ResolvePermanentDeath:
                    this.process_ResolvePermanentDeath(cctx);
                    break;
                default:
                    throw new Error("Unreachable.");
            }

            if (cctx.isRunning()) {
                break;
            }
        }
    }

    private process_Prologue(cctx: SCommandContext): void {

        this._phase = SChainAfterSchedulerPhase.StabilizeSituation;
    }
    private process_StabilizeSituation(cctx: SCommandContext): void {
        
        {
            for (const entity of REGame.map.entities()) {
                const block = REGame.map.block(entity.x, entity.y);
                const currentLayer = block.findEntityLayerKind(entity);
                assert(currentLayer);
                const homeLayer = entity.getHomeLayer();
                if (currentLayer != homeLayer) {
                    UAction.postDropOrDestroyOnCurrentPos(cctx, entity, homeLayer);
                }
            }
        }
        
        for (const entity of REGame.map.entities()) {
            entity.iterateBehaviorsReverse(b => {
                b.onStabilizeSituation(entity, cctx);
                return true;
            });
        }

        this._phase = SChainAfterSchedulerPhase.PreviewDead;
    }

    private process_PreviewDead(cctx: SCommandContext): void {

        for (const entity of REGame.map.entities()) {
            if (entity.isDeathStateAffected()) {
                cctx.postActivity( (new LActivity()).setup(REBasics.actions.dead, entity));
            }
        }

        
        this._phase = SChainAfterSchedulerPhase.ResolvePermanentDeath;
    }

    private process_ResolvePermanentDeath(cctx: SCommandContext): void {
        
        // 戦闘不能の確定処理
        for (const entity of REGame.map.entities()) {
            if (entity.isDeathStateAffected()) {
                let result = SCommandResponse.Pass;
                entity.iterateBehaviorsReverse(b => {
                    result = b.onPermanentDeath(entity, cctx);
                    return result == SCommandResponse.Pass;
                });

                if (result == SCommandResponse.Pass) {
                    cctx.postSequel(entity, REBasics.sequels.CollapseSequel);
                    UAction.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
                    cctx.postDestroy(entity);
                }
            }
        }

        this._phase = SChainAfterSchedulerPhase.Epilogue;
    }
}
