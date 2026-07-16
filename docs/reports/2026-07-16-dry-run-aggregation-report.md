# 作業報告書

## 作業日時

2026年07月16日 23時40分31秒

## 作業対象

Task 01〜06のDry Run評価サマリーと結果集計スクリプト。

## 作業目的

全18件のDry Run結果を再現可能に集計し、本実験へ移る前の確認点を明確にする。

## 変更内容

`scripts/summarize-dry-runs.mjs` と npm scriptを追加し、各Taskの評価サマリーから `results/summaries/dry-run-overview.json` を生成するようにした。

## 変更したファイル

`package.json`、`scripts/summarize-dry-runs.mjs`、`results/summaries/dry-run-overview.json`、`docs/TODO.md`、本報告書。

## 変更意図

手作業による集計ミスを避け、Dry Runが通常結果に含まれないことと、採点値が未設定であることを明示するため。

## 設計上の意図

スクリプトはTask別JSONだけを入力とし、スコアを推測しない。公開・隠しテストの全通過、実行数、未採点数を機械的に記録する。

## 影響範囲

実験の記録と集計のみ。アプリケーションコード、Baseline、Dry Run結果は変更しない。

## 追加・更新したテスト

`npm run summarize:dry-runs` を実行し、6 Task・18 Run・公開/隠しテスト全通過・未採点18件の出力を確認した。

## 実行した確認コマンド

`npm run summarize:dry-runs`、`npm run validate`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。集計コマンドは明示実行する。

## 未解決の課題

独立Runner/Evaluatorの割当、本実験の実行順、評価JSONの実採点。

## 次にやること

本実験のRunner/Evaluatorを分離し、Baselineから実行する順序を確定する。

## 次回最初に見るべきファイル

`results/summaries/dry-run-overview.json`、`docs/EXPERIMENT_PROTOCOL.md`、`docs/EVALUATION_RECORDING.md`。

## 引き継ぎ事項

概要JSONの `includedInMainResults` は false のままであり、スコアは独立Evaluatorが記入するまで全件nullとする。
