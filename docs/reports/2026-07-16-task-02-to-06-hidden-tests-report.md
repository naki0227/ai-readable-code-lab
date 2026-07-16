# 作業報告書

## 作業日時

2026年07月16日 19時44分35秒

## 作業対象

Phase 1 Task 02〜06のEvaluator専用隠しテストと実行スクリプト。

## 作業目的

公開テストだけでは検知しにくい状態保持・回帰・副作用を、Runnerに非公開の条件で検証できるようにする。

## 変更内容

隠しテスト実行スクリプトをTask ID対応へ拡張した。Task 02〜06のEvaluator専用テストをGit管理外の `hidden-tests/` へ追加し、3構成を環境変数で切り替える共通ローダーを用意した。

## 変更したファイル

公開: `scripts/run-hidden-tests`、`docs/HIDDEN_TESTS.md`、`docs/TODO.md`。非公開・未追跡: `hidden-tests/phase1/`。

## 変更意図

Task 02の担当者保持、Task 03の履歴順、Task 04の完了後期限切れ、Task 05のアーカイブ保持、Task 06の独立コピーを公開条件と分離して確認するため。

## 設計上の意図

スクリプトは許可済みTask IDと構成名だけを受け付け、任意テストパスを実行しない。隠しテスト本体はGit管理外で、通常CIはVitest設定により除外する。

## 影響範囲

Evaluator環境と実験結果のみ。Baseline・公開API・通常CIのテスト対象は変えない。

## 追加・更新したテスト

Task 02〜06の隠しテストを非公開領域に追加した。Baselineへはまだ適用せず、各Taskの実装後にEvaluatorが実行する。

## 実行した確認コマンド

`sh -n scripts/run-hidden-tests`、不正Task IDの拒否確認、`npm run validate`。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。隠しテストは含めない。

## 未解決の課題

Task 02〜06のDry Run、本番Runner/Evaluator環境の分離、結果集計、PR作成は未実装。

## 次にやること

Task 02の3構成Dry Runをv1.0.1 Baselineから実行する。

## 次回最初に見るべきファイル

`tasks/phase1/task-02-completed-assignee/`、`scripts/run-hidden-tests`、`docs/TODO.md`。

## 引き継ぎ事項

隠しテスト本体をcommit・pushしてはいけない。Task 02〜06の実験は必ずv1.0.1タグから独立して開始する。
