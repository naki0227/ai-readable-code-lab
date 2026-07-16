# 作業報告書

## 作業日時

2026年07月16日 23時28分14秒

## 作業対象

Task 06の3構成Dry Run、Evaluator結果、GitHub Draft PR。

## 作業目的

タスク複製APIを3構成へ同一仕様で導入し、独立Baselineからの比較・検証・公開を完了する。

## 変更内容

各構成へ `POST /tasks/:id/duplicate` を追加した。複製では新しいID・日時を生成し、主要属性を保持、状態をTODO、担当者を未設定とした。結果を実験ブランチへ保存し、PR #16〜#18をDraftとして作成した。

## 変更したファイル

各実験ブランチのTask 06実装・テスト・結果ファイル、mainのmanifest、評価サマリー、Todo、本報告書。

## 変更意図

複製時の状態初期化と元タスク不変を、各構成の責務境界内で検証可能にするため。

## 設計上の意図

複製ロジックは各構成の既存のアプリケーション境界に置き、外部APIは状態・時刻の生成を明示的に返す。3件はDry Runであり、通常集計から除外する。

## 影響範囲

新規の複製APIのみ。Baselineとmainの公開アプリコードは変更しない。

## 追加・更新したテスト

各構成で属性複製、TODO化、担当者未設定、新ID、元タスク不変を確認。公開テストは各Runで8/8、隠しテストはすべてPASS。

## 実行した確認コマンド

`npm run validate`、`scripts/collect-git-metrics`、`scripts/run-hidden-tests`、`gh pr create --draft`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。隠しテストはEvaluatorのみ実行する。

## 未解決の課題

全Dry Run結果の集計自動化、本番Runner/Evaluator分離、実験実行順の確定。

## 次にやること

Task 01〜06のDry Run結果を集計し、本実験の実行計画を確定する。

## 次回最初に見るべきファイル

`experiments/manifest.json`、`results/summaries/`、`docs/TODO.md`。

## 引き継ぎ事項

PR #16〜#18はDry Run専用で、通常集計に含めずBaselineへマージしない。
