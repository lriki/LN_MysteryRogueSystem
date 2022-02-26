import { assert } from "ts/re/Common";
import { DTerrainSetting, FGenericRandomMapWayConnectionMode } from "../data/DTerrainPreset";
import { LRandom } from "../objects/LRandom";
import { FSector, FSectorAdjacency } from "./data/FSector";
import { FAxis, FBlockComponent, FDirection, FEdgePin, FMap, FSectorId } from "./FMapData";
import { FSectorConnectionBuilder } from "./FSectorConnectionBuilder";

const RoomMinSize = 4;
const AreaMinSize = RoomMinSize + 3;

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
    private _setting: DTerrainSetting;

    public constructor(map: FMap, setting: DTerrainSetting) {
        this._map = map;
        this._setting = setting;
    }

    public get random(): LRandom {
        return this._map.random();
    }

    public generate(): void {

        if (!this.makeSectors()) {
            return;
        }

        this.makeSectorAdjacency();
        this.makeSectorConnections();
        this.makeRoomShapeDefinitions();
        this.makeStructureDefinitions();
        this.makeRooms();
        this.makePivots();
        this.makeEdgePins();
        this.makePinConnections();
        this.makePassageWay();
        this.makeBlocks();
    }

    private reportError(message: string): void {
        throw new Error(message);
    }
        
    private makeSectors(): boolean {
        const countH = this._setting.divisionCountX;
        const countV = this._setting.divisionCountY;

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
            const w = this._map.innerWidth / countH;
            const h = this._map.innerHeight/ countV;
            if (w < AreaMinSize || h < AreaMinSize) {
                this.reportError("Map size too small for number of area divisions.");
                return false;
            }

            for (let y = 0; y < countV; y++) {
                for (let x = 0; x < countH; x++) {
                    const sector = this._map.newSector();
                    const sectorW = (x < countH - 1) ? w : this._map.innerWidth - (w * (countH - 1)); // 最後の Sector は一杯まで広げる
                    const sectorH = (y < countV - 1) ? h : this._map.innerHeight - (h * (countV - 1)); // 最後の Sector は一杯まで広げる
                    sector.setRect(this._map.ox + w * x, this._map.ox + h * y, sectorW, sectorH);
                }
            }
        }
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

    // 実際に Connection を作成する。
    private makeSectorConnections(): void {
        FSectorConnectionBuilder.connect(this._map, this.random, this._setting);
    }

    // RoomShape を選択する。
    // 種類によっては行き止まりにしか生成できない、など制約があるので、Connection を作った後に処理する。
    private makeRoomShapeDefinitions(): void {
        const sectors = this._map.sectors();
        const sectorCount = sectors.length;
        let shapeDefCount = this._setting.forceRoomShapes.length;
        if (shapeDefCount >= sectorCount) {
            shapeDefCount = sectorCount;
        }

        // まずは強制的に設定したいものを処理する
        {
            const shapes = new Array<string>(sectorCount);
            for (let i = 0; i < shapeDefCount; i++) {
                shapes[i] = this._setting.forceRoomShapes[i].typeName;
            }
            this.random.mutableShuffleArray(shapes);
    
            for (let i = 0; i < sectorCount; i++) {
                if (shapes[i]) {
                    sectors[i].roomShapeType = shapes[i];
                }
            }
        }
    }
    
    // 構造物。RoomShape とほぼ同じ。
    private makeStructureDefinitions(): void {
        const sectors = this._map.sectors();
        const sectorCount = sectors.length;
        let structureDefCount = this._setting.forceStructures.length;
        if (structureDefCount >= sectorCount) {
            structureDefCount = sectorCount;
        }

        // まずは強制的に設定したいものを処理する
        {
            const shapes = new Array<string>(sectorCount);
            for (let i = 0; i < structureDefCount; i++) {
                shapes[i] = this._setting.forceStructures[i].typeName;
            }
            this.random.mutableShuffleArray(shapes);
    
            for (let i = 0; i < sectorCount; i++) {
                if (shapes[i]) {
                    sectors[i].structureType = shapes[i];
                }
            }
        }
    }

    private makeRooms(): void {
        // 大部屋？
        const grateHall = this._map.sectors().length == 1;

        // Room を作れそうな Sector を集める
        const candidateSectors: FSector[] = [];
        for (const sector of this._map.sectors()) {
            if (grateHall || sector.hasAnyConnection()) {
                candidateSectors.push(sector);
            }
            else {
                // Connection の無い Sector は、自動での部屋生成は不要。
                // 埋蔵金部屋などは別途作る。
            }
        }

        // candidateSectors の各 Sector に対して Room の生成有無をランダムに決める
        const candidateSectorCount = candidateSectors.length;
        const roomEnables = new Array<boolean>(candidateSectorCount);
        let roomCount = 0;
        if (this._setting.roomCountMax == Infinity) {
            roomCount = candidateSectorCount;
        }
        else {
            roomCount = this.random.nextIntWithMinMax(this._setting.roomCountMin, this._setting.roomCountMax + 1);
            roomCount = Math.min(Math.max(roomCount, 2), candidateSectorCount);
        }
        for (let i = 0; i < roomCount; i++) {
            roomEnables[i] = true;
        }
        if (roomCount < roomEnables.length) {
            this.random.mutableShuffleArray(roomEnables);
        }

        // 各候補 Sector について、生成フラグの立っているものへ Room を作る
        for (let iSector = 0; iSector < candidateSectorCount; iSector++) {
            const sector = candidateSectors[iSector];
            if (roomEnables[iSector]) {
                const room = this._map.newRoom(sector);
    
                // 部屋を作れる範囲
                let l = 0;
                let t = 0;
                let r = sector.width() - 1;
                let b = sector.height() - 1;
    
                // 他の区画と接続されている方向は、Block 1 つ分のマージンが必要
                if (sector.edge(FDirection.L).hasConnection()) l += 1;
                if (sector.edge(FDirection.R).hasConnection()) r -= 2;  // 右側は 2 ブロック、右 Sector と併せて、部屋間には最低 3 ブロック設けたい
                if (sector.edge(FDirection.T).hasConnection()) t += 1;
                if (sector.edge(FDirection.B).hasConnection()) b -= 2;  // 下側は 2 ブロック、下 Sector と併せて、部屋間には最低 3 ブロック設けたい
    
                const maxRoomWidth = (r - l) + 1;
                const maxRoomHeight = (b - t) + 1;
    
                if (sector.roomShapeType == "FullPlane") {
                    room.setRect(sector.x1() + l, sector.y1() + t, maxRoomWidth, maxRoomHeight);
                    room.poorVisibility = true;
                }
                else if (sector.roomShapeType == "HalfPlane") {
                    const sw = sector.width();
                    const sh = sector.height();
                    const w = sw / 2;
                    const h = sh / 2;
                    const ox = (sw - w) / 2;
                    const oy = (sh - h) / 2;
                    room.setRect(sector.x1() + ox, sector.y1() + oy, w, h);
                    room.poorVisibility = true;
                }
                else {
                    const w = this.random.nextIntWithMinMax(RoomMinSize, maxRoomWidth);
                    const h = this.random.nextIntWithMinMax(RoomMinSize, maxRoomHeight);
                    const x = l + ((w != maxRoomWidth) ? this.random.nextIntWithMax(maxRoomWidth - w) : 0);
                    const y = t + ((h != maxRoomHeight) ? this.random.nextIntWithMax(maxRoomHeight - h) : 0);
                    room.setRect(sector.x1() + x, sector.y1() + y, w, h);
                }
            }
        }
    }

    private makePivots(): void {
        for (const sector of this._map.sectors()) {
            const room = sector.room();
            if (room) {
                // 部屋内に Pivot を作る
                const ox = room.x1() - sector.x1();
                const oy = room.y1() - sector.y1();
                assert(ox >= 0);
                assert(oy >= 0);
                sector.setPivot(ox + this.random.nextIntWithMax(room.width()), oy + this.random.nextIntWithMax(room.height()));
            }
            else {
                // 区画内に Pivot を作る
                sector.setPivot(this.random.nextIntWithMax(sector.width()), this.random.nextIntWithMax(sector.height()));
            }
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

            if (this._setting.wayConnectionMode == FGenericRandomMapWayConnectionMode.RoomEdge) {
                for (let x = 0; x < width; x++) {
                    sector.edge(FDirection.T).addPin(ox + x);
                    sector.edge(FDirection.B).addPin(ox + x);
                }
                for (let y = 0; y < height; y++) {
                    sector.edge(FDirection.L).addPin(oy + y);
                    sector.edge(FDirection.R).addPin(oy + y);
                }
            }
            else if (this._setting.wayConnectionMode == FGenericRandomMapWayConnectionMode.SectionEdge) {
                const sx = sector.x1();
                const sy = sector.y1();

                for (let x = 0; x < sector.width() - 1; x++) {      // 区画の右端に通路は作れないため、pin は作らない。そのための -1
                    if ((sx + x) != outerL && (sx + x) != outerR) { // 部屋の外周に一致する場所には生成しない
                        sector.edge(FDirection.T).addPin(x);
                        sector.edge(FDirection.B).addPin(x);
                    }
                }
                for (let y = 0; y < sector.height() - 1; y++) {      // 区画の下端に通路は作れないため、pin は作らない。そのための -1
                    if ((sy + y) != outerT && (sy + y) != outerB) {  // 部屋の外周に一致する場所には生成しない
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
            const sector1 = connection.edge1().sector();
            const sector2 = connection.edge2().sector();

            // 相手側
            const candidates1: FEdgePin[] = [];
            const candidates2: FEdgePin[] = [];
            if (connection.alignedAxis() == FAxis.H) {
                for (const pin of pins1) {
                    if (!sector2.isRoomBesideY(pin.my())) {
                        candidates1.push(pin);
                    }
                }
                for (const pin of pins2) {
                    if (!sector1.isRoomBesideY(pin.my())) {
                        candidates2.push(pin);
                    }
                }
            }
            else {
                for (const pin of pins1) {
                    if (!sector2.isRoomBesideX(pin.mx())) {
                        candidates1.push(pin);
                    }
                }
                for (const pin of pins2) {
                    if (!sector1.isRoomBesideX(pin.mx())) {
                        candidates2.push(pin);
                    }
                }
            }
            /*
            isRoomBeside～ で外周チェックしないと、次のように通路ができてしまう。
               *----------
               | 通路
            +--+    +-----
            |       |
            |       |

            */

            connection.setConnectedPins(
                candidates1[this.random.nextIntWithMax(candidates1.length)],
                candidates2[this.random.nextIntWithMax(candidates2.length)]);
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
                    // Sector と Room の位置関係を確認
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
                    const edgeL = secorL.edge(FDirection.R);    // 左側領域の、右端Edge
                    const edgeR = secorR.edge(FDirection.L);    // 右側領域の、左端Edge
                    const roomL = secorL.room();
                    const roomR = secorR.room();

                    // 部屋に隣接している位置。この X 座標に PrimaryWay を置くことはできない。
                    const roomLOuterX = roomL ? roomL.x2() + 1 : -100;
                    const roomROuterX = roomR ? roomR.x1() - 1 : -100;

                    // PrimaryWay を配置する選択肢を作る (Pivot の間)
                    const primaryWayXCandidates: number[] = [];
                    const left = secorL.x1() + secorL.px() + OriginToPrimaryWayMargin;
                    const right = secorR.x1() + secorR.px() - OriginToPrimaryWayMargin;
                    for (let x = left; x <= right; x++) {
                        if (x != roomLOuterX && x != roomROuterX) {
                            primaryWayXCandidates.push(x);
                        }
                    }
                    assert(primaryWayXCandidates.length > 0);
                    
                    // PrimaryWay の X 座標を決める
                    const primaryWayX = primaryWayXCandidates[this.random.nextIntWithMax(primaryWayXCandidates.length)];

                    // PrimaryWay の Top, Bottom 座標を決める
                    const primaryWayT = Math.min(pin1.my(), pin2.my());
                    const primaryWayB = Math.max(pin1.my(), pin2.my());

                    // Plot
                    for (let y = primaryWayT; y <= primaryWayB; y++) {
                        const block = this._map.block(primaryWayX, y);
                        block.setComponent(FBlockComponent.Passageway);
                    }
                    this.plotSecondaryWay(primaryWayX, pin1.my(), secor1, FAxis.H);
                    this.plotSecondaryWay(primaryWayX, pin2.my(), secor2, FAxis.H);
                    break;
                }
                case FAxis.V: { // sector は縦並び
                    // Sector と Room の位置関係を確認
                    let secorT: FSector;
                    let secorB: FSector;
                    if (secor1.x1() < secor2.x2()) {
                        secorT = secor1;
                        secorB = secor2;
                    }
                    else {
                        secorT = secor2;
                        secorB = secor1;
                    }
                    const roomT = secorT.room();
                    const roomB = secorB.room();

                    // 部屋に隣接している位置。この Y 座標に PrimaryWay を置くことはできない。
                    const roomTOuterY = roomT ? roomT.y2() + 1 : -100;
                    const roomBOuterY = roomB ? roomB.y1() - 1 : -100;

                    // PrimaryWay を配置する選択肢を作る
                    const primaryWayYCandidates: number[] = [];
                    const top = secorT.y1() + secorT.py() + OriginToPrimaryWayMargin;
                    const bottom = secorB.y1() + secorB.py() - OriginToPrimaryWayMargin;
                    for (let y = top; y <= bottom; y++) {
                        if (y != roomTOuterY && y != roomBOuterY) {
                            primaryWayYCandidates.push(y);
                        }
                    }
                    assert(primaryWayYCandidates.length > 0);
                    
                    // PrimaryWay の Y 座標を決める
                    const primaryWayY = primaryWayYCandidates[this.random.nextIntWithMax(primaryWayYCandidates.length)];

                    // PrimaryWay の Top, Bottom 座標を決める
                    const primaryWayL = Math.min(pin1.mx(), pin2.mx());
                    const primaryWayR = Math.max(pin1.mx(), pin2.mx());

                    

                    // Plot
                    for (let x = primaryWayL; x <= primaryWayR; x++) {
                        const block = this._map.block(x, primaryWayY);
                        block.setComponent(FBlockComponent.Passageway);
                    }
                    this.plotSecondaryWay(pin1.mx(), primaryWayY, secor1, FAxis.V);
                    this.plotSecondaryWay(pin2.mx(), primaryWayY, secor2, FAxis.V);
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
                // まずは Pin から基準点へ向かうように垂直線を引いて、
                const t = Math.min(startY, py);
                const b = Math.max(startY, py);
                for (let y = t; y <= b; y++) {
                    this._map.block(startX, y).setComponent(FBlockComponent.Passageway);
                }

                // その点から基準点へ水平に線を引く
                const l = Math.min(startX, px);
                const r = Math.max(startX, px);
                for (let x = l; x <= r; x++) {
                    this._map.block(x, py).setComponent(FBlockComponent.Passageway);
                }
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
