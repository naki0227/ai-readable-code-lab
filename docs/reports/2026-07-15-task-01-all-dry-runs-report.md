# 作業報告書

## 作業日時

2026年07月15日 10時21分37秒

## 作業対象

Task 01（category追加）のlayered・feature-based Dry Run、および3構成の結果記録。

## 作業目的

同一課題を各Baselineから独立して実行し、実験分岐・検証・差分収集の形式が構成間で揃うことを確認する。

## 変更内容

`experiment/p1/layered/task-01/dry-run-01` と `experiment/p1/feature-based/task-01/dry-run-01` を対応タグから作成し、categoryを作成・更新・詳細取得で扱えるようにした。各実験ブランチへメタデータ、prompt、コマンド履歴、公開テスト結果、変更一覧、git統計、patchを保存した。

## 変更したファイル

実装・結果は各Dry Runブランチに限定した。mainでは `experiments/manifest.json`、`docs/TODO.md`、本報告書を更新した。

## 変更意図

3構成の本実験を始める前に、Git参照と結果保存の運用を構成ごとに検証するため。

## 設計上の意図

3件はすべて同じBaseline commit `ce0ca087fb0ad40a0ab0e7f3a29879fdc806a3f5` から分岐した。Builderが実行したDry Runは本番の独立Runner結果ではないため、いずれも `includedInMainResults: false` とした。

## 影響範囲

mainのBaseline実装は変更しない。category実装と結果は各実験ブランチに閉じている。

## 追加・更新したテスト

各Dry Runでcategoryの作成・更新・詳細取得テストを追加した。各ブランチで `npm run validate` は8テストすべて成功した。

## 実行した確認コマンド

`scripts/create-experiment-branch`、`npm run validate`、`scripts/collect-git-metrics`、GitHub push。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、test、build。

## 未解決の課題

隠しテストの隔離実行、PR作成、結果集計、全6課題の詳細定義、本番Runner/Evaluatorのコンテキスト分離は未実装。

## 次にやること

Task 01の隠しテストをRunnerから隔離して実行できるスクリプトを追加する。

## 次回最初に見るべきファイル

`experiments/manifest.json`、`hidden-tests/phase1/`、`docs/EXPERIMENT_PROTOCOL.md`。

## 引き継ぎ事項

Dry Run result commitsはmonolithic `9f0a20ac34a40e3938c57674f47856c9b25b0851`、layered `deee6ee5e22ea2b6a4e2bf105ce17a9bc64febf9`、feature-based `ba28a1e254b934e78fc4a7cf6222030af42c3f6f`。いずれも通常集計に含めない。
