# Specification

- `POST /tasks/:id/duplicate` を追加する。
- 元タスクが未存在なら404。
- 新規id、createdAt、updatedAtを生成する。
- `title`、`description`、`priority`、`dueDate`、`category`（存在する場合）を複製する。
- statusは `TODO`、assigneeIdは未設定とする。
- 元タスクを変更しない。
