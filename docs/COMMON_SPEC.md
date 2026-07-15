# Phase 1 共通仕様

3つのBaselineは、Node 22、TypeScript、Fastify、インメモリ保存、同一の公開APIを使用する。実験時に外部DB・認証・ネットワークは使用しない。

## Task

`id`, `title`, `description?`, `status`, `priority`, `dueDate?`, `assigneeId?`, `createdAt`, `updatedAt`, `isOverdue` を返す。status は `TODO` / `IN_PROGRESS` / `COMPLETED` / `ARCHIVED`、priority は `LOW` / `MEDIUM` / `HIGH`。

| Method | Path                  | 成功 | 失敗                     |
| ------ | --------------------- | ---- | ------------------------ |
| POST   | `/tasks`              | 201  | 空タイトルは400          |
| GET    | `/tasks`              | 200  | -                        |
| GET    | `/tasks/:id`          | 200  | 未存在は404              |
| PATCH  | `/tasks/:id`          | 200  | 空タイトル400、未存在404 |
| POST   | `/tasks/:id/complete` | 200  | 二重完了409、未存在404   |
| DELETE | `/tasks/:id`          | 204  | 未存在404                |

完了済み・アーカイブ済みは期限切れにしない。時刻はISO 8601、期限日は `YYYY-MM-DD` とする。

期限日が実行日の前の場合、作成・更新・取得レスポンスの `warnings` は `['due date is in the past']` となる。これは保存を拒否するエラーではない。

`phase1-architecture/contracts/` の契約テストは上記の作成、更新、完了、削除、エラー応答、担当者検証を全構成に対して検証する。

担当者は `PATCH /tasks/:id` の `assigneeId` で設定する。Baselineに存在する担当者は `user-1` と `user-2` のみで、その他は404を返す。

## 比較上の制約

公開テスト、依存バージョン、README情報量、CIコマンドを揃える。各実験は対応Baselineの固定タグから分岐し、実験PRをBaselineへマージしない。
