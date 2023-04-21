import { SCommandContext } from "../SCommandContext";
import { MRLively } from "ts/mr/lively/MRLively";
import { SCommandResponse } from "../SCommand";
import { MRBasics } from "ts/mr/data/MRBasics";
import { UAction } from "ts/mr/utility/UAction";
import { LGenerateDropItemCause } from "ts/mr/lively/internal";
import { assert } from "ts/mr/Common";
import { LActivity } from "ts/mr/lively/activities/LActivity";
import { TStumble } from "ts/mr/transactions/TStumble";

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

            if (cctx.isRunning) {
                break;
            }
        }
    }

    private process_Prologue(cctx: SCommandContext): void {

        this._phase = SChainAfterSchedulerPhase.StabilizeSituation;
    }
    private process_StabilizeSituation(cctx: SCommandContext): void {
        const currentMap = MRLively.mapView.currentMap;
        {
            for (const entity of currentMap.entities()) {
                const block = currentMap.block(entity.mx, entity.my);
                const currentLayer = block.findEntityLayerKind(entity);
                if (currentLayer) {
                    const homeLayer = entity.getHomeLayer();
                    if (currentLayer != homeLayer) {
                        UAction.postDropOrDestroyOnCurrentPos(cctx, entity, homeLayer);
                    }
                }
                else {
                    // 脱出の巻物などでマップを移動したときは、この時点で currentMap が変わっている。
                    // また currentMap は MapData 未ロードである場合もある。
                }
            }
        }
        
        for (const entity of currentMap.entities()) {
            entity.iterateBehaviorsReverse(b => {
                b.onStabilizeSituation(entity, cctx);
                return true;
            });
            for (const fe of entity.fieldEffects()) {
                fe.onStabilizeSituation(cctx);
            }
        }

        this._phase = SChainAfterSchedulerPhase.PreviewDead;
    }

    private process_PreviewDead(cctx: SCommandContext): void {

        for (const entity of MRLively.mapView.currentMap.entities()) {
            if (entity.isDeathStateAffected()) {
                cctx.postActivity( (new LActivity()).setup(MRBasics.actions.dead, entity));
            }
        }

        
        this._phase = SChainAfterSchedulerPhase.ResolvePermanentDeath;
    }

    private process_ResolvePermanentDeath(cctx: SCommandContext): void {
        
        // 戦闘不能の確定処理
        for (const entity of MRLively.mapView.currentMap.entities()) {
            if (entity.isDeathStateAffected()) {
                let result = SCommandResponse.Pass;
                entity.iterateBehaviorsReverse(b => {
                    result = b.onPermanentDeath(entity, cctx);
                    return result == SCommandResponse.Pass;
                });

                if (result == SCommandResponse.Pass) {
                    cctx.postSequel(entity, MRBasics.sequels.CollapseSequel);
                    TStumble.postDropItems(cctx, entity, LGenerateDropItemCause.Dead);
                    cctx.postDestroy(entity);
                }
            }
        }

        this._phase = SChainAfterSchedulerPhase.Epilogue;
    }
}
