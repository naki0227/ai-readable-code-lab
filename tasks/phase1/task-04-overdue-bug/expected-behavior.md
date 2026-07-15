# Expected behavior

| Scenario            | Expected `isOverdue` |
| ------------------- | -------------------- |
| 過去期限のTODO      | true                 |
| 過去期限のCOMPLETED | false                |
| 未来期限のCOMPLETED | false                |
| 期限なしのTODO      | false                |
