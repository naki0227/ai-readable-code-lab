# 作業報告書

## 作業日時

2026年07月15日 10時35分06秒

## 作業対象

本番実験用のPRテンプレートとEvaluator評価記録テンプレート。

## 作業目的

実験ごとの条件・自動検証・評価根拠を同じ形式で残し、後から比較・監査できるようにする。

## 変更内容

実験専用PRテンプレート、100点評価のJSONテンプレート、評価記録手順を追加した。実験プロトコルから参照できるようにした。

## 変更したファイル

`.github/pull_request_template.md`、`results/templates/evaluation.json`、`docs/EVALUATION_RECORDING.md`、`docs/EXPERIMENT_PROTOCOL.md`、`docs/TODO.md`。

## 変更意図

Baseline参照、Runner権限、隠しテスト、採点、失敗分類の記録漏れを防ぐため。

## 設計上の意図

評価はRunnerと独立したEvaluatorが実施し、利用できない値はnullとする。Dry Runと本番実験を同じデータセットへ混在させない。

## 影響範囲

実験運用・ドキュメントのみ。Baseline・公開API・CI実行内容は変更しない。

## 追加・更新したテスト

なし。テンプレート追加のみ。

## 実行した確認コマンド

`npm run validate`。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。

## 未解決の課題

Task 02〜06の詳細定義・公開テスト、Runner/Evaluator専用環境の自動化、PR自動作成、集計スクリプトは未実装。

## 次にやること

Task 02〜06の課題文・期待動作・公開テストを定義する。

## 次回最初に見るべきファイル

`tasks/phase1/task-01-category/`、`docs/PROJECT_PLAN.md`、`docs/EVALUATION_RECORDING.md`。

## 引き継ぎ事項

本番実験を開始する前に、RunnerとEvaluatorの環境・アクセス権が実際に分離されていることを確認する。
