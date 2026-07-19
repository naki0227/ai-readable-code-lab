# AIはどんな設計を変更しやすいのか？3構成・54 Runで比較してみた

> 下書き。公開前に著者情報、図の説明、代表差分へのリンクを確認する。

## 結論

この小規模TypeScript/Fastifyアプリでの54 Runでは、完全検証通過率は monolithic が83.3%、feature-based が72.2%、layered が66.7%だった。一方、実装能力に近い隠しテスト通過率は monolithic と layered が100%、feature-based が88.9%だった。

monolithicでは必要な情報が近くに集約され、小規模変更の探索範囲が狭かったことが有利に働いた可能性がある。一方layeredは変更対象ファイルが増えるため完全検証率は下がったが、隠しテストは全Runで通過している。つまり、設計理解そのものよりも、最後の整形・複数ファイル変更が開発品質のゲートで失敗につながった可能性がある。

ただし、この結果だけで「単一ファイル構成がAIに最適」とは結論づけない。Task 05には共有公開契約と課題仕様の不整合があり、完全検証通過率を押し下げている。また、各条件は3回ずつであり、モデルやプロンプト、課題の難度による影響を完全には分離できない。

![Phase 1 validation rates](../../results/summaries/main-experiment-validation-rates.svg)

## 先に見るべき2つの指標

この記事では、次の2軸を分けて扱う。

| 指標     | 意味                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| 実装能力 | 隠しテスト通過率。公開されていない課題要件まで実装できたか。                             |
| 開発品質 | 完全検証通過率。build、typecheck、format、lint、公開テスト、隠しテストをすべて通したか。 |

この区別がないと、整形だけで落ちたRunと要件を実装できなかったRunを同じ失敗として扱ってしまう。

## なぜ検証したのか

人間にとって保守しやすい分割が、AIが既存コードを探索し、変更し、テストまで通す際にも有利なのかを確かめたかった。比較したのは、同じタスクAPIを異なる構成で実装した次の3条件である。

| 構成          | 特徴                                       |
| ------------- | ------------------------------------------ |
| monolithic    | 主要な処理を1ファイルに集約                |
| layered       | domain / repository / service / HTTPを分離 |
| feature-based | task機能単位に実装を集約                   |

仕様、課題、Baseline、隠しテスト、評価手順は実験前に固定した。詳細は[プロジェクト計画書](../PROJECT_PLAN.md)、[実験プロトコル](../EXPERIMENT_PROTOCOL.md)、[評価基準](../EVALUATION_RULES.md)を参照してほしい。

## 実験方法

3構成 × 6課題 × 各3回、合計54 Runを実行した。Runnerは対象コードと公開情報だけを扱い、Evaluatorは別cloneで公開検証と隠しテストを実施した。各RunではGit差分、評価JSON、公開・隠しテストの結果を保存し、GitHub PRとして公開している。

完全検証通過は、build・typecheck・format・lint・公開テスト・隠しテストがすべて通ったRunと定義した。

## 結果を読む前の注意: Task 05は主たる設計比較から分離する

Task 05では、共有公開契約がDELETEの204応答を期待していたのに対し、課題仕様は200と`ARCHIVED`応答を要求していた。この契約不整合により6 Runが公開検証で失敗した。

これはAIの変更品質ではなく評価条件の競合である。以降の構成比較では、Task 05の公開テスト失敗をそのまま設計差として解釈しない。

## 結果

| 構成          |  完全検証通過 | 隠しテスト通過 | 平均変更ファイル数 |
| ------------- | ------------: | -------------: | -----------------: |
| monolithic    | 15/18 (83.3%) |   18/18 (100%) |               2.28 |
| feature-based | 13/18 (72.2%) |  16/18 (88.9%) |               3.11 |
| layered       | 12/18 (66.7%) |   18/18 (100%) |               4.06 |

Task 02とTask 03は9 Runすべてが完全検証を通過した。Task 06は変更量が最も大きく、平均108.2行の追加が必要だった。さらにfeature-basedのTask 06 Run 01では、重複ルート登録と型エラーにより隠しテストにも失敗した。このRunは失敗例として改変せず残している。

![Average changed files](../../results/summaries/main-experiment-change-scope.svg)

平均変更ファイル数は、厳密な探索時間ではない。しかし、layeredで平均4.06ファイル、feature-basedで3.11ファイル、monolithicで2.28ファイルとなり、構成ごとの変更範囲の違いを示す補助指標にはなる。

## 成功例と失敗例

成功例として、Task 03（変更履歴追加）は全構成・全Runで完全検証を通過した。既存の責務分離に沿って、イベントの保存、取得、HTTP応答を小さく追加できたことが共通点だった。

代表例は[layered / Task 03 / Run 01のPR](https://github.com/naki0227/ai-readable-code-lab/pull/67)で確認できる。差分では、履歴の型をdomainへ、保存をrepositoryへ、イベント記録をserviceへ、HTTP endpointをappへ配置している。

```diff
+ app.get('/tasks/:id/history', ...)
+ export type TaskHistoryItem = { id; taskId; action; createdAt }
+ repository.saveHistory(...)
+ service.recordHistory(task.id, 'CREATED', time)
```

この例で失敗しなかった理由は、既存の依存方向と命名に沿って追加箇所を判断でき、HTTP処理・ユースケース・永続化の責務が混ざらなかったためだと考えられる。

失敗例として、[feature-based / Task 06 / Run 01のPR](https://github.com/naki0227/ai-readable-code-lab/pull/72)では、同じHTTPルートを二重登録し、型エラーも発生した。Evaluatorが保存した実際のエラーは次のとおりである。

```text
error TS2300: Duplicate identifier 'category'.
FastifyError: Method 'POST' already declared for route '/tasks/:id/duplicate'
```

機能単位に近いファイルが集まる構成でも、同一責務の実装箇所が増えると、AIが既存実装を見落とす可能性があることを示している。これは編集済みのスクリーンショットではなく、[Evaluatorの公開ログ](https://github.com/naki0227/ai-readable-code-lab/pull/72/files)で追跡できる生の失敗記録である。

## AIにとって読みやすいコードとは何か

- 小規模な変更では、monolithicでも高い通過率を示した。
- ファイル数そのものより、必要な情報が近くにあり、命名規則と既存パターンが統一されていることが重要そうだった。
- layeredは隠しテストを全Runで通過した一方、変更ファイル数が最も多く、整形失敗が完全検証率に影響した。
- feature-basedは大半で通過したが、複数の近接実装箇所をまたぐ変更では重複実装の失敗が起きた。
- 単一の通過率ではなく、隠しテスト、失敗分類、変更量を併記する必要がある。

## 限界

- 各条件は3回であり、統計的な一般化には不十分である。
- 人間によるブラインドな設計品質評価はまだ実施していない。
- 実行時間、トークン使用量、探索ログは全Runで同じ粒度に揃っていない。
- Fastifyを用いた小規模アプリの結果であり、UI、DB、外部APIを含む大規模システムへ直接一般化できない。
- 今回のRunnerモデルはGPT-5.6 Terraのみであり、モデルが変われば結果も変わる可能性がある。

## 再現方法

実験順序と集計結果はリポジトリに公開している。実験ブランチを取得した後、次のコマンドで集計を再生成できる。

```sh
git fetch origin 'refs/heads/experiment/p1/*:refs/remotes/origin/experiment/p1/*'
npm ci
npm run summarize:main-experiment
```

生成される[JSON集計](../../results/summaries/main-experiment-summary.json)と[CSV](../../results/summaries/main-experiment-runs.csv)には、全54 Runの検証結果とPRリンクを含めている。

## 次にやること

次の実験では、Task 05のような契約不整合を実行前に検出する仕組みを追加する。その上で、人間によるブラインド評価と、より大きな変更課題を加える。

第2弾では設計を固定したまま、Python、TypeScript、Go、Rustを比較し、型システムとコンパイラがAIのコード変更へ与える影響を検証する予定である。
