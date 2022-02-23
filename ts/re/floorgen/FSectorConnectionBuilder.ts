import { assert } from "../Common";
import { DSectorConnectionPreset, DTerrainSetting } from "../data/DTerrainPreset";
import { LRandom } from "../objects/LRandom";
import { FSector, FSectorAdjacency } from "./data/FSector";
import { FDirection, FMap, FSectorId } from "./FMapData";



export class FSectorConnectionBuilder {

    public static connect(map: FMap, rand: LRandom, setting: DTerrainSetting): void {
        switch (setting.connectionPreset) {
            case DSectorConnectionPreset.Default:
                this.connectDefault(map, rand);
                break;
            case DSectorConnectionPreset.C:
                this.connectC(map, rand, setting);
                break;
            default:
                throw new Error("Not implemented.");
        }
    }

    // Sector ごとに、ランダムでいずれかの Adjacency を選択する。
    // 四辺のどれかひとつに向かって腕を伸ばすイメージ。
    private static connectDefault(map: FMap, rand: LRandom): void {
        const connectionRaisedSectorIds: FSectorId[] = [];  // Connection を作った Sector (相手側は含まない)
        const tracedSectorIds: FSectorId[] = [];               // 一筆書きで通ったところ
        const sectorCount = map.sectors().length;

        // 接続の偏りを無くすため、最初に開始点 Sector を決めてそこから一筆書きの要領で適当に接続していく
        {

            // 開始 Sector
            let sector = map.sectors()[rand.nextIntWithMax(sectorCount)];

            for (let i = 0; i < sectorCount; i++) { // 最大でも Sector 総数までしかループしないので、念のための無限ループ回避

                // 接続候補を集める
                const candidateAdjacencies: FSectorAdjacency[] = [];
                for (const e of sector.edges()) {
                    for (const a of e.adjacencies()) {
                        const e2 = a.otherSide(e);
                        if (!tracedSectorIds.includes(e2.sector().id())) {  // 既に通った Sector は除外
                            candidateAdjacencies.push(a);
                        }
                    }
                }
                
                // 接続する隣接情報を決定して接続
                if (candidateAdjacencies.length > 0) {
                    const adjacency = candidateAdjacencies[rand.nextIntWithMax(candidateAdjacencies.length)];
                    map.connectSectors(adjacency.edge1(), adjacency.edge2());
                    connectionRaisedSectorIds.push(sector.id());
                    tracedSectorIds.push(sector.id());

                    sector = adjacency.otherSideBySector(sector).sector();
                }
                else {
                    // 候補が無ければ行き止まり
                    break;
                }
            }

        }

        // 次に、一筆書きで通らなかった Sector から通った Sector へ接続していく
        {
            for (let i = 0; i < sectorCount; i++) { // 最大でも Sector 総数までしかループしないので、念のための無限ループ回避
                
                for (const sector of map.sectors()) {
                    if (!connectionRaisedSectorIds.includes(sector.id())) {
                        
                        // 接続候補を集める
                        const candidateAdjacencies: FSectorAdjacency[] = [];
                        for (const e of sector.edges()) {
                            for (const a of e.adjacencies()) {
                                const e2 = a.otherSide(e);
                                if (connectionRaisedSectorIds.includes(e2.sector().id())) { // Connection 作成済みのところへ向かって接続したい
                                    candidateAdjacencies.push(a);
                                }
                            }
                        }
                        
                        // 接続する隣接情報を決定して接続
                        if (candidateAdjacencies.length > 0) {
                            const adjacency = candidateAdjacencies[rand.nextIntWithMax(candidateAdjacencies.length)];
                            map.connectSectors(adjacency.edge1(), adjacency.edge2());
                            connectionRaisedSectorIds.push(sector.id());
                        }
                    }
                }

                if (connectionRaisedSectorIds.length == sectorCount) {
                    break;
                }

            }
        }
    }

    private static sector(map: FMap, setting: DTerrainSetting, x: number, y: number): FSector {
        const w = setting.divisionCountX;
        return map.sectors()[w * y + x];
    }

    private static connectC(map: FMap, rand: LRandom, setting: DTerrainSetting): void {
        assert(setting.divisionCountX >= 3);
        assert(setting.divisionCountY >= 3);

        const r = setting.divisionCountX - 1;
        const b = setting.divisionCountX - 1;
        for (let x = 0; x < r; x++) {
            const s1 = this.sector(map, setting, x, 0);
            const s2 = this.sector(map, setting, x + 1, 0);
            map.connectSectors(s1.edge(FDirection.R), s2.edge(FDirection.L));
        }

        for (let y = 0; y < b; y++) {
            const s1 = this.sector(map, setting, 0, y);
            const s2 = this.sector(map, setting, 0, y + 1);
            map.connectSectors(s1.edge(FDirection.B), s2.edge(FDirection.T));
        }

        for (let x = 0; x < r; x++) {
            const s1 = this.sector(map, setting, x, b);
            const s2 = this.sector(map, setting, x + 1, b);
            map.connectSectors(s1.edge(FDirection.R), s2.edge(FDirection.L));
        }
    }
}
