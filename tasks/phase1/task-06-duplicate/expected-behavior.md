# Expected behavior

| Scenario           | Expected result            |
| ------------------ | -------------------------- |
| TODOタスクを複製   | 201、新しいid、status TODO |
| 元タスクの属性     | 複製後も変更されない       |
| 複製の担当者       | 未設定                     |
| 未存在タスクの複製 | 404                        |
