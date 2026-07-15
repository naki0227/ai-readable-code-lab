# Human-Readable Code vs AI-Readable Code

人間に読みやすい設計が、AIにとっても変更しやすいかを同一条件で検証する実験基盤です。現在はPhase 1（TypeScript/Fastify）のBaselineを整備中です。

## Planning documents

- [プロジェクト計画書](docs/PROJECT_PLAN.md)
- [GitHub公開・Before／After比較計画](docs/GITHUB_PUBLICATION_PLAN.md)
- [Phase 1 共通仕様](docs/COMMON_SPEC.md)
- [実験手順](docs/EXPERIMENT_PROTOCOL.md)
- [評価基準](docs/EVALUATION_RULES.md)

## Validation

`npm run validate` は型検査、整形、lint、公開テスト、ビルドを実行します。

実験は必ず固定タグのBaselineから分岐し、Baselineへマージしません。詳細は `docs/` を参照してください。
