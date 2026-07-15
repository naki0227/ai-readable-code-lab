# 隠しテストの運用

隠しテストの実装は `hidden-tests/` に置くが、Gitで無視し、公開リポジトリへcommitしない。EvaluatorはRunnerと異なるクローンまたは隔離環境で、同じ実験ブランチをcheckoutしてから実行する。

通常のVitest実行は `vitest.config.ts` で `hidden-tests/**` を明示的に除外する。Evaluatorだけが `scripts/run-hidden-tests` を使って、対象の隠しテストを直接指定して実行する。

```sh
scripts/run-hidden-tests monolithic results/raw/P1-MONOLITHIC-T01-R01/hidden-test-result.txt
```

許可されるtargetは `monolithic`、`layered`、`feature-based` のみ。スクリプトはtargetごとに固定されたテストファイルだけを実行し、任意パスは受け取らない。

Evaluatorは結果ファイルと採点だけを実験ブランチへ保存する。テスト本体は本実験が完了して再現性のため公開するまで、Runner・公開PR・通常のCIへ渡さない。
