ビルド・テスト手順
==========

開発用ビルド
----------

```
./build.ps1
```

ビルドが完了すると、 `js/plugins/LN_MysteryRogueSystem.js` が生成されます。このファイルにはデバッグ情報が含まれているため、配布には注意してください。公開用のビルド方法は後述します。

### build.ps1 と package.json

Web系開発では package.json に必要なライブラリやビルドコマンドを記述することが一般的ですが、
RPGツクールMZ はプロジェクト保存時にこのファイルを上書きしてしまうため、本プラグインの開発に必要な情報が消えてしまいます。

そのため必要な情報は `plugin-package.json` に記述し、ビルド時にこのファイルを `package.json` へ上書きして使うことで、ビルドを実行できるようにしています。

`build.ps1` この上書きコピーとビルドコマンドの実行を行うためのファイルです。

ユニットテスト
----------

実行する前に、 RPGツクールMZ によって `package.json` が上書きされていないことを確認してください。
`build.ps1` の直後に実行するのが確実です。

```sh
# 全体実行
npm run test

# 個別実行
npm run test -- -t Basic1

# カバレッジ情報の出力
npm run test  -- --coverage
```

マニュアルのビルド・確認方法
----------

### 準備

```
pip install poetry
```

### ビルド・起動

```
poetry install
poetry run mkdocs build
poetry run mkdocs serve
```



コードメトリクスの出力
----------

```sh
cloc ts --include-lang=TypeScript
```

公開用ビルド・型定義ファイルの作成
----------

```
./build.ps1
npm run release
```

- `js/plugins/LN_MysteryRogueSystem.js` に、公開用のプラグインが生成されます。
- `data/mr/LN_MysteryRogueSystem.d.ts` に、設定スクリプト用の型定義ファイルが生成されます。

