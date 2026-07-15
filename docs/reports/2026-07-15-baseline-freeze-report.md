# 作業報告書

## 作業日時

2026年07月15日 10時14分28秒

## 作業対象

Phase 1の3Baseline、過去期限の警告応答、Baseline固定。

## 作業目的

初期業務ルールを統一し、実験の開始点を不変なGit参照として固定する。

## 変更内容

期限日が過去の場合に `warnings: ['due date is in the past']` を返すよう3構成を統一した。警告は保存を妨げず、完了済み・アーカイブ済みの期限切れ判定とは独立している。

検証済みcommit `ce0ca087fb0ad40a0ab0e7f3a29879fdc806a3f5` から、`baseline/p1-monolithic`、`baseline/p1-layered`、`baseline/p1-feature-based` と、対応する `p1-*-v1.0.0` の注釈付きタグを作成してGitHubへpushした。

## 変更したファイル

各構成のレスポンス生成、共通契約テスト、`docs/COMMON_SPEC.md`、`docs/TODO.md`。

## 変更意図

過去期限の扱いを曖昧にせず、将来のAI実験で実装漏れとして判定できるようにする。

## 設計上の意図

警告は入力検証エラーと分離し、レスポンスの追加情報として表現する。3構成のアプリ実装は共有しない。

## 影響範囲

Phase 1のタスク作成・更新・取得レスポンスと公開契約テスト。

## 追加・更新したテスト

過去期限のタスク作成で警告が返ることを3構成に共通で検証した。

## 実行した確認コマンド

`npm run validate`。Baselineブランチ・注釈付きタグの作成とGitHub push。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、test、build。

## 未解決の課題

全6課題の詳細定義、隠しテスト、Dry Run、結果集計、PRテンプレートは未実装。

## 次にやること

固定タグからDry Runブランチを作成し、ログ・差分・採点の収集経路を検証する。

## 次回最初に見るべきファイル

`docs/EXPERIMENT_PROTOCOL.md`、`scripts/create-experiment-branch`、`experiments/manifest.json`。

## 引き継ぎ事項

Baselineタグを作成後は移動・削除しない。Baseline不具合は新しいパッチタグで扱う。
