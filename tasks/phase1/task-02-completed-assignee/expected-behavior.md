# Expected behavior

| Scenario                   | Expected result           |
| -------------------------- | ------------------------- |
| TODOで`user-1`を設定       | 200、`assigneeId: user-1` |
| 完了後に`user-2`を設定     | 409、担当者変更不可エラー |
| 完了後にタイトルだけを更新 | 200                       |
| 未存在タスクへ担当者設定   | 404                       |
