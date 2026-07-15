# 作業報告書

## 作業日時

2026年07月15日 16時53分48秒

## 作業対象

Phase 1 Task 02〜06向けの構成別Baseline v1.0.1。

## 作業目的

Task 03（履歴追加）、Task 04（期限切れバグ修正）、Task 05（削除からアーカイブへの変更）を、既存機能との重複なしに比較できる初期状態を用意する。

## 変更内容

v1.0.1では操作履歴とアーカイブAPIを外して `DELETE /tasks/:id` を復元した。完了済みタスクが期限切れとして扱われる状態を残し、Task 04の修正対象とした。新Baseline commit `4ae13048bff735fa52219adbeb5075d4c04dbe43` から、3構成のBaselineブランチと注釈付きタグを作成した。

## 変更したファイル

新Baseline commitでは各構成のTask実装、共通契約テスト、共通仕様、Vitestの隠しテスト除外設定を変更した。mainではREADME、Todo、本報告書を更新した。

## 変更意図

既存v1.0.0に入っていた履歴・アーカイブ・期限切れ修正により、Task 03〜05が実験課題として成立しない問題を解消するため。

## 設計上の意図

既存のタグ・Baseline・Dry Runは移動も削除もしない。新たな実験系列としてv1.0.1を固定し、異なるBaseline versionの結果を同じ集計へ混在させない。

## 影響範囲

Task 02〜06の将来の実験のみ。Task 01のv1.0.0 Dry Run・PR #1〜#3は変更しない。

## 追加・更新したテスト

共通契約テストをv1.0.1の削除API仕様へ変更した。`npm run validate` はtypecheck、format、lint、7テスト、buildすべて成功した。

## 実行した確認コマンド

`npm run validate`、Baselineブランチ・注釈付きタグの作成、GitHub push。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。

## 未解決の課題

Task 02〜06の課題文・期待動作・公開テストケース、各Taskの隠しテスト、Runner/Evaluator分離、本番実験、集計は未実装。

## 次にやること

Task 02〜06の仕様と公開テストケースを作成し、各TaskがどのBaseline versionを使用するか明記する。

## 次回最初に見るべきファイル

`docs/PROJECT_PLAN.md`、`docs/COMMON_SPEC.md`、`docs/TODO.md`、`tasks/phase1/`。

## 引き継ぎ事項

v1.0.1タグは `p1-monolithic-v1.0.1`、`p1-layered-v1.0.1`、`p1-feature-based-v1.0.1`。Task 02〜06は必ず対応するv1.0.1タグから分岐する。
