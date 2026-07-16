# 作業報告書

## 作業日時

2026年07月16日 23時46分10秒

## 作業対象

Phase 1本実験の実行順、Runner/Evaluator分離、実行計画生成スクリプト。

## 作業目的

3構成×6課題×3回の54 Runを、Dry Runと混同せず、再現可能かつ評価独立性を保って実行できる状態にする。

## 変更内容

乱数seed固定の実行順生成スクリプト、54 Runの計画JSON、隔離clone・別セッションを前提とするRunner/Evaluator handoff手順を追加した。

## 変更したファイル

`package.json`、`scripts/generate-main-run-order.mjs`、`experiments/phase1-main-run-order.json`、`docs/MAIN_EXPERIMENT_EXECUTION.md`、`docs/TODO.md`、本報告書。

## 変更意図

同一workspaceを共有するサブエージェントが隠しテストへアクセスできる問題を避け、実験の独立性を技術的に担保するため。

## 設計上の意図

サブエージェントは計画・集計・文書レビューに限定する。RunnerとEvaluatorは別clone・別セッションに分離し、EvaluatorはRunner成果物を修正しない。モデル名とreasoning levelは推測せず、各Run開始時の実測値をmetadataへ記録する。

## 影響範囲

実験運用のみ。Baseline、Dry Run、公開アプリコードは変更しない。

## 追加・更新したテスト

`npm run plan:main-experiment` で54件かつ一意な実験IDを生成することを確認した。

## 実行した確認コマンド

`npm run plan:main-experiment`、54 Runと一意IDのNode検証、`npm run validate`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。実験計画は明示コマンドで再生成する。

## 未解決の課題

隔離Runner/Evaluator環境の用意、各Runのモデル・reasoning設定の実測記録、本実験Run 01の開始。

## 次にやること

別clone・別セッションを用意し、計画JSONのsequence 1をRunnerへ渡す。

## 次回最初に見るべきファイル

`docs/MAIN_EXPERIMENT_EXECUTION.md`、`experiments/phase1-main-run-order.json`、`results/templates/evaluation.json`。

## 引き継ぎ事項

この共有workspace内で本実験のRunner/Evaluatorを実行してはならない。Dry Run branchや結果を見せず、実験branchは対応Baselineから新規作成する。
