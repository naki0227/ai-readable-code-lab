# Human-Readable Code vs AI-Readable Code

人間に読みやすい設計が、AIにとっても変更しやすいかを同一条件で検証する実験基盤です。現在はPhase 1（TypeScript/Fastify）のBaselineを整備中です。

## Validation

`npm run validate` は型検査、整形、lint、公開テスト、ビルドを実行します。

実験は必ず固定タグのBaselineから分岐し、Baselineへマージしません。詳細は `docs/` を参照してください。
