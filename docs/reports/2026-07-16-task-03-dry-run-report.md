# 作業報告書

## 作業日時

2026年07月16日 21時01分35秒

## 作業対象

Task 03の3構成Dry Run、Evaluator結果、GitHub Draft PR。

## 作業目的

操作履歴の横断的な機能追加について、独立Baselineからの変更・検証・公開の導線を確認する。

## 変更内容

3構成で履歴APIを追加し、公開・隠しテストを実行した。結果と差分を各実験ブランチへ保存し、PR #7〜#9をDraftとして作成、manifestと評価サマリーを更新した。

## 変更したファイル

各実験ブランチのTask 03実装と結果ファイル、mainのmanifest、評価サマリー、Todo、本報告書。後続のCI修正として、各Runのmetadata.jsonもPrettierで整形した。

## 変更意図

Task 03のBefore／AfterとEvaluator結果をGitHub上で確認可能にするため。

## 設計上の意図

3件はBuilder実行のDry Runであり、通常集計から除外する。PRは対応v1.0.1 Baselineをbaseにし、マージしない。

## 影響範囲

Dry Run実験記録のみ。Baselineとmainの公開アプリコードは変更しない。

## 追加・更新したテスト

各Runで履歴の作成・更新・担当者変更・完了順を公開・隠しテストで確認した。

## 実行した確認コマンド

`npm run validate`、`scripts/collect-git-metrics`、`scripts/run-hidden-tests`、`gh pr create --draft`。

後続修正では各実験ブランチで `npx prettier --write results/raw/<EXPERIMENT_ID>/metadata.json` と `npm run validate` を実行した。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。隠しテストはEvaluatorのみ実行する。

## 未解決の課題

Task 04〜06のDry Run、本番Runner/Evaluator分離、集計自動化。

## 次にやること

Task 04の3構成Dry Runをv1.0.1 Baselineから実行する。

## 次回最初に見るべきファイル

`tasks/phase1/task-04-overdue-bug/`、`docs/TODO.md`、`experiments/manifest.json`。

## 引き継ぎ事項

PR #7〜#9はDry Run専用で、通常集計に含めずBaselineへマージしない。
