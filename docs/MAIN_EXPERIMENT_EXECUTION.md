# 本実験の実行手順

## 固定済みの実行計画

`npm run plan:main-experiment` は、乱数seed `20260716` による54 Runの順序を `experiments/phase1-main-run-order.json` へ生成する。各条件は3回ずつ実行し、Task 01はv1.0.0、Task 02〜06はv1.0.1の対応Baselineから開始する。

この計画の生成だけでは本実験は開始しない。Runnerのモデル識別子とreasoning levelは、実行前に各Runのmetadataへ実測値として記録する。

## Runner

1. 対応タグから、Runner専用の新規cloneを作る。`hidden-tests/`、`results/`、他構成、Dry Runのbranch/PRは渡さない。
2. 新規の会話・新規セッションで、対象構成、当該Task文書、公開テストだけを渡す。
3. 実装、必要なテスト、`npm run validate`、Runner成果物の意図的コミットまでを行う。人間・親エージェントはコードを修正しない。
4. handoffは実験IDとRunner result commit SHAだけにする。

## Evaluator

1. Runnerとは別のclone・別セッションで、Runner result commit SHAをcheckoutする。
2. Evaluator専用の `hidden-tests/` を注入し、`npm run validate`、隠しテスト、git metricsを実行する。
3. `results/templates/evaluation.json` をコピーして採点根拠を記録する。採点不能な値はnullとする。
4. EvaluatorはRunnerのソースコードを一切修正しない。修正が必要なら `humanCodeCorrections: true` とし、通常結果から除外して新Runを作る。

## このCodexセッションでの制約

サブエージェントは同一workspaceとGit履歴を共有するため、Runner/Evaluatorの独立性を保証できない。本実験のRunner/Evaluatorはこの共有workspaceでは実行せず、上記の隔離cloneと別セッションで実行する。サブエージェントは実行計画、集計、ドキュメントレビューに限定する。
