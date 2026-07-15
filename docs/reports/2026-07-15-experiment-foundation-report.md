# 作業報告書

## 作業日時

2026年07月15日 10時05分17秒

## 作業対象

Phase 1の共通仕様、実験プロトコル、評価資料、補助スクリプト。

## 作業目的

Baselineから独立実験を再現可能に開始・記録できるようにする。

## 変更内容

共通API仕様、採点・失敗分類、実験手順、manifest、Task 01の課題文、Baseline検証・分岐・git差分収集スクリプトを追加した。

## 変更したファイル

`docs/COMMON_SPEC.md`、`docs/EXPERIMENT_PROTOCOL.md`、`docs/EVALUATION_RULES.md`、`tasks/`、`scripts/`、`experiments/manifest.json`、`docs/TODO.md`。

## 変更意図

各Runを同じ固定Baselineから開始し、評価で参照する差分を機械的に保存するため。

## 設計上の意図

スクリプトは入力数とGit refを検証し、RunnerとEvaluatorのコンテキスト分離を手順として明記した。結果値の推測はしない。

## 影響範囲

実験用ドキュメントと補助コマンドのみ。アプリの公開APIは変更しない。

## 追加・更新したテスト

既存のBaseline APIテストを維持した。シェル構文は `sh -n` で確認する。

## 実行した確認コマンド

`sh -n scripts/validate-baseline scripts/create-experiment-branch scripts/collect-git-metrics`、`npm run validate`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。

## 未解決の課題

3Baselineの属性・更新・担当者・アーカイブ機能を完全に揃えること、全6課題、隠しテスト、結果集計は未実装。

## 次にやること

共通の契約テストを先に追加し、それを満たすよう3構成を拡張する。

## 次回最初に見るべきファイル

`docs/COMMON_SPEC.md`、`docs/TODO.md`、各 `phase1-architecture/*/src/`。

## 引き継ぎ事項

Baselineタグは機能差分を解消してから作成する。GitHub `origin/main` への初回pushは完了済み。
