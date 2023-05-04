
/**
 * 
 * [2021/9/26] モンスターのアイテムドロップ
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
 * ### 実装方針
 * 
 * まずインベントリと、アイテムドロップフラグというものを作っておく。
 * 
 * 倒されたとき…
 * - インベントリにアイテムがある場合、アイテムドロップフラグは考慮せずに、そのアイテムを落とす。
 * - 転んだ・弾かれたなどで UnitEntity が何かアイテムを生成した場合、アイテムドロップフラグをON.
 * - アイテムドロップフラグがONの場合、倒されてもアイテムを落とさない。
 * - 倒されたときにアイテムドロップフラグが OFF の場合、アイテムドロップ処理を開始する。
 *   - 固有アイテムがあれば落とす。
 *   - なければ、フロアの「てきがおとすもの」テーブルに従いドロップする。
 * 
 * 
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
 * 
 * [2021/7/8] アイテムのスタック
 * ----------
 * ### スタックできるもの
 * - 矢弾
 * - 札
 * 種別として固定しない方がいいかも。
 * 
 * ### スタックできる基準
 * elona だと、呪われていたりすると別スタック。
 * シレンだと、統合先の状態に合わせてスタックできる。
 * - つまり、スタックの条件はタイトルによって異なる。
 * 
 * また、アイテムの種類ではなくインベントリの種類によっても異なるので注意。
 * - 壺インベントリの場合はスタックしない
 * 
 * ### スタック数と使用回数は別物？
 * elona 的には別物。
 * こっちでも別物扱いの方がいいだろう。使用回数[0]はスタック0ではない。
 * スタック0はそもそも存在しないことを示す。
 * 
 * ### スタックするタイミングは？
 * 少なくとも、インベントリに入ったタイミングではない。
 * [交換] では矢やお金はスタックされない。
 * 
 */

import { assert, MRSerializable, tr2 } from "ts/mr/Common";
import { LEntityId } from "../LObject";
import { MRLively } from "../MRLively";
import { LEntity } from "./LEntity";
import { LBehavior, LNameView, SRejectionInfo } from "../behaviors/LBehavior"
import { SCommandContext } from "ts/mr/system/SCommandContext";
import { SCommand, SCommandResponse, STestAddItemCommand } from "ts/mr/system/SCommand";
import { MRBasics } from "ts/mr/data/MRBasics";
import { MRSystem } from "ts/mr/system/MRSystem";
import { ItemRemovedFromInventoryArgs } from "ts/mr/data/predefineds/DBasicEvents";
import { paramDefaultStorageLimit, paramDestroyOverflowingItems, paramInventoryCapacity, paramSandboxWorldSystem } from "ts/mr/PluginParameters";
import { DBehaviorProps } from "ts/mr/data/DBehavior";
import { SSubTaskChain, STaskYieldResult } from "ts/mr/system/tasks/STask";
import { UName } from "ts/mr/utility/UName";
//import { TDrop } from "ts/mr/transactions/TDrop";

@MRSerializable
export class LInventoryBehavior extends LBehavior {
    private _items: LEntityId[];
    private _gold: number;
    private _capacity: number;
    private _storage: boolean;

    public constructor() {
        super();
        this._items = [];
        this._gold = 0;
        this._capacity = paramSandboxWorldSystem ? 999 : paramInventoryCapacity;
        this._storage = false;
    }

    public get entities(): LEntityId[] {
        return this._items;
    }

    public set entities(value: LEntityId[]) {
        this._items = value;
    }

    public get capacity(): number {
        return this._capacity;
    }

    public set capacity(value: number) {
        this._capacity = value;
    }

    public get itemCount(): number {
        return this._items.length;
    }

    public get remaining(): number {
        return this._capacity - this._items.length;
    }

    public get isFully(): boolean {
        return this._items.length >= this._capacity;
    }

    public get isStorage(): boolean {
        return this._storage;
    }

    public hasAnyItem(): boolean {
        return this._items.length > 0;
    }

    public get items(): LEntity[] {
        return this._items.map(x => MRLively.world.entity(x));
    }

    override onInitialized(self: LEntity, props: DBehaviorProps): void {
        if (props.code == "Inventory") {
            this.capacity = MRLively.world.random().nextIntWithMinMax(props.minCapacity, props.maxCapacity + 1);
            this._storage = props.storage;
        }
    }

    override onQueryNameView(self: LEntity, nameView: LNameView): void {
        if (this._storage) {
            nameView.capacity = this.capacity - this._items.length;
        }
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LInventoryBehavior);
        // Item のディープコピーはやめてみる。
        // 盗み能力を持つ敵にわざとアイテムを盗ませて分裂の杖を振ればアイテム増殖ができてしまうことになる。
        b._items = [];
        b._gold = this._gold;
        return b
    }
 
    /** [ScriptCommandAPI] */
    public clearItems(): void {
        const items = this.items;
        for (let i = items.length - 1; i >= 0; i--) {
            items[i].removeFromParent();
        }
    }
    

    public reset(): void {
        // destroy items
        for (const entity of this.items) {
            assert(entity.parentObject() == this);
            entity.clearParent();
            entity.destroy();
        }
        this._items.splice(0);

        this._gold = 0;
    }

    public resetCapacity(newCapacity: number): void {
    //     // あふれる分は削除する
    //     if (newCapacity < this._capacity) {
    //         const items = this.items;
    //         const removeItems = [];
    //         for (let i = items.length - 1; i >= newCapacity; i--) {
    //             removeItems.push(items[i]);
    //         }
    //         for (const item of removeItems) {
    //             if (paramDestroyOverflowingItems) {
    //                 item.removeFromParent();
    //                 item.destroy();
    //             }
    //             else {
    //                 //TDrop.dropOrDestroyEntityForce(cctx, item, mx, my);
    //             }
    //         }
    //     }

        // 消える分のアイテムはあらかじめ呼び出し側で処理しておくこと。
        assert(newCapacity >= this._items.length);

        this._capacity =  newCapacity.clamp(0, paramDefaultStorageLimit);
    }

    public iterateItems(func : ((item: LEntity) => void) | ((item: LEntity) => boolean)): void {
        for (const id of this._items) {
            const r = func(MRLively.world.entity(id));
            if (r === false) break;
        }
    } 

    public contains(entity: LEntity): boolean {
        return this._items.findIndex(x => x.equals(entity.entityId())) >= 0;
    }

    public addEntity(entity: LEntity) {
        assert(!entity.parentEntity());
        assert(!entity.isDestroyed());
        assert(!this.isFully);

        const id = entity.entityId();
        assert(this._items.find(x => x.equals(id)) === undefined);
        this._items.push(id);
        
        entity.setParent(this);
    }

    public canAddEntityWithStacking(item: LEntity): boolean {
        if (item.hasTrait(MRBasics.traits.Stackable)) {
            // スタック可能なアイテムを追加しようとしているなら、同種があるかどうかをチェックする。
            const targetItem = this.items.find(x => x.checkStackable(item));
            if (targetItem) {
                return true;
                // const remaining = paramMaxEntityStackCount - targetItem._stackCount;
                // if (item._stackCount <= remaining) {
                //     return true;
                // }
            }
        }

        return !this.isFully;
    }

    public addEntityWithStacking(entity: LEntity): void {
        assert(!entity.parentEntity());

        for (const item of this.items) {
            if (item.checkStackable(entity)) {
                item.increaseStack(entity);
                return;
            }
        }

        assert(!this.isFully);
        this.addEntity(entity);
    }

    public removeEntity(entity: LEntity): void {
        assert(entity.parentObject() == this);

        const id = entity.entityId();
        const index = this._items.findIndex(x => x.equals(id));
        assert(index >= 0);
        this._items.splice(index, 1);
        
        entity.clearParent();
        
        // TODO: onRemoveChild と統合したほうがいいかも。
        const args: ItemRemovedFromInventoryArgs = { item: entity };
        MRLively.eventServer.publish(MRSystem.commandContext, MRBasics.events.itemRemovedFromInventory, args);
    }


    onRemoveChild(entity: LEntity): void {
        if (this._items.mutableRemove(x => x.equals(entity.entityId()))) {
            entity.clearParent();

            
            const args: ItemRemovedFromInventoryArgs = { item: entity };
            MRLively.eventServer.publish(MRSystem.commandContext, MRBasics.events.itemRemovedFromInventory, args);
        }
    }

    onCollectTraits(self: LEntity, result: IDataTrait[]): void {
        super.onCollectTraits(self, result);
        this.iterateItems(item => {
            result.pushArray(item.data.charmedTraits());
        });
    }

    onCollectCharmdBehaviors(self: LEntity, result: LBehavior[]): void {
        this.iterateItems(item => {
            item.iterateBehaviorsReverse(b => {
                if (b.isCharmBehavior()) {
                    result.push(b);
                }
            })
        });
    }

    onPreviewRejection(self: LEntity, cctx: SCommandContext, rejection: SRejectionInfo): SCommandResponse {
        let result = true;
        this.iterateItems(item => {
            if (item.data.isTraitCharmItem) {
                if (!item.previewRejection(cctx, rejection)) {
                    result = false;
                    return false;
                }
            }
            return true;
        });
        if (!result) return SCommandResponse.Canceled;
        
        return SCommandResponse.Pass;
    }
    
    override *onCommand(self: LEntity, cctx: SCommandContext, cmd: SCommand): Generator<STaskYieldResult> {
        if (cmd instanceof STestAddItemCommand) {
            // 壺の中に壺は入れられない。
            if (this._storage && cmd.item.hasTrait(MRBasics.traits.DisallowIntoStorage)) {
                cctx.postMessage(tr2("%1を入れることはできない。").format(UName.makeNameAsItem(cmd.item)));
                return;
            }

            if (!this.isFully) {
                yield STaskYieldResult.Accept;
            }
        }
    }

    // onPreviewEffectRejection(cctx: SCommandContext, self: LEntity, effect: DEffect): SCommandResponse {
        
    //     let result = true;
    //     this.iterateItems(item => {
    //         if (item.data().isTraitCharmItem) {
    //             if (!item.previewEffectBehaviorRejection(context, effect)) {
    //                 result = false;
    //                 return false;
    //             }
    //         }
    //         return true;
    //     });
    //     if (!result) return SCommandResponse.Canceled;
        
    //     return SCommandResponse.Pass;
    // }

    // onPreviewEffectBehaviorRejection(cctx: SCommandContext, self: LEntity, id: DEffectBehaviorId): SCommandResponse {
        
    //     let result = true;
    //     this.iterateItems(item => {
    //         if (item.data().isTraitCharmItem) {
    //             if (!item.previewEffectBehaviorReaction(context, id)) {
    //                 result = false;
    //                 return false;
    //             }
    //         }
    //         return true;
    //     });
    //     if (!result) return SCommandResponse.Canceled;
        
    //     return SCommandResponse.Pass;
    // }
    /*
    onRemoveEntityFromWhereabouts(cctx: SCommandContext, entity: LEntity): REResponse {
        const index = this._entities.findIndex(x => x.equals(entity.entityId()));
        if (index >= 0) {
            assert(entity.parentEntity() == this.ownerEntity());
            entity.clearParent();
            
            this._entities.splice(index, 1);
        }

        return REResponse.Pass;
    }
    */
    
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

