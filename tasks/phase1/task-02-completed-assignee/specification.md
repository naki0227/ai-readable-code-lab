# Specification

- 対象は `PATCH /tasks/:id` の `assigneeId` 更新だけ。
- `status: COMPLETED` のタスクで担当者変更を要求した場合、409と既存形式のエラーを返す。
- 完了前の有効な担当者（`user-1`、`user-2`）への変更は成功する。
- タイトルなど、担当者以外の更新を禁止しない。
- 存在しない担当者の404動作は維持する。
