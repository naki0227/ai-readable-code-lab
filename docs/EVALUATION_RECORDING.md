# 評価記録

Evaluatorは `results/templates/evaluation.json` を各実験の `results/raw/<EXPERIMENT_ID>/evaluation.json` へコピーして記入する。利用できない測定値は `null` とし、推測で埋めない。

`scores.total` は [評価基準](EVALUATION_RULES.md) の100点満点で、各小計の合計と一致させる。`evidence` にはファイル、テスト名、コマンド出力など採点根拠を記録する。

Dry Runでは `kind` を `dry-run`、`includedInMainResults` を `false` にし、独立Evaluatorがいない場合はスコアをすべて `null` にする。

評価後はJSON、隠しテスト結果、git統計を実験ブランチへcommitする。Runnerのソースコードを修正した場合は `humanCodeCorrections: true` をmetadataへ記録し、そのRunを通常集計から外す。
