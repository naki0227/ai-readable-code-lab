# 作業報告書

## 作業日時

2026年07月15日 10時28分34秒

## 作業対象

Task 01の3件のDry Runに対するEvaluator隠しテスト。

## 作業目的

Runnerからテスト条件を隔離したまま、各実験ブランチで隠しテスト結果を保存できることを確認する。

## 変更内容

Evaluator専用の隠しテストをmonolithic、layered、feature-basedの各Dry Runに実行し、すべて成功した結果ファイルを各実験ブランチへcommit・pushした。

## 変更したファイル

結果ファイルは各実験ブランチの `results/raw/*/hidden-test-result.txt` のみ。mainではmanifest、Todo、本報告書を更新した。

## 変更意図

公開テストの成功だけでなく、未公開の回帰条件もEvaluatorが記録できることを確認するため。

## 設計上の意図

隠しテストのソースはGit管理外のままで、結果テキストだけを公開する。通常CIは隠しテストを実行しない。

## 影響範囲

Baselineとmainの公開アプリコードに影響はない。各Dry Runは通常集計から除外されたままである。

## 追加・更新したテスト

Task 01のcategoryが無関係な更新後も詳細・一覧で保持されることを、構成ごとに確認した。3件すべて成功。

## 実行した確認コマンド

Evaluatorとして `scripts/run-hidden-tests` の内容を各実験ブランチで実行し、GitHubへ結果ファイルをpushした。

## CIで確認される内容

Node 22でnpm ci、typecheck、format check、lint、公開テスト、build。隠しテストは対象外。

## 未解決の課題

評価JSONの採点、比較ページ、PR作成、全6課題の定義、Runner/Evaluator専用環境の自動化は未実装。

## 次にやること

Task 01のDry Runを比較ページへ集約し、評価JSONの記録形式を確認する。

## 次回最初に見るべきファイル

`experiments/manifest.json`、`tasks/phase1/task-01-category/`、各実験ブランチの `results/raw/`。

## 引き継ぎ事項

Evaluator result commitsはmonolithic `f20c190`、layered `aa0a751`、feature-based `c4f9462`。隠しテスト本体は公開しない。
