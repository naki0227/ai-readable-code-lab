# 作業報告書: Phase 1本実験の集計・初期分析

## 作業日時

2026年07月20日 00時19分12秒

## 作業対象

Phase 1本実験54 RunのEvaluator証跡、集計JSON/CSV、初期分析。

## 作業目的

分散したEvaluator証跡を再現可能に集計し、構成別・課題別の傾向と比較上の制約を明確にする。

## 変更内容

`scripts/summarize-main-experiment.mjs` を追加した。mainのmanifestを正本に、各実験ブランチの `results/raw/<experiment id>/evaluation.json` を読み、54 RunのJSONとCSVを生成する。

集計結果は以下のとおり。

| 構成          | Run数 | 完全検証通過 | 隠しテスト通過 | 公開テスト全通過 | 平均変更ファイル数 |
| ------------- | ----: | -----------: | -------------: | ---------------: | -----------------: |
| monolithic    |    18 |   15 (83.3%) |      18 (100%) |       15 (83.3%) |               2.28 |
| feature-based |    18 |   13 (72.2%) |     16 (88.9%) |       14 (77.8%) |               3.11 |
| layered       |    18 |   12 (66.7%) |      18 (100%) |       12 (66.7%) |               4.06 |
| 全体          |    54 |   40 (74.1%) |     52 (96.3%) |       41 (75.9%) |               3.15 |

課題別では、Task 02とTask 03が全9 Runで完全検証を通過した。Task 05は共有公開契約がDELETE 204を期待する一方、課題仕様が200 ARCHIVEDを要求する不整合のため、9 Run中6 Runが `shared contract mismatch` として記録されている。これは構成の品質差ではなく、評価契約の競合として分離して扱う。

Run 54（feature-based / Task 06 / Run 01）は、型エラーと重複ルート登録により公開テスト5/9、隠しテスト0/1となった。失敗結果は修正せず、比較対象として保存している。

## 変更したファイル

- `scripts/summarize-main-experiment.mjs`
- `package.json`
- `results/summaries/main-experiment-summary.json`
- `results/summaries/main-experiment-runs.csv`
- `docs/TODO.md`
- `docs/reports/2026-07-20-phase1-main-experiment-analysis-report.md`

## 変更意図

個々のPRを手で数えず、manifestとEvaluator成果物から同じ集計を再生成できるようにする。CSVは表計算・可視化用、JSONは記事生成や追加分析用に分ける。

## 設計上の意図

Runnerの成果物とEvaluatorの評価結果を混同せず、Evaluator JSONだけを集計対象にする。外部の実験ブランチを明示的に参照するため、集計前に `git fetch origin 'refs/heads/experiment/p1/*:refs/remotes/origin/experiment/p1/*'` が必要である。

## 影響範囲

実験実装・Baseline・評価結果の内容は変更しない。追加したのは結果の集計と分析だけである。

## 追加・更新したテスト

集計スクリプトを実データ54件に対して実行し、Run数、manifestのPR/コミット記録、出力形式を確認した。

## 実行した確認コマンド

- `git fetch origin 'refs/heads/experiment/p1/*:refs/remotes/origin/experiment/p1/*'`
- `npm run summarize:main-experiment`
- `npm run validate`

## CIで確認される内容

CIはNode 22でtypecheck、format check、lint、test、buildを実行する。集計は外部の実験ブランチを読むため、CIには含めず、分析時に明示実行する。

## 未解決の課題

- 人間またはブラインド評価者による設計品質の採点は未実施。
- 実行時間、コマンド履歴、トークン使用量は全Runで揃っていないため、今回の比較指標には含めない。
- Task 05の共有公開契約不整合は、次の実験では事前に解消する必要がある。

## 次にやること

CSVをもとにグラフを作成し、代表的な成功例・失敗例を選んでQiita記事の下書きを作成する。

## 次回最初に見るべきファイル

- `results/summaries/main-experiment-summary.json`
- `results/summaries/main-experiment-runs.csv`
- `docs/PROJECT_PLAN.md`

## 引き継ぎ事項

完全検証通過率は共有契約不整合と整形失敗の影響を受ける。構成差の結論には、隠しテスト通過率と失敗分類を併記し、単一指標だけで優劣を断定しない。
