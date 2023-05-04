import { MRData } from "ts/mr/data/MRData";
import { MRLively } from "../MRLively";
import { LBehavior } from "ts/mr/lively/behaviors/LBehavior";
import { LEntity, LParamChangedAction } from "../entity/LEntity";
import { MRBasics } from "ts/mr/data/MRBasics";
import { DParameterId } from "ts/mr/data/DCommon";
import { DClass } from "ts/mr/data/DClass";
import { DActor } from "ts/mr/data/DActor";
import { assert, MRSerializable } from "ts/mr/Common";
import { LParamEffectResult } from "../LEffectResult";
import { DValuePoint } from "ts/mr/data/DEffect";

@MRSerializable
export class LExperienceBehavior extends LBehavior {

    /*
    [2021/12/14] レベルと経験値はパラメータ扱いしたほうがよい？
    ----------
    パラメータ扱いしておくと、レベルダウンや経験値取得の効果をパラメータダメージとして指定できるようになる。
    レベル吸収とかも。

    バフああんまりつけたくないかも？
    一時的にレベルアップ・レベルダウンといった効果は確かに原作でもあるが…。
    でも本当にそれらを実装するとなったら、バフ扱いの方が都合がよい。

    Enemy,Actor というくくりにするよりは、
    "経験値でレベルアップするBehavior", "経験値関係なくレベルアップするBehavior" に分ける方が自然かも。
    そう考えると、Levelのバフは欲しいかもだけどExpのバフはさすがにいらないかも？
    いやでも経験値ダメージはありえるか…。

    トルネコでは、モンスターも経験値テーブルを持つ。
    http://gamemonster.futene.net/wonder-dungeon/wd_torneko1.html
    進化はしない。

    Level, Exp のほかに、Evolution というパラメータを持たせたらどうだろうか。
    進化レベル。普通の Level とは独立。
    こうしておくと、
    - シレン2の仲間システムが実現しやすい。
    - トルネコ仕様の時は Evolution を使わなければよい。
    基本的な考え方はポケモンと同様。
    Entity は "次に進化する Entity" をデータとして持っておく。
    対応 Level が設定されていれば、レベルアップに伴い Evolution も上昇。それによって ChangeInstance する。

    しあわせ草や天使の種の実装は… 条件付き効果を使う？
    → やめたほうがいいかも。特にシレン2では Ev が上がるのか Lv が上がるのかは勢力に依る。
       しあわせの杖も同様。
    できれば エディタから設定するのは
    - Lv を増減
    - Exp を増減
    - (Ev を増減)
    だけにして、Behavior 側でなんとか解釈を変えたいところ。

    でも解釈を変えるっていうのは、例えば地雷による即死効果を分けた理由と衝突しそう。
    そちらは、Enemy が "爆発" という効果を知らなければならないのは不自然だろう、という背景がある。

    原作効果を整理すると…
    - しあわせ草・天使の種
        - Player: Lv アップ
        - Monster: Ev アップ
        - NPC: なにもおこらない
        - 店主: Lv アップ
        - Friend: Lv アップ または なにもおこらない (仲間によってはイベントや特定アイテムでレベルアップとかある)
        - Friend Monster: Lv アップ (ギャザー系は無効化)
    - しあわせの杖
        - Player: 経験値取得
        - Player 以外: しあわせ草と同様
    - 不幸の杖
        - Player: Lv3 ダウン
        - Monster: Ev1 ダウン
    - くねくね
        - Player: Lv1 ダウン
        - Monster: Ev1 ダウン
    - 教皇
        - Player: 一時的にレベル半分
        - Monster: Ev1 ダウン
    仲間のレベル仕様が注意点か。どのみち Behavior 側での制御が必要になる。
    モンスターは勢力に依る点があるので、Trait ではカバーできない。これも Behavior の実装が必要。

    Behavior の実装は次のどちらかになる。
    A. パラメータの変化直前に、変化対象を変換する。
    B. "レベル操作" という一段抽象的な効果として受け取り、self の性質に応じて変化するパラメータを決める。

    A は要注意。今回のようなレベルアップ効果以外にも、イベントや経験値によるレベルアップなど、
    何も対策しないと、特殊扱いしたくないケースでも同様になってしまう。
    → 結局 "アイテムやスキルの効果として" という情報の追加が必要。

    アイテム側の設定として上記のようなのをカバーしきるのはかなり難しい。
    プログラムの実装もそうだが、作ったとしてもレベル・経験値変化系のアイテム全てに個別設定しなければならない。ミスしやすかったりメンテしづらくなる。
    アイテム側からは基本的に Player 主観で、
    - レベルを 1 上げる
    - 経験値を 500 得る
    といった設定だけすればよいようにしたい。

    そうするとやはり EffectContext → Entity へ パラメータを設定する間をフックして処理を変えられるような Behavior のメソッドが要るだろう。
    ただし、経験値の取得は EffectContext を出てから行われるため、必ずしも EffectContext 内から、というわけではない。


    [2021/12/16] 違和感
    ----------
    - 他のパラメータは減算方式で、デフォルトは Ideal.
    - レベルを上げるためのパラメータ計算方式が "回復"
        - でもこれはちからの最大値を上げるのも同様。


    [2022/8/31] 依存パラメータという考えはどうだろうか？
    ----------
    Lv は Exp の依存パラメータと考える。
    Lv という値は保持せず、常に Exp から計算される。
    LevelUp/Down 効果は Level という依存パラメータに対して行われるが、実体は Exp の増減となる。
    (これは Elona の各種スキルが、魅力などのパラメータに影響してくる動作と同じ)
    この考え方を取ると、Lv というパラメータを持たないので、2つのパラメータの同期に関する問題がなくなる。

    Exp がどのように Level に影響するかは Behavior 側で決めることになるため、
    キホンは Lv と Exp の関係を Behavior で定義することになる。
    Behavior が依存パラメータの増減要求を受け取り、影響するパラメータの変更を行う。
    （それは上記の通り Exp かもしれないし、Lv を持たなければ効果が無いし、モンスターの場合はランクダウンかもしれない）

    [22/10/19] 依存パラメータLevel と Exp と依存パラメータへのバフ
    ----------
    「一時的にレベルを下げる」系のスキルを実装できるだろうか？

    まず思いつくのは Level に対するバフである。これの実現自体は簡単。
    問題は、その時点で Exp とどう連携するか。

    もし NextExp を Level の ActualValue から計算すると、デバフを食らったときに普通は 現在Exp>NextExp となってしまう。
    冪等性を重視する場合、この状態を維持することはできず、即レベルアップを繰り返し、デバフ中にもかかわらずレベルが上がってしまう。

    Levelを依存パラメータにする/しないに関わらず、 Exp は Leven の IdealValue から計算する必要があり、
    LevelUp/Down は Damage として表現するのではなく、最大値(IdealBase or IdealPlus)の変更として扱う必要がある。

    [22/10/19] Level は依存パラメータにしちゃダメかも
    ----------
    Expを持たない、モンスターのレベルが表現できなくなる。
    ダミー的な ExpParam を持たせてもいいが、そんな用途の余計な情報は出来るだけ持たせたくない。




    */

    // Level は依存パラメータであり、 Exp に応じて常に変化するため「前回値」が必要な時は別途持っておく必要がある。
    //private _currentLevel: number;

    constructor() {
        super();
        //this._currentLevel = 0;
    }

    public clone(newOwner: LEntity): LBehavior {
        const b = MRLively.world.spawn(LExperienceBehavior);
        return b;
    }

    onAttached(self: LEntity): void {
        const params = self.params;
        params.acquireParam(MRBasics.params.level);
        params.acquireParam(MRBasics.params.exp);
        this.resetLevel(self);
    }

    onResetStatus(self: LEntity): void {
        this.resetLevel(self);
    }

    override onParamIdealPlusChanged(self: LEntity, paramId: DParameterId, newValue: number, oldValue: number): void {
        if (paramId == MRBasics.params.level) {
            this.refreshExpFromLevel(self, newValue, oldValue);
        }
        else if (paramId == MRBasics.params.exp) {
            throw new Error("Unreachable.");
        }
    }

    override onParamChanged(self: LEntity, paramId: DParameterId, newValue: number, oldValue: number): void {
        if (paramId == MRBasics.params.level) {
            //throw new Error("Unreachable.");
        }
        else if (paramId == MRBasics.params.exp) {
            this.refreshLevelFromExp(self, newValue, oldValue);
        }
    }

    // override onGetDependentParameterIdealBaseValue(self: LEntity, parameterId: DParameterId): number | undefined {
    //     if (parameterId == MRBasics.params.level) {
    //         return this._currentLevel;
    //     }
    //     return undefined;
    // }

    // override onSetDependentParameterIdealBaseValue(self: LEntity, parameterId: DParameterId, value: number): void {
    //     if (parameterId == MRBasics.params.level) {
    //         // Level -> Exp へ Backword.
    //         self.setParamCurrentValue(MRBasics.params.exp, this.expForLevel(self, value));
    //     }
    // }
    
    onRefreshConditions(self: LEntity): void {
        
    }

    private resetLevel(self: LEntity): void {
        //this._currentLevel = this.actor(self).initialLevel;
        this.setLevel(self, this.actor(self).initialLevel);
    }

    public level(self: LEntity): number {
        return self.getEffortValue(MRBasics.params.level);
    }

    // Game_Actor.prototype.currentExp
    public currentExp(self: LEntity): number {
        return self.getActualParam(MRBasics.params.exp);
    }

    // public maxLevel(self: LEntity): number {
    //     return this.actor(self).maxLevel;
    // }

    // for test
    public setLevel(self: LEntity, value: number): void {
        value = value.clamp(1, this.maxLevel(self));
        self.setEffortValue(MRBasics.params.level, value);
        //self.setParamCurrentValue(MRBasics.params.level, value);
    }

    private gainLevel(self: LEntity, value: number): void {
        self.setEffortValue(MRBasics.params.level, self.getEffortValue(MRBasics.params.level) + value, LParamChangedAction.None);
        //self.gainActualParam(MRBasics.params.level, value, false);
    }
    
    // Game_Actor.prototype.changeLevel = function(level, show) {
    //     this.changeExp(this.expForLevel(level), show);
    // };
    
    // Game_Actor.prototype.nextLevelExp
    public nextLevelExp(self: LEntity): number {
        return this.expForLevel(self, this.level(self) + 1);
    }

    // Game_Actor.prototype.actor
    private actor(self: LEntity): DActor {
        const data = self.data.actor;
        assert(data);
        return data;
    }

    // Game_Actor.prototype.maxLevel
    private maxLevel(self: LEntity): number {
        return this.actor(self).maxLevel;
    };

    // Game_Actor.prototype.isMaxLevel
    private isMaxLevel(self: LEntity): boolean {
        return this.level(self) >= this.maxLevel(self);
    };

    private currentClass(self: LEntity): DClass {
        const classId = self.data.classId;
        return MRData.classes[classId];
    }
    
    // Game_Actor.prototype.expForLevel
    public expForLevel(self: LEntity, level: number): number {
        const c = this.currentClass(self);
        const basis = c.expParams[0];
        const extra = c.expParams[1];
        const acc_a = c.expParams[2];
        const acc_b = c.expParams[3];
        return Math.round(
            (basis * Math.pow(level - 1, 0.9 + acc_a / 250) * level * (level + 1)) /
                (6 + Math.pow(level, 2) / 50 / acc_b) +
                (level - 1) * extra
        );
    }

    // Game_Actor.prototype.currentLevelExp
    private currentLevelExp(self: LEntity): number {
        return this.expForLevel(self, this.level(self));
    }

    public setExp(self: LEntity, value: number): void {
        self.setParamCurrentValue(MRBasics.params.exp, value);
    }

    private refreshExpFromLevel(self: LEntity, newLevel: number, oldLevel: number): void {
        //this._currentLevel = newLevel;
        this.setExp(self, this.expForLevel(self, newLevel));
    }

    // 現在 Exp に Level をあわせる
    private refreshLevelFromExp(self: LEntity, newExp: number, oldExp: number): void {
        if (newExp == oldExp) return;

        // 検証。 _lastLevel は常に exp の変動とともに更新されていなければならない。
        // {
        //     const e1 = this.expForLevel(self, this._currentLevel);
        //     const e2 = this.expForLevel(self, this._currentLevel + 1);
        //     assert(e1 <= oldExp && oldExp < e2);
        // }

        //const oldLevel = this._currentLevel;
        // if (newExp > oldExp) {
        //     // LevelUp
        //     while (this._currentLevel < this.maxLevel(self) && newExp >= this.expForLevel(self, this._currentLevel + 1)) {
        //         this._currentLevel++;
        //         this.onLevelUp(self/*, oldLevel*/);
        //     }
        // }
        // else {
        //     // LevelDown
        //     while (newExp < this.expForLevel(self, this._currentLevel)) {
        //         this._currentLevel--;
        //         this.onLevelUp(self/*, oldLevel*/);
        //     }
        // }


        // const lastLevel = oldLevel;
        while (!this.isMaxLevel(self) && newExp >= this.nextLevelExp(self)) {
            this.onLevelUp(self/*, oldLevel*/);
        }
        while (newExp < this.currentLevelExp(self)) {
            this.onLevelDown(self/*, oldLevel*/);
        }
    }

    // Game_Actor.prototype.levelUp
    private onLevelUp(self: LEntity/*, oldLevel: number*/): void {
        // const oldValue = self.actualParam(MRBasics.params.level);
        this.gainLevel(self, 1);
        //this.ownerEntity()._effectResult.levelup = true;

        const result = this.ownerEntity()._effectResult;
        const paramResult = new LParamEffectResult(MRBasics.params.level);
        paramResult.applyTarget = DValuePoint.Growth;
        paramResult.damage = -1;
        //paramResult.oldValue = oldLevel;
        result.paramEffects2.push(paramResult);
        result._revision++;

        //for (const learning of this.currentClass().learnings) {
        //    if (learning.level === this._level) {
        //        this.learnSkill(learning.skillId);
        //    }
        //}
    }

    // Game_Actor.prototype.levelDown
    private onLevelDown(self: LEntity/*, oldLevel: number*/): void {
        this.gainLevel(self, -1);
        // this.ownerEntity()._effectResult.leveldown = true;
        // this.ownerEntity()._effectResult._revision++;
    }

    // private changeLevel(self: LEntity, value: number, keepExpWhenDown: boolean): void {
    //     const level = this.level(self);
    //     if (value > level) {          // LevelUp
    //         this.changeExp(this.expForLevel(value));
    //     }
    //     else if (value < level) {     // LevelDown
    //         if (keepExpWhenDown) {
    //             this.changeExp(this.expForLevel(value + 1) - 1);
    //         }
    //         else {
    //             this.changeExp(this.expForLevel(value));
    //         }
    //     }
    // }
}

