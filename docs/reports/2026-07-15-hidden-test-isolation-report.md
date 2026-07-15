# 作業報告書

## 作業日時

2026年07月15日 10時23分11秒

## 作業対象

Phase 1 Task 01の隠しテスト隔離・実行基盤。

## 作業目的

Runnerが隠しテストの内容を読めない状態を保ちつつ、Evaluatorが対象構成ごとの隠しテスト結果を保存できるようにする。

## 変更内容

`hidden-tests/` をGit管理外にし、targetを固定値に制限する `scripts/run-hidden-tests` を追加した。通常CIは `vitest.config.ts` で隠しテストを除外し、公開リポジトリには運用手順のみを置く。

## 変更したファイル

`.gitignore`、`scripts/run-hidden-tests`、`docs/HIDDEN_TESTS.md`、`docs/TODO.md`。

## 変更意図

公開テストだけへの過適合や、Runnerが評価条件を見て実装することを避けるため。

## 設計上の意図

テスト本体はEvaluator専用クローンまたは環境にだけ配布する。実行スクリプトは任意パスを受け取らず、構成名から固定ファイルを選ぶ。

## 影響範囲

通常CIとBaselineの公開コードには影響しない。隠しテストは通常のGit status・pushへ含まれない。

## 追加・更新したテスト

Task 01のcategory保持を検証するEvaluator専用テストを用意した。内容はGitへcommitしない。

## 実行した確認コマンド

`sh -n scripts/run-hidden-tests`、`npm run validate`。続けて各Dry Runで実行する。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。隠しテストは含めない。

## 未解決の課題

3Dry Runでの隠しテスト結果保存、Evaluator専用環境の自動プロビジョニング、全6課題の隠しテストは未実装。

## 次にやること

3つのTask 01 Dry Runブランチで隠しテストを実行し、結果だけをcommitする。

## 次回最初に見るべきファイル

`docs/HIDDEN_TESTS.md`、`scripts/run-hidden-tests`、各実験ブランチの `results/raw/`。

## 引き継ぎ事項

`hidden-tests/` は公開・commit・pushしない。本実験終了後に公開する際は公開日と実験時の非公開性を記録する。
