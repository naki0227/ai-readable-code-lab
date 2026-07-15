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

## Phase 1 baselines

すべて commit `ce0ca087fb0ad40a0ab0e7f3a29879fdc806a3f5` を指す不変参照です。

- `baseline/p1-monolithic` / `p1-monolithic-v1.0.0`
- `baseline/p1-layered` / `p1-layered-v1.0.0`
- `baseline/p1-feature-based` / `p1-feature-based-v1.0.0`

Task 01のDry Runは上記 `v1.0.0` を使用する。Task 02〜06には、履歴・アーカイブ実装を含まない新しいBaselineを使用する。

- `baseline/p1-monolithic-v1.0.1` / `p1-monolithic-v1.0.1`
- `baseline/p1-layered-v1.0.1` / `p1-layered-v1.0.1`
- `baseline/p1-feature-based-v1.0.1` / `p1-feature-based-v1.0.1`

## Experiment entry points

- [Task 01: Add category](tasks/phase1/task-01-category/README.md) — Dry Run comparison only; excluded from main results.

実験は必ず固定タグのBaselineから分岐し、Baselineへマージしません。詳細は `docs/` を参照してください。
