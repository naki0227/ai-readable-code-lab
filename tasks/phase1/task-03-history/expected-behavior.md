# Expected behavior

| Scenario               | Expected result           |
| ---------------------- | ------------------------- |
| 新規作成直後の履歴     | `CREATED` 1件             |
| タイトル更新           | `UPDATED` を追記          |
| 担当者設定             | `ASSIGNEE_CHANGED` を追記 |
| 完了                   | `COMPLETED` を追記        |
| 未存在タスクの履歴取得 | 404                       |
