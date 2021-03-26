

export interface DBasicActions
{
    //----------------------------------------
    // Standard Actions.

    /**
     * 拾おうとしている・拾われようとしている・拾う・拾われた
     * 
     * 壺に入れるのか、矢束に混ぜるのかなどの判断が必要になることがあるため、インベントリへの追加は actor が行う。
     */
    PickActionId: number;

    /**
     * 置こうとしている・置かれようとしている・置く・置かれた
     * 
     * Entity を Map に配置するのは actor 側にしてみる。(「撃つ」と同じ)
     * reactor 側で土偶オブジェクト化などが必要であれば、配置された状態から処理を始めることになる。
     */
    PutActionId: number;

    /** 
     * 交換
     * 
     * [拾う][置く] とは区別する。お金を拾うとき、シレン5などでは [拾う] では所持金に加算されるが、[交換] ではアイテムと交換できる。
     * (SFC シレンではそうではないようだが http://twist.jpn.org/sfcsiren/index.php?%E3%82%AE%E3%82%BF%E3%83%B3%E6%8A%95%E3%81%92)
     */
    ExchangeActionId: number;
    
    /**
     * 投げる
     */
    ThrowActionId: number;
    
    /**
     * 放り投げる
     */
    FlungActionId: number;

    /**
     * 撃つ
     * 
     * 矢束の数を減らすなど、単なる「投げる」とは異なるので分ける必要がある。
     * 
     * Projectile を作る必要があるが、そうしないと reactor は存在しないので、
     * 矢Entity のインスタンス化は actor 側で行う。
     * 
     * インスタンス化された Entity は actor と同じブロックに配置され、例えば矢であればそこから 10回 移動する。
     */
    ShootingActionId: number;
    
    /**
     * 衝突しようとしている・衝突されようとしている・衝突する・衝突された
     * 
     * 投げられたり撃たれた Projectile が、他の Entity にヒットしたとき。
     * 
     * 草を投げ当てた時の効果発動とは分けている点に注意。
     * 例えば投げ与えられた装備品を装備する仲間キャラなどは、この Command をハンドリングする。
     * はね返しの盾なども同様。
     */
    CollideActionId: number;

    /** 
     * 効果を与えようとしている・効果を与えられようとしている・効果を与える・効果を与えられた
     * 
     * 投げ当てた草等が実際に効果を発動するとき。
     * 命中判定などは済んだ後で発行されるコマンドなので、これをそのまま攻撃とみなして使うことはできないので注意。
     * 
     * 投げ当てた時と飲んだ時で効果が違うアイテムがあるので、その場合は EffectContext も参照する必要がある。
     */
    AffectActionId: number;

    /**
     * 転がす
     *
     * いまのところ大砲の弾専用。
     * 大砲の弾は投げることもできるし (ウルロイド)、撃ったり (オヤジ戦車) 吹き飛ばすこともできる (杖)。転がっている間はワナが起動する。
     * これらとは原因アクションを区別するために、「転がす」が必要となる。
     */
    RollActionId: number;
    
    /**
     * 落ちようとしている・落ちられようとしている・落ちる・落ちられた
     *
     * actor: Projectile(矢) 等
     * reactor: Tile, Trap 等
     *
     * Projectile が地面に落ちるときや、モンスターに投げられたときなど。
     * 落下先の同一レイヤーに Entity がある場合は周囲に落ちる。落ちるところが無ければ消滅する。
     * 
     * Trap に落下することもある。地雷や落とし穴であれば、周囲に落下はせず、ダメージを受けたり消滅する。
     * Trap に落下したときの Sequel 順序は 落下 > 起動音&発動中表示 > アイテム床へ落下 > ワナ効果発動
     * 
     */
    FallActionId: number;

    /**
     * 落ちようとしている・落ちられようとしている・落ちる・落ちられた
     *
     * actor: Projectile(矢) 等
     * reactor: Tile 等
     * 
     * [Fall] と比べてこちらは Unit がアイテムをドロップした時の Action。
     * また、[Fall] で罠の上に落ちたアイテムが、さらに周囲の空いている Block へ落ちるときにも使用する。
     * 周辺がアイテムだらけでスペースがない場合は消滅する。
     */
    DropActionId: number;

    /** 踏む */
    StepOnActionId: number;

    /** 捨てる */
    TrashActionId: number;

    // TODO: ↓このあたりは言葉がちがうだけでやることは同じなので、グループ化できるようにしてみたい
    /** 進む */
    ProceedFloorActionId: number;
    /** 降りる */
    //StairsDownActionId: number;
    /** 登る */
    //StairsUpActionId: number;

    //----------------------------------------
    // Item Actions.
    
    /**
     * 装備しようとしている・装備されようとしている・装備する・装備された
     *
     */
    EquipActionId: number;

    /**
     * (装備を)外そうとしている・外されようとしている・外す・外された
     *
     * 呪いのため外せないチェックは reactor(武器Entity) 側で行う。
     */
    EquipOffActionId: number;

    /** 食べる */
    EatActionId: number;

    /** 飲む (UI 表示名区別のため、[食べる] とは別定義。効果は同一でよさそう) */
    TakeActionId: number;
    
    /** かじる (UI 表示名区別のため、[食べる] とは別定義。効果は同一でよさそう) */
    BiteActionId: number;

    /** [43] 読む */
    ReadActionId: number;

    /** [44] 振る */
    WaveActionId: number;

    /** [45] 押す */
    PushActionId: number;

    /** [46] 入れる */
    PutInActionId: number;

    /** [47] 出す ※「みる（のぞく）」は Window 遷移のための UI アクションなので、CommandType ではない */
    PickOutActionId: number;
    
    /**
     * 識別する
     * 
     * 巻物や草を使ったとき、手封じの壺を使ったとき、拾ったときなど、状況に応じて識別が発生するタイミングは多くあるため、
     * 必要な時に識別できるように Command 化しておく。
     */
    IdentifyActionId: number;

    /**
     * アイテムを渡す
     */
    //passItem: number;

    //----------------------------------------
    // Combat Actions.

    
    AttackActionId: number; // TODO: deprecated
}

