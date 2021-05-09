import { REData } from "ts/data/REData";
import { LFloorId } from "ts/objects/LFloorId";
import { assert, Log } from "../Common";
import { REDataManager } from "../data/REDataManager";
import { REGame } from "../objects/REGame";
import { REGameManager } from "../system/REGameManager";
import { RMMZHelper } from "./RMMZHelper";

declare global {
    interface Game_Map {
        //isRMMZDefaultSystemMap(): boolean;
        //isRESystemMap(): boolean;
    }
}

var _Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId: number) {

    // 先に REMap をクリーンアップしておく。
    // 内部から onEntityLeavedMap() が呼び出され、ここで Game_Event の erase が走るため、
    // Game_Map 構築後にクリーンアップしてしまうと、新しく作成された Event が消えてしまう。
    REGame.map.releaseMap();
    REGame.messageHistory.clear();

    
    _Game_Map_setup.call(this, mapId);

    
    // performTransfer() が呼ばれる時点では、RMMZ のマップ情報はロード済み。
    // transfarEntity で Player 操作中の Entity も別マップへ移動する。
    // この中で、Camera が Player を注視していれば Camera も Floor を移動することで、
    // REシステムとしてのマップ遷移も行われる。
    //
    // Game_Map 呼び出し元の Game_Player.performTransfer() で行うのも手だが、
    // performTransfer() は同一マップ内で位置だけ移動するときも呼び出されるため、
    // 本当に別マップに移動したときだけ処理したいものは Game_Map.setup() で行った方がよい。

    let floorId: LFloorId;
    if (REDataManager.isLandMap(mapId)) {
        floorId = new LFloorId(REData.lands.findIndex(x => x.rmmzMapId == mapId), $gamePlayer._newX);
    }
    else if (REDataManager.isRESystemMap(mapId)) {
        // 固定マップへの直接遷移
        floorId = LFloorId.makeByRmmzFixedMapId(mapId);
    }
    else {
        // 管理外マップへの遷移
        floorId = LFloorId.makeByRmmzNormalMapId(mapId);
    }

    const playerEntity = REGame.world.entity(REGame.system.mainPlayerEntityId);
    if (playerEntity) {
        REGame.world._transferEntity(playerEntity, floorId, $gamePlayer._newX, $gamePlayer._newY);
        assert(REGame.camera.isFloorTransfering());
        REGameManager.performFloorTransfer();   // TODO: transferEntity でフラグ立った後すぐに performFloorTransfer() してるので、まとめていいかも
    }
    else {
        throw new Error();
    }

    

    //if (REDataManager.isRESystemMap(mapId) || REDataManager.isLandMap(mapId)) {
    if (REGame.map.floorId().isEntitySystemMap()) {
        // Land 定義マップなど、初期配置されているイベントを非表示にしておく。
        // ランダム Entity 生成ではこれが動的イベントの原本になることもあるので、削除はしない。
        if (REDataManager.isLandMap(mapId)) {
            this.events().forEach(e => e.setTransparent(true));
        }

        $gamePlayer.hideFollowers();
    }

    Log.d("RMMZ map setup finished.");
}


    /*
Game_Map.prototype.setTileData = function(x: number, y: number, z: number, value: number) : void {
    const width = this.width();
    const height = this.height();
    assert(0 <= x && x < width && 0 <= y && y < height);

    const data = $dataMap.data;
    if (data) {
        data[(z * height + y) * width + x] = value;
    }
}
*/

var _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive: boolean) {
    _Game_Map_update.call(this, sceneActive);

}

/*
Game_Map.prototype.isRMMZDefaultSystemMap = function(): boolean {
    return REData.maps[this.mapId()].defaultSystem;
}

Game_Map.prototype.isRESystemMap = function(): boolean {
    return REGame.map.isValid();
}
*/
