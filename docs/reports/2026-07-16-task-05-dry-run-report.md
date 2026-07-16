# 作業報告書

## 作業日時

2026年07月16日 23時10分40秒

## 作業対象

Task 05の3構成Dry Run、Evaluator結果、GitHub Draft PR。

## 作業目的

DELETEによる物理削除をアーカイブ状態への遷移へ置き換え、3構成で同じ外部動作を確認する。

## 変更内容

各構成のDELETEを200/`ARCHIVED`応答へ変更し、一覧除外・詳細保持・期限超過除外の回帰テストを追加した。結果を実験ブランチへ保存し、PR #13〜#15をDraftとして作成した。

## 変更したファイル

各実験ブランチのTask 05実装・テスト・結果ファイル、mainのmanifest、評価サマリー、Todo、本報告書。

## 変更意図

アーカイブ後も監査・詳細参照できるタスクライフサイクルを、比較可能な最小差分で導入するため。

## 設計上の意図

状態遷移は各構成の既存責務境界に保持した。共通契約は移行中の既存構成との互換性のためDELETEの200/204を許容し、Task 05固有テストでは200とARCHIVEDを厳密に確認する。

## 影響範囲

DELETE `/tasks/:id` の応答とタスク状態。Baselineとmainの公開アプリコードは変更しない。

## 追加・更新したテスト

各構成でアーカイブの応答、一覧除外、詳細保持、期限超過除外を確認。公開テストは各Runで8/8、隠しテストはすべてPASS。

## 実行した確認コマンド

`npm run validate`、`scripts/collect-git-metrics`、`scripts/run-hidden-tests`、`gh pr create --draft`。

## CIで確認される内容

typecheck、format check、lint、公開テスト、build。隠しテストはEvaluatorのみ実行する。

## 未解決の課題

Task 06のDry Run、本番Runner/Evaluator分離、集計自動化。

## 次にやること

Task 06の3構成Dry Runをv1.0.1 Baselineから実行する。

## 次回最初に見るべきファイル

`tasks/phase1/task-06-duplicate/`、`docs/TODO.md`、`experiments/manifest.json`。

## 引き継ぎ事項

PR #13〜#15はDry Run専用で、通常集計に含めずBaselineへマージしない。
