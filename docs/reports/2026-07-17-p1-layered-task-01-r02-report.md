# 作業報告書

## 作業日時

2026年07月17日 11時41分22秒

## 作業対象

本実験 P1-LAYERED-T01-R02（Task 01: category）。

## 作業目的

隔離Runner/Evaluator手順を用いて、本実験の最初の有効Runを実行し、公開可能なBefore／After・評価記録を作成する。

## 変更内容

Runner専用cloneのCodex CLIがLayered構成にcategoryを追加した。別clone・別Codex CLIセッションのEvaluatorで公開検証と隠しテストを実行し、metrics・評価JSONを保存した。PR #19をDraftとして作成し、mainのmanifestと進捗サマリーを更新した。

## 変更したファイル

実験ブランチのLayered実装・テスト・評価成果物、mainのmanifest、進捗サマリー、Todo、本報告書。

## 変更意図

Dry Runではない独立実行の実験結果を、通常集計に含められる形で保存するため。

## 設計上の意図

Runnerは隠しテストを持たないclone、Evaluatorは別clone・別セッションで実行した。RunnerのCLI sandboxがGit書き込みを拒否したため、親はRunner生成済みのソースを変更せず成果コミットだけを作成した。この運用上の事実は評価JSONに記録した。

## 影響範囲

本実験ブランチと評価記録のみ。Baselineとmainの公開アプリコードは変更しない。

## 追加・更新したテスト

Runnerがcategoryの作成・更新・取得を確認する公開テストを追加。Evaluatorで公開検証8/8と隠しテスト1/1がPASS。

## 実行した確認コマンド

Runner: `npm run validate`。Evaluator: `npm ci`、`npm run validate`、Evaluator専用hidden test、`scripts/collect-git-metrics`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。隠しテストはEvaluator専用環境でのみ実行する。

## 未解決の課題

残り53 Runの実行、Evaluator採点の数値化、CLI sandboxのGit書き込み制約を運用で回避すること。

## 次にやること

計画JSONのsequence 2を、同じ隔離手順で実行する。

## 次回最初に見るべきファイル

`experiments/phase1-main-run-order.json`、`docs/MAIN_EXPERIMENT_EXECUTION.md`、`results/summaries/main-experiment-progress.json`。

## 引き継ぎ事項

PR #19は本実験の比較用で、Baselineへマージしない。EvaluatorはRunnerソースを変更していない。hidden test本体はcommitしていない。
