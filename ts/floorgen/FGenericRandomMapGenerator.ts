import { assert } from "ts/Common";
import { LRandom } from "ts/objects/LRandom";
import { FAxis, FBlockComponent, FDirection, FMap, FSector } from "./FMapData";

const RoomMinSize = 4;
const AreaMinSize = RoomMinSize + 3;

export enum FGenericRandomMapWayConnectionMode
{
    /** 区画の辺に通路を繋げる。通路が部屋を回り込んだり、全体的に長くなるためクロスが多くなったり、予測しづらく複雑なマップを生成する。 */
    AreaEdge,

    /** 部屋の辺に通路を繋げる。通路の回り込みは無くなり、部屋の基準点間の最短距離を結ぶようになる。部屋から通路が伸びる方向にはほぼ必ず部屋があるため、予測しやすく難易度の低いマップとなる。 */
    RoomEdge,
};

/**
 * 床・壁・通路・区画情報 などマップの基本情報を生成するモジュール。
 *
 * 次のような要素はこのパスでは生成しない。
 * - アイテム
 * - 罠
 * - 階段
 * - 水路
 * - 壊せない壁
 * - 装飾
 * ...
 *
 * FloorGenerator は一度の map building で複数使われることがある。
 * 特に水路を生成する場合は「部屋を生成せず通路のみとする」モードで FloorGenerator を使い、
 * そうではないモードで生成したマップと合成する。
 *
 * このように各種障害や装飾の生成ソースとしても利用するため、データは GameMap とは独立する。
 *
 * https://github.com/marukrap/RoguelikeDevResources
 * http://www.roguebasin.com/index.php?title=Dungeon-Building_Algorithm
 */
export class FGenericRandomMapGenerator {
    private _map: FMap;
    private _rand: LRandom;
    private _wayConnectionMode: FGenericRandomMapWayConnectionMode;

    public constructor(map: FMap, seed: number) {
        this._map = map;
        this._rand = new LRandom(seed);
        this._wayConnectionMode = FGenericRandomMapWayConnectionMode.AreaEdge;
    }

    public generate(): void {

        if (!this.makeAreas()) {
            return;
        }

        this.makeSectorAdjacency();
        this.makeSectorConnections();
        this.makeRooms();
        this.makeEdgePins();
        this.makePinConnections();
        this.makeBlocks();
        this.makePassageWay();

        console.log("sectors", this._map.sectors());
        this._map.print();
        throw new Error();
    
        /*
        if (!this.makeRoomGuides()) {
            return;
        }
    
        if (!this.makeCorridors()) {
            return;
        }
        */
    }

    private reportError(message: string): void {
        throw new Error(message);
    }
        
    private makeAreas(): boolean {
        const countH = 3;
        const countV = 3;

        /*
        Area の最小構成は次のようになる。

        .= room

        +-------+
        |       |   < 1Tile
        | ....  |
        | ....  |
        | ....  |
        | ....  |
        | ....  |
        |       |   < 2Tile
        |       |   < 2Tile
        +-------+
         ^    ^^
     1Tile    2Tile
               

        - 右端と下端は、通路を垂直または水平に伸ばすための最小領域として残す。

        */

        // Split area
        {
            const w = this._map.width() / countH;
            const h = this._map.height() / countV;
            if (w < AreaMinSize || h < AreaMinSize) {
                this.reportError("Map size too small for number of area divisions.");
                return false;
            }

            for (let y = 0; y < countV; y++) {
                for (let x = 0; x < countH; x++) {
                    const sector = this._map.newSector();
                    const sectorW = (x < countH - 1) ? w : this._map.width() - (w * (countH - 1)); // 最後の Sector は一杯まで広げる
                    const sectorH = (y < countV - 1) ? h : this._map.height() - (h * (countV - 1)); // 最後の Sector は一杯まで広げる
                    sector.setRect(w * x, h * y, sectorW, sectorH);
                }
            }
        }

/*
        for (int y = 0; y < countV; y++) {
            for (int x = 0; x < countH; x++) {
                auto& area = areaList[y * countH + x];

                area->edges[North] = ln::makeObject<FloorAreaEdge>();
                area->edges[South] = ln::makeObject<FloorAreaEdge>();
                area->edges[West] = ln::makeObject<FloorAreaEdge>();
                area->edges[East] = ln::makeObject<FloorAreaEdge>();
                area->edges[North]->area = area->edges[South]->area = area->edges[West]->area = area->edges[East]->area = area;

                if (y > 0) area->edges[North]->adjacencyArea = areaList[(y - 1) * countH + (x)];
                if (y < countV - 1) area->edges[South]->adjacencyArea = areaList[(y + 1) * countH + (x)];
                if (x > 0) area->edges[West]->adjacencyArea = areaList[(y) * countH + (x - 1)];
                if (x < countH - 1) area->edges[East]->adjacencyArea = areaList[(y) * countH + (x + 1)];
            }
        }
        */
        return true;
    }

    // 区画の隣接情報を作る
    private makeSectorAdjacency(): void {
        for (const s1 of this._map.sectors()) {
            for (const s2 of this._map.sectors()) {
                if (s1 != s2) {
                    if (s1.y1() <= s2.y2() && s1.y2() >= s2.y1()) {         // Y軸としては衝突している
                        if ((s1.x1() - 1) == s2.x2()) {                     // s1 は s2 の右側と隣接している
                            this._map.attemptNewAdjacency(s1, FDirection.L, s2, FDirection.R);
                        }
                        else if ((s1.x2() + 1) == s2.x1()) {                // s1 は s2 の左側と隣接している
                            this._map.attemptNewAdjacency(s1, FDirection.R, s2, FDirection.L);
                        }
                    }
                    else if (s1.x1() <= s2.x2() && s1.x2() >= s2.x1()) {    // X軸としては衝突している
                        if ((s1.y1() - 1) == s2.y2()) {                     // s1 は s2 の下側と隣接している
                            this._map.attemptNewAdjacency(s1, FDirection.T, s2, FDirection.B);
                        }
                        else if ((s1.y2() + 1) == s2.y1()) {                // s1 は s2 の上側と隣接している
                            this._map.attemptNewAdjacency(s1, FDirection.B, s2, FDirection.T);
                        }
                    }
                }
            }
        }
    }

    private makeSectorConnections(): void {
        for (const sector of this._map.sectors()) {
            // 接続可能な隣接情報を集める
            const adjacencies = sector.edges()
                .filter(edge => !edge.hasConnectionFully())  // 他の区画がまだ接続してきていない隣接は？
                .flatMap(edge => edge.adjacencies());

            if (adjacencies.length > 0) {
                // 接続する隣接情報を決定して接続
                const adjacency = adjacencies[this._rand.nextIntWithMax(adjacencies.length)];
                this._map.connectSectors(adjacency.edge1(), adjacency.edge2());
            }
        }
    }

    private makeRooms(): void {
        for (const sector of this._map.sectors()) {
            // 部屋を作れる範囲
            let l = 0;
            let t = 0;
            let r = sector.width() - 1;     // 区画の右端と下端 Block に部屋を生成することはできない
            let b = sector.height() - 1;    // 区画の右端と下端 Block に部屋を生成することはできない

            // 他の区画と接続されている方向は、Block 1 つ分のマージンが必要
            if (sector.edge(FDirection.L).hasConnection()) l += 1;
            if (sector.edge(FDirection.R).hasConnection()) r -= 1;
            if (sector.edge(FDirection.T).hasConnection()) t += 1;
            if (sector.edge(FDirection.B).hasConnection()) b -= 1;

            const maxRoomWidth = (r - l);
            const maxRoomHeight = (b - t);
            const w = this._rand.nextIntWithMinMax(RoomMinSize, (r - l) + 1);
            const h = this._rand.nextIntWithMinMax(RoomMinSize, (b - t) + 1);
            const x = ((w != maxRoomWidth) ? this._rand.nextIntWithMax(maxRoomWidth - w + 1) : 0);
            const y = ((h != maxRoomHeight) ? this._rand.nextIntWithMax(maxRoomHeight - h + 1) : 0);

            const room = this._map.newRoom(sector);
            room.setRect(sector.x1() + x, sector.y1() + y, w, h);

            // 部屋内に Pivot を作る
            const ox = room.x1() - sector.x1();
            const oy = room.y1() - sector.y1();
            assert(ox >= 0);
            assert(oy >= 0);
            sector.setPivot(ox + this._rand.nextIntWithMax(w), oy + this._rand.nextIntWithMax(h));
        }
    }

    private makeEdgePins(): void {
        for (const sector of this._map.sectors()) {
            const room = sector.room();

            let width, height;
            let ox, oy;
            let outerL, outerR, outerT, outerB;
            if (room) {
                width = room.width();
                height = room.height();
                ox = room.x1() - sector.x1();
                oy = room.y1() - sector.y1();
                outerL = room.x1() - 1;
                outerR = room.x2() + 1;
                outerT = room.y1() - 1;
                outerB = room.y2() + 1;
            }
            else {
                width = sector.width();
                height = sector.height();
                ox = 0;
                oy = 0
                outerL = -1;
                outerR = -1;
                outerT = -1;
                outerB = -1;
            }

            if (this._wayConnectionMode == FGenericRandomMapWayConnectionMode.RoomEdge) {
                for (let x = 0; x < width; x++) {
                    sector.edge(FDirection.T).addPin(ox + x);
                    sector.edge(FDirection.B).addPin(ox + x);
                }
                for (let y = 0; y < height; y++) {
                    sector.edge(FDirection.L).addPin(oy + y);
                    sector.edge(FDirection.R).addPin(oy + y);
                }
            }
            else if (this._wayConnectionMode == FGenericRandomMapWayConnectionMode.AreaEdge) {
                for (let x = 0; x < sector.width(); x++) {
                    if (x != outerL && x != outerR) {   // 部屋の外周に一致する場所には生成しない
                        sector.edge(FDirection.T).addPin(x);
                        sector.edge(FDirection.B).addPin(x);
                    }
                }
                for (let y = 0; y < sector.height(); y++) {
                    if (y != outerT && y != outerB) {   // 部屋の外周に一致する場所には生成しない
                        sector.edge(FDirection.L).addPin(y);
                        sector.edge(FDirection.R).addPin(y);
                    }
                }
            }
            else {
                throw new Error("Unreachable.");
            }
        }
    }

    private makePinConnections(): void {
        for (const connection of this._map.connections()) {
            const pins1 = connection.edge1().pins();
            const pins2 = connection.edge2().pins();
            connection.setConnectedPins(
                pins1[this._rand.nextIntWithMax(pins1.length)],
                pins2[this._rand.nextIntWithMax(pins2.length)]);
        }
    }

    private makePassageWay(): void {
        
        const OriginToPrimaryWayMargin = 2;
        /*
        OriginToPrimaryWayMargin は、部屋の基準点 (@) と MainStreet の間に設けるマージン。

        こうしないと例えば
        ↓ここ みたいなでっぱりができてしまう。
        ##########
        #,,,,,,@##
        ###,######
        ###,######
        ###,,,####
        #####@####
        ##########

        このときの MainStreet 部分は次の x で示した部分となる。
        ##########
        #xxx,,,@##
        ###,######
        ###,######
        ###,######

        これを防ぐためには、MainStreet の Y 座標が、最低 2 tile 分は部屋の基準点から離れる必要がある。
        ##########
        #,,,,,,@##
        #,########
        #xxx######
        ###,######

        逆にあえて袋小路作りたいときはこれを 0 とかにする。
        */
    
        for (const connection of this._map.connections()) {
            const pin1 = connection.pin1();
            const pin2 = connection.pin2();
            if (!pin1 || !pin2) continue;

            const secor1 = pin1.edge().sector();
            const secor2 = pin2.edge().sector();

            switch (connection.alignedAxis()) {
                case FAxis.H: { // sector は横並び
                    let secorL: FSector;
                    let secorR: FSector;
                    if (secor1.x1() < secor2.x2()) {
                        secorL = secor1;
                        secorR = secor2;
                    }
                    else {
                        secorL = secor2;
                        secorR = secor1;
                    }
                    const roomL = secorL.room();
                    const roomR = secorR.room();

                    // 部屋に隣接している位置。この X 座標に PrimaryWay を置くことはできない。
                    const roomLOuterX = roomL ? roomL.x2() + 1 : -100;
                    const roomROuterX = roomR ? roomR.x1() - 1 : -100;

                    // PrimaryWay を配置する選択肢を作る
                    const primaryWayXCandidates: number[] = [];
                    const left = secorL.x1() + secorL.px() + OriginToPrimaryWayMargin;
                    const right = secorR.x1() + secorR.px() - OriginToPrimaryWayMargin;
                    for (let x = left; x <= right; x++) {
                        if (x != roomLOuterX && x != roomROuterX) {
                            primaryWayXCandidates.push(x);
                        }
                    }

                    // console.log("secorL", secorL);
                    // console.log("secorR", secorR);
                    // console.log(roomLOuterX, roomROuterX);
                    // console.log(left, right);
                    // console.log("primaryWayXCandidates", primaryWayXCandidates);
                    
                    // PrimaryWay の X 座標を決める
                    const primaryWayX = primaryWayXCandidates[this._rand.nextIntWithMax(primaryWayXCandidates.length)];

                    // PrimaryWay の Top, Bottom 座標を決める
                    const primaryWayT = Math.min(pin1.y(), pin2.y());
                    const primaryWayB = Math.max(pin1.y(), pin2.y());

                    console.log("primaryWayT", primaryWayT);
                    console.log("primaryWayB", primaryWayB);
                    console.log("pin1", pin1);
                    console.log("pin2", pin2);

                    // Plot
                    for (let y = primaryWayT; y <= primaryWayB; y++) {
                        console.log(primaryWayX, y);
                        this._map.block(primaryWayX, y).setComponent(FBlockComponent.Passageway);
                    }
                    
                    this.plotSecondaryWay(primaryWayX, pin1.y(), secor1, FAxis.H);
                    this.plotSecondaryWay(primaryWayX, pin2.y(), secor2, FAxis.H);

                    break;
                }
                case FAxis.V: { // sector は縦並び

                    break;
                }
                default:
                    throw new Error("Unreachable.");
            }
        }
    }

    /**
     * 
     * @param startX 始点座標 (PrimaryWai の端)
     * @param startY 始点座標 (PrimaryWai の端)
     * @param targetSector 終点となる Pivot を持つ Sector
     * @param relationship 
     */
    private plotSecondaryWay(startX: number, startY: number, targetSector: FSector, relationship: FAxis): void {
        const px = targetSector.x1() + targetSector.px();
        const py = targetSector.y1() + targetSector.py();
        switch (relationship) {
            case FAxis.H: { // sector は横並び
                // まずは Pin から基準点へ向かうように水平線を引いて、
                const l = Math.min(startX, px);
                const r = Math.max(startX, px);
                for (let x = l; x <= r; x++) {
                    this._map.block(x, startY).setComponent(FBlockComponent.Passageway);
                }

                // その点から基準点へ垂直に線を引く
                const t = Math.min(startY, py);
                const b = Math.max(startY, py);
                for (let y = t; y <= b; y++) {
                    this._map.block(px, y).setComponent(FBlockComponent.Passageway);
                }
                break;
            }
            case FAxis.V: { // sector は縦並び


                break;
            }
            default:
                throw new Error("Unreachable.");
        }
    }

    private makeBlocks(): void {
        for (const room of this._map.rooms()) {
            
            for (let y = room.y1(); y <= room.y2(); y++) {
                for (let x = room.x1(); x <= room.x2(); x++) {
                    const block = this._map.block(x, y);
                    block.setComponent(FBlockComponent.Room);
                    block.setRoomId(room.id());
                }
            }
        }
    }
}
