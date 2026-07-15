# 作業報告書

## 作業日時

2026年07月15日 10時10分29秒

## 作業対象

Phase 1のmonolithic、layered、feature-based Baselineと共通契約テスト。

## 作業目的

設計の違いではなく機能差が実験結果へ混入しないよう、基本タスクAPIを一致させる。

## 変更内容

全構成に更新とアーカイブを揃え、共通契約テストを追加した。テストは空タイトル、作成、期限切れ、更新、二重完了、アーカイブ後の一覧除外、未存在取得を検証する。

## 変更したファイル

`phase1-architecture/contracts/`、各構成の `src/`、`docs/COMMON_SPEC.md`、`docs/TODO.md`。

## 変更意図

Runnerが同じ課題に対して異なる外部仕様へ対応する状態を防ぐため。

## 設計上の意図

契約はテスト専用ディレクトリへ置き、比較対象アプリの実装を共有しない。各構成の責務分割の差を維持する。

## 影響範囲

Phase 1の公開APIと公開テスト。DB、認証、外部サービスはない。

## 追加・更新したテスト

全3構成に共通の契約テストを追加し、既存の構成別テストも維持した。

## 実行した確認コマンド

`npm run validate`（typecheck、format、lint、7テスト、build成功）。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、test、build。

## 未解決の課題

担当者の存在検証、操作履歴、全6課題、隠しテスト、結果集計、Baselineタグは未実装。

## 次にやること

担当者検証と操作履歴を共通契約へ追加してからBaselineタグを固定する。

## 次回最初に見るべきファイル

`phase1-architecture/contracts/task-api-contract.ts`、`docs/COMMON_SPEC.md`、`docs/TODO.md`。

## 引き継ぎ事項

Baselineタグを作成後は変更しない。以後の実験は必ずタグから独立ブランチを作成する。
