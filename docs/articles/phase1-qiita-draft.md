# AIはどんな設計を変更しやすいのか？TypeScript APIを3構成・54 Runで比較してみた

> 下書き。公開前に著者情報、図の説明、代表差分へのリンクを確認する。

## 結論

この小規模なTypeScript/Fastifyアプリを対象に、3つの設計構造へ6課題を各3回実行し、合計54 Runを比較した。全54 Runでの完全検証通過率は、`monolithic`が83.3%、`feature-based`が72.2%、`layered`が66.7%だった。評価契約に不整合があったTask 05を除くと、それぞれ100%、86.7%、80.0%となった。隠しテストによって測定した要件適合率は、`monolithic`と`layered`が100%、`feature-based`が88.9%だった。

`monolithic`は変更対象が平均2.28ファイルに収まり、編集範囲が最も狭かった。これが小規模変更での有利さにつながった可能性がある。一方、`layered`は全Runで隠しテストを通過しており、Task 05以外の完全検証失敗は`format`によるものだった。複数ファイルに分かれた設計でも要件は正しく実装できていたが、変更後の仕上げまで含めると失敗が増えた。

したがって、今回の結果だけで「単一ファイル構成がAIに最適」とは結論づけられない。AIにとって重要なのは、ファイル数の少なさだけでなく、参照すべき実装箇所を一意に判断できることと、複数ファイル変更後の検証を確実に完了できることだと考えている。各条件は3回ずつであり、モデルやプロンプト、課題の難度による影響を完全には分離できない。

![構成別の完全検証通過率と隠しテスト通過率](https://raw.githubusercontent.com/naki0227/ai-readable-code-lab/main/results/summaries/main-experiment-validation-rates.png)

## 先に見るべき2つの指標

この記事では、次の2軸を分けて扱う。

| 評価軸     | 使用する指標     | 意味                                                                             |
| ---------- | ---------------- | -------------------------------------------------------------------------------- |
| 要件適合性 | 隠しテスト通過率 | 公開されていない評価ケースを含め、課題要件を満たしたか。                         |
| 開発品質   | 完全検証通過率   | `build`、`typecheck`、`format`、`lint`、公開テスト、隠しテストをすべて通したか。 |

この区別がないと、整形だけで落ちたRunと要件を実装できなかったRunを同じ失敗として扱ってしまう。

## なぜ検証したのか

人間にとって保守しやすい分割が、AIが既存コードを探索し、変更し、テストまで通す際にも有利なのかを確かめたかった。比較したのは、同じタスクAPIを異なる構成で実装した次の3条件である。

| 構成          | 特徴                                               |
| ------------- | -------------------------------------------------- |
| monolithic    | 主要な処理を1ファイルに集約                        |
| layered       | `domain` / `repository` / `service` / `HTTP`を分離 |
| feature-based | task機能単位に実装を集約                           |

仕様、課題、Baseline、隠しテスト、評価手順は実験前に固定した。詳細は[プロジェクト計画書](https://github.com/naki0227/ai-readable-code-lab/blob/main/docs/PROJECT_PLAN.md)、[実験プロトコル](https://github.com/naki0227/ai-readable-code-lab/blob/main/docs/EXPERIMENT_PROTOCOL.md)、[評価基準](https://github.com/naki0227/ai-readable-code-lab/blob/main/docs/EVALUATION_RULES.md)を参照してほしい。すべてのBaseline、実験ブランチ、PR、評価結果は[GitHubリポジトリ](https://github.com/naki0227/ai-readable-code-lab)で公開している。

## 実験方法

3構成 × 6課題 × 各3回、合計54 Runを実行した。本記事では、AIへ1回の課題実装を依頼した単位を「Run」と呼ぶ。

| 条件      | 値                                        |
| --------- | ----------------------------------------- |
| 実施期間  | 2026年07月17日〜20日（Evaluator記録基準） |
| Runner    | Codex上のGPT-5.6 Terra                    |
| Reasoning | `medium`                                  |

Runnerは対象コードと公開情報だけを扱い、Evaluatorは別cloneで公開検証と隠しテストを実施した。モデル、推論設定、評価時刻、Git差分、評価JSON、公開・隠しテストの結果を各Runの証跡として保存し、GitHub PRとして公開している。

完全検証通過は、`build`・`typecheck`・`format`・`lint`・公開テスト・隠しテストがすべて通ったRunと定義した。

## 結果を読む前の注意: Task 05は主たる設計比較から分離する

Task 05では、共有公開契約が`DELETE`の204応答を期待していたのに対し、課題仕様は200と`ARCHIVED`応答を要求していた。Task 05の9 Runはすべて完全検証を通過しなかった。このうち6 Runは、課題仕様に従って200応答へ変更したことで共有公開契約と衝突した。残る3 Runも課題固有の実装漏れによって失敗しており、Task 05では評価契約の競合と実装上の失敗を分離できない。

評価契約の競合と実装漏れが同じ課題に混在するため、以降の主たる構成比較ではTask 05の9 Run全体を参考値から除外する。これはTask 05の結果を隠すためではなく、構成差として解釈できない条件を分けて表示するためである。

## 結果

| 構成          | 全54 Runでの完全検証率 | Task 05除外時 | 隠しテスト通過率 | 平均変更ファイル数 |
| ------------- | ---------------------: | ------------: | ---------------: | -----------------: |
| monolithic    |          15/18 (83.3%) |  15/15 (100%) |     18/18 (100%) |               2.28 |
| feature-based |          13/18 (72.2%) | 13/15 (86.7%) |    16/18 (88.9%) |               3.11 |
| layered       |          12/18 (66.7%) | 12/15 (80.0%) |     18/18 (100%) |               4.06 |

Task 05を除くと完全検証通過率は monolithic 100%、feature-based 86.7%、layered 80.0%となる。Task 05の不整合は全構成に影響しており、完全検証率の構成差を読むときはこの参考値も併記する。

Task 05以外で観測した失敗の内訳は次のとおり。1つのRunが複数項目へ重複して計上される場合がある。

| 構成          | `format`失敗 | `lint`失敗 | `typecheck`失敗 | 隠しテスト失敗 |
| ------------- | -----------: | ---------: | --------------: | -------------: |
| monolithic    |            0 |          0 |               0 |              0 |
| feature-based |            1 |          0 |               1 |              2 |
| layered       |            3 |          0 |               0 |              0 |

Task 02とTask 03は9 Runすべてが完全検証を通過した。Task 06は変更量が最も大きく、平均108.2行の追加が必要だった。さらにfeature-basedのTask 06 Run 01では、重複ルート登録と型エラーにより隠しテストにも失敗した。このRunは失敗例として改変せず残している。

![構成別の平均変更ファイル数](https://raw.githubusercontent.com/naki0227/ai-readable-code-lab/main/results/summaries/main-experiment-change-scope.png)

平均変更ファイル数は、厳密な探索時間ではない。しかし、layeredで平均4.06ファイル、feature-basedで3.11ファイル、monolithicで2.28ファイルとなり、構成ごとの変更範囲の違いを示す補助指標にはなる。

## 成功例と失敗例

成功例として、Task 03（変更履歴追加）は全構成・全Runで完全検証を通過した。既存の責務分離に沿って、イベントの保存、取得、HTTP応答を小さく追加できたことが共通点だった。

代表例は[`layered` / Task 03 / Run 01のPR](https://github.com/naki0227/ai-readable-code-lab/pull/67)で確認できる。評価条件やログはPR、純粋なBefore／Afterは[Baselineとの比較](https://github.com/naki0227/ai-readable-code-lab/compare/p1-layered-v1.0.1...b9f0b1a33d106d96ae987eb51d9cf59ff79fca75)で追える。差分では、履歴の型を`domain`へ、保存を`repository`へ、イベント記録を`service`へ、`HTTP` endpointを`app`へ配置している。

以下は実際の変更を要約した疑似diffである。

```diff
+ app.get('/tasks/:id/history', ...)
+ export type TaskHistoryItem = { id; taskId; action; createdAt }
+ repository.saveHistory(...)
+ service.recordHistory(task.id, 'CREATED', time)
```

Task 03は複数レイヤーを横断する課題だったが、既存のTask作成・更新処理に履歴記録を追加する形で実装できた。各構成に類似する既存処理があり、それを模倣できたことが、全構成での成功率の高さにつながった可能性がある。

失敗例として、[`feature-based` / Task 06 / Run 01のPR](https://github.com/naki0227/ai-readable-code-lab/pull/72)では、同じ`HTTP`ルートを二重登録し、型エラーも発生した。複製機能を追加する過程で、既に存在していた`category`フィールドも重複して追加していた。Evaluatorが保存した実際のエラーは次のとおりである。

```text
error TS2300: Duplicate identifier 'category'.
FastifyError: Method 'POST' already declared for route '/tasks/:id/duplicate'
```

このRunでは、既存の複製ルートと`category`定義を十分に確認しないまま、同じ宣言とルートを再追加していた。ただし、feature-based全体の性質と断定するには試行数が不足している。関連コードが近くに配置されていても、既存実装の有無を確認できなければ、重複実装は防げない。これは編集済みのスクリーンショットではなく、[Evaluatorの公開ログ](https://github.com/naki0227/ai-readable-code-lab/pull/72/files)で追跡できる生の失敗記録である。

## AIにとって読みやすいコードとは何か

今回の結果からは、AIにとっての読みやすさを、単純なファイル数やアーキテクチャ名だけでは説明できなかった。変更対象が少ないことは小規模変更で有利に働く一方、複数ファイルへ分かれていても、依存方向と命名が一貫していれば要件自体は正しく実装できていた。反対に、関連コードが近くにあっても、同じ責務を扱う実装箇所を見落とすと重複実装が起きた。重要なのは、コードが集約されていることよりも、変更時に参照すべき場所を一意に判断できることだと考えている。

- 変更対象を特定できる命名とディレクトリ規則を揃える。
- 同じルートや型の定義場所を一意にする。
- 複数ファイル変更後に`format`まで実行する完了条件を明示する。
- 類似機能の実装例とテストをリポジトリ内に残す。
- 関連コードの近接性だけでなく、重複定義を検出する静的検証を用意する。

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

生成される[JSON集計](https://github.com/naki0227/ai-readable-code-lab/blob/main/results/summaries/main-experiment-summary.json)と[CSV](https://github.com/naki0227/ai-readable-code-lab/blob/main/results/summaries/main-experiment-runs.csv)には、全54 Runの検証結果とPRリンクを含めている。

## 次にやること

次の実験では、Task 05のような契約不整合を実行前に検出する仕組みを追加する。その上で、人間によるブラインド評価と、より大きな変更課題を加える。

第2弾では設計を固定したまま、Python、TypeScript、Go、Rustを比較し、型システムとコンパイラがAIのコード変更へ与える影響を検証する予定である。
