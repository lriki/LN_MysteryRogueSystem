import { LEntity } from "ts/mr/lively/entity/LEntity";

/**
 * ゲーム進行中の重要なタイミングで、各種オブジェクトの状態を調整するクラス。
 * タイトルや難易度ごとに調整できるように独立させておく。
 * 
 * 例えばハードなルールではダンジョン内で倒れたときに持ち物をすべてロストするが、
 * イージーモードでは装備品は残す、といった変化に対応できるようにする。
 */
export class SGroundRules {

    public onEntityLandLeaved(entity: LEntity): void {
        /*
        const actor = entity.findBehavior(LActorBehavior);
        if (actor) {
            actor.resetLevel();
        }

        const battler = entity.findBehavior(LBattlerBehavior);
        if (battler) {
            battler.resetAllConditions();
        }
        */
    }

}

