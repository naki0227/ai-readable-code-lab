# 作業報告書

## 作業日時

2026年07月15日 10時50分43秒

## 作業対象

Phase 1 Task 02〜06の課題文、仕様、期待動作、公開テストケース。

## 作業目的

同じ要求を3構成のRunnerへ渡し、Evaluatorが一貫した観点で確認できる状態にする。

## 変更内容

Task 02（完了後の担当者変更禁止）、Task 03（履歴）、Task 04（期限切れバグ）、Task 05（アーカイブ）、Task 06（複製）について、Runner向けprompt、外部仕様、期待動作表、公開テストケースを追加した。

## 変更したファイル

`tasks/phase1/task-02-completed-assignee/` から `task-06-duplicate/`、`README.md`、`docs/TODO.md`。

## 変更意図

課題文の解釈差を減らしつつ、Task 06では既存仕様の調査能力を観察できる程度の意図的な曖昧さを残すため。

## 設計上の意図

Task 02〜06は必ず対応するv1.0.1タグから開始する。公開テストケースはBaseline CIへ混ぜず、実験ブランチでRunnerが追加・実行するための検証契約として管理する。

## 影響範囲

実験課題とドキュメントのみ。Baseline・Dry Run・GitHub Draft PRは変更しない。

## 追加・更新したテスト

実装済みテストは追加しない。各Taskに正常系・異常系・回帰観点を含む公開テストケースを定義した。

## 実行した確認コマンド

`npm run validate`。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。

## 未解決の課題

Task 02〜06のEvaluator専用隠しテスト、実験実行、PR作成、評価、集計は未実装。

## 次にやること

Task 02〜06の隠しテストをEvaluator専用領域に追加する。

## 次回最初に見るべきファイル

`tasks/phase1/`、`docs/HIDDEN_TESTS.md`、`docs/TODO.md`。

## 引き継ぎ事項

Task 03とTask 05はTask順の依存を作らない。本番実験では各Taskをそれぞれv1.0.1 Baselineから独立分岐し、課題間の変更を引き継がない。
