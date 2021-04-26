
/**
 * 
 * [2020/11/29] Note:
 * ----------
 * Inventory の定義をどこまでにするのかによるけど、
 * 「アイテムを持てる」という視点だと、Inventory は必ず Unit がもつ、というわけではない点に注意。
 * 
 * - Player は持ち物として Inventory がある。
 * - 仲間によっては持ち物を持てる (シレン2 マーモ)
 * - モンスターも、アイテムを拾って保持し、投げる者がいる (シレン2 アメンジャ)
 * - 行商人も、アイテムを拾って保持する。(値札をつける)
 * - 倉庫を Entity とするかは微妙なところだが、しておくと UI が共通化できそう
 * - 壺は Inventory を持つアイテム、と考えられそう
 * 
 * アイテムに関連する共通アクション
 * - 拾う
 * - 交換
 * - 置く
 * - 投げる
 * - (放り投げる)
 * - (落とす)
 * - (落下する)
 * - (ばらまく) : 転ばされた時。壺は稀に割れる
 * 
 * 壺
 * - 入れる
 * - だす
 * 
 * 固有アクション
 * - 食べる
 * - 振る
 * - 読む
 * - …など。
 * 
 * NPCに対して　スリ取り・スリ入れ ができるようなシステムを考えると、NPC は全員 Inventory を持つことになりそう。
 * 
 * 
 * ### UI共通化について
 * 
 * "持ち物リスト" という画面を出すタイミングは、前述の Inventory を持ち得る Entity に共通すること。（モンスター能力は違うかもだけど）
 * 
 * Inventory の内容を表示する画面、という考えて作っておくと再利用いろいろできそう。
 * 
 * 
 * [2020/11/29] モンスターのアイテムドロップ
 * ----------
 * 
 * - 倒されたときのランダムアイテムドロップ
 * - 転ばされたときのランダムアイテムドロップ
 * - 倒されたときの固有アイテムドロップ (Mr.ブーン系など)
 * - ケンゴウ系能力によってはじかれた装備品
 * - マゼルン系おとす合成後アイテム
 * 
 * モンスターから出てくるアイテムはこれらのいずれか。
 * 例えば Mr.ブーン はケンゴウ系能力で装備品をはじかれた後は、倒されても草を落とさない。
 * 
 * 
 */

import { assert } from "ts/Common";
import { REResponse } from "ts/system/RECommand";
import { SCommandContext } from "ts/system/SCommandContext";
import { LEntityId } from "../LObject";
import { REGame } from "../REGame";
import { LEntity } from "../LEntity";
import { LBehavior } from "./LBehavior"

export class LInventoryBehavior extends LBehavior {
    private _entities: LEntityId[] = [];
    private _gold: number = 0;

    public entities(): LEntity[] {
        return this._entities.map(x => REGame.world.entity(x));
    }

    public addEntity(entity: LEntity) {
        assert(!entity.parentEntity());

        const id = entity.entityId();
        assert(this._entities.find(x => x.equals(id)) === undefined);
        this._entities.push(id);
        
        entity.setParent(this.ownerEntity());
    }

    public removeEntity(entity: LEntity) {
        assert(entity.parentEntity() == this.ownerEntity());

        const id = entity.entityId();
        const index = this._entities.findIndex(x => x.equals(id));
        assert(index >= 0);
        this._entities.splice(index, 1);
        
        entity.clearParent();
    }

    onRemoveEntityFromWhereabouts(context: SCommandContext, entity: LEntity): REResponse {
        const index = this._entities.findIndex(x => x.equals(entity.entityId()));
        if (index >= 0) {
            assert(entity.parentEntity() == this.ownerEntity());
            entity.clearParent();
            
            this._entities.splice(index, 1);
        }

        return REResponse.Pass;
    }
    
    // Game_Party.prototype.gold
    public gold(): number {
        return this._gold;
    }

    // Game_Party.prototype.gainGold
    public gainGold(amount: number): void {
        this._gold = (this._gold + amount).clamp(0, this.maxGold());
    }

    // Game_Party.prototype.loseGold
    public loseGold(amount: number): void {
        this.gainGold(-amount);
    }

    // Game_Party.prototype.maxGold
    public maxGold(): number {
        return 99999999;
    }
}

