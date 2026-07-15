# Task 01: Add category

## Requirement

タスクに `category` を追加し、作成・更新・取得APIで扱えるようにする。

## Purpose

局所的な属性追加において、設計構造が変更範囲と実装漏れへ与える影響を確認する。

## Dry Run comparison

次表は実験基盤の動作確認用であり、Builderが実行したため本番集計へ含めない。

| Architecture  | Before                                                                               | After                                                                                                      | Diff                                                                                                                                         | Public tests | Hidden tests | Files changed | Lines + / - | Score |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -----------: | -----------: | ------------: | ----------: | ----: |
| Monolithic    | [tag](https://github.com/naki0227/ai-readable-code-lab/tree/p1-monolithic-v1.0.0)    | [result](https://github.com/naki0227/ai-readable-code-lab/commit/f20c190afe463bb6d6c2311cd341b71d4a289f1e) | [compare](https://github.com/naki0227/ai-readable-code-lab/compare/p1-monolithic-v1.0.0...experiment/p1/monolithic/task-01/dry-run-01)       |        8 / 8 |         PASS |             2 |    +35 / -1 |  null |
| Layered       | [tag](https://github.com/naki0227/ai-readable-code-lab/tree/p1-layered-v1.0.0)       | [result](https://github.com/naki0227/ai-readable-code-lab/commit/aa0a751d3c865b814c370fd99f1fc9a17364ccf8) | [compare](https://github.com/naki0227/ai-readable-code-lab/compare/p1-layered-v1.0.0...experiment/p1/layered/task-01/dry-run-01)             |        8 / 8 |         PASS |             4 |    +37 / -1 |  null |
| Feature-based | [tag](https://github.com/naki0227/ai-readable-code-lab/tree/p1-feature-based-v1.0.0) | [result](https://github.com/naki0227/ai-readable-code-lab/commit/c4f9462860c41a8c687d3a944af52e6c85c3bd01) | [compare](https://github.com/naki0227/ai-readable-code-lab/compare/p1-feature-based-v1.0.0...experiment/p1/feature-based/task-01/dry-run-01) |        8 / 8 |         PASS |             3 |    +29 / -0 |  null |

## Interpretation

3構成とも公開・隠しテストを通過した。これは実験分岐・結果保存・Evaluator実行の導線確認を示すだけであり、設計の優劣や成功率の結論には使わない。

本番実験では別セッションのRunnerが固定Baselineから実装し、Evaluatorが同じ評価JSON形式で採点する。
