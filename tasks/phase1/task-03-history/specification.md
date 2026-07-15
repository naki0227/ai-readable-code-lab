# Specification

- `GET /tasks/:id/history` を追加する。
- 履歴項目は少なくとも `id`、`taskId`、`action`、`createdAt` を持つ。
- actionは `CREATED`、`UPDATED`、`ASSIGNEE_CHANGED`、`COMPLETED`、`ARCHIVED`。
- 作成順で返し、未存在タスクは404。
- Task 05との整合のため、アーカイブ実装時は `ARCHIVED` を記録する。
- BaselineのDELETEはTask 05で置換されるまで履歴対象ではない。
