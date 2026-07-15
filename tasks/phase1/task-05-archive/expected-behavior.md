# Expected behavior

| Scenario                 | Expected result          |
| ------------------------ | ------------------------ |
| DELETEしたタスク         | 200、`ARCHIVED`          |
| 通常一覧                 | アーカイブ済みを含まない |
| 詳細取得                 | `ARCHIVED` を返す        |
| アーカイブ済みの過去期限 | `isOverdue: false`       |
