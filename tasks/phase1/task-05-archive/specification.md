# Specification

- `DELETE /tasks/:id` は削除せずアーカイブへ移行する。
- レスポンスは200で `status: ARCHIVED` を返す。
- ARCHIVEDは通常の `GET /tasks` から除外する。
- `GET /tasks/:id` はARCHIVEDを返す。
- 未存在タスクは404。
- ARCHIVEDは期限切れとして扱わない。
