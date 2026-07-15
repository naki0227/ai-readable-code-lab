# 実験手順

1. `npm run validate` を通し、Baseline commitを固定する。
2. `scripts/create-experiment-branch <phase> <target> <task> <run> <baseline-ref>` で分岐する。
3. Runnerには対象ディレクトリ、課題文、公開テストのみを渡す。`hidden-tests/`、結果、他構成は渡さない。
4. Runner終了後、Evaluatorが `npm run validate` と隠しテストを実行する。
5. `scripts/collect-git-metrics` で変更量を保存する。人間によるコード修正があれば通常集計から除外する。
6. Evaluatorは `.github/pull_request_template.md` と `docs/EVALUATION_RECORDING.md` に従い、評価JSONと採点根拠を保存する。

Baselineのバグ修正は新タグで行い、既存タグと混在させない。
