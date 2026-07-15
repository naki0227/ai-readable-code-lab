# Phase 1 共通仕様

3つのBaselineは、Node 22、TypeScript、Fastify、インメモリ保存、同一の公開APIを使用する。実験時に外部DB・認証・ネットワークは使用しない。

## Task

`id`, `title`, `description?`, `status`, `priority`, `dueDate?`, `assigneeId?`, `createdAt`, `updatedAt`, `isOverdue` を返す。status は `TODO` / `IN_PROGRESS` / `COMPLETED` / `ARCHIVED`、priority は `LOW` / `MEDIUM` / `HIGH`。

| Method | Path                  | 成功                  | 失敗                     |
| ------ | --------------------- | --------------------- | ------------------------ |
| POST   | `/tasks`              | 201                   | 空タイトルは400          |
| GET    | `/tasks`              | 200（ARCHIVEDを除外） | -                        |
| GET    | `/tasks/:id`          | 200                   | 未存在は404              |
| PATCH  | `/tasks/:id`          | 200                   | 空タイトル400、未存在404 |
| POST   | `/tasks/:id/complete` | 200                   | 二重完了409、未存在404   |

完了済み・アーカイブ済みは期限切れにしない。時刻はISO 8601、期限日は `YYYY-MM-DD` とする。

## 比較上の制約

公開テスト、依存バージョン、README情報量、CIコマンドを揃える。各実験は対応Baselineの固定タグから分岐し、実験PRをBaselineへマージしない。
