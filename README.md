LN_RoguelikeEngine
==========

RPG ツクール MZ 用の、ターン性ローグライクシステムの開発リポジトリです。

いわゆる [不思議のダンジョンシリーズ](https://ja.wikipedia.org/wiki/%E4%B8%8D%E6%80%9D%E8%AD%B0%E3%81%AE%E3%83%80%E3%83%B3%E3%82%B8%E3%83%A7%E3%83%B3) のシステムで、[風来のシレン2](https://ja.wikipedia.org/wiki/%E4%B8%8D%E6%80%9D%E8%AD%B0%E3%81%AE%E3%83%80%E3%83%B3%E3%82%B8%E3%83%A7%E3%83%B3_%E9%A2%A8%E6%9D%A5%E3%81%AE%E3%82%B7%E3%83%AC%E3%83%B32_%E9%AC%BC%E8%A5%B2%E6%9D%A5!%E3%82%B7%E3%83%AC%E3%83%B3%E5%9F%8E!) あたりが最終目標です。

サンプルゲーム
----------

### 起動方法

`game.rmmzproject` を RPGツクールMZ で開き、テストプレイを実行してください。

### 操作方法 (ダンジョン内)

| キー | 動作 |
|---|---|
| 方向キー | 移動 |
| Z | 攻撃 |
| X | メニュー |
| Shift | 向き変更 |
| Shift+方向キー | ダッシュ |
| Shift+Z | 足踏み |
| W | 斜め移動モード |
s
拠点マップの操作は RPGツクール標準と同様です。


### ビルド実行

```
npm install
./build.ps1
```

### テスト

```sh
npm run test

# 個別実行
npm run test -- -t Basic1
```




```
./build.ps1
```

```
cloc ts --include-lang=TypeScript
```

```
pip install mkdocs
pip install mkdocs-material
mkdocs build
mkdocs serve
```

### ブラウザ上でデバッグ実行するには

```
code --install-extension msjsdiag.debugger-for-chrome
code --install-extension ruakr.vsc-nwjs
```

`F1` > `nwjs install` > `0.48.4`

用語整理
----------

### Entity

see RE_Game_Entity.

### Attribute



### Behavior

