# 作業報告書

## 作業日時

2026年07月17日 22時01分10秒

## 作業対象

`phase1-architecture/monolithic` の完了済みタスクに対する `PATCH /tasks/:id`。

## 作業目的

完了済みタスクの担当者変更を409で拒否し、タイトルのみの更新と未存在タスクの404を維持する。

## 変更内容

完了済みタスクへの `assigneeId` を含むPATCHを、担当者の存在検証や更新前に409で拒否するガードを追加した。タイトルのみのPATCHは従来どおり更新できる。APIテストで拒否、許可、未存在を確認した。

## 変更したファイル

- `phase1-architecture/monolithic/src/app.ts`
- `phase1-architecture/monolithic/tests/app.test.ts`
- `docs/TODO.md`
- `docs/reports/2026-07-17-monolithic-task-02-report.md`

## 変更意図

完了済みタスクの担当者を後から変更できないようにし、状態確定後の担当責任が変わることを防ぐ。

## 設計上の意図

既存のFastify・インメモリ構成を維持し、ルート内の既存バリデーション順序で実装した。タスクの存在を最初に確認するため、未存在時は常に404となる。新規依存や構造変更は不要で、テストはHTTP API境界で振る舞いを検証する。

## 影響範囲

monolithic構成の完了済みタスクに対する担当者を含むPATCHのみ。作成、一覧、取得、完了、削除は変更なし。

## 追加・更新したテスト

- 完了済みタスクの担当者更新が409になること
- 完了済みタスクのタイトルのみ更新が200になること
- 未存在タスクへの担当者更新が404になること

## 実行した確認コマンド

- `npm ci`（lockfile固定の211パッケージを導入）
- `npx prettier --write phase1-architecture/monolithic/tests/app.test.ts`
- `npm run validate`（typecheck、format check、lint、Vitest 9件、buildがすべて成功）

## CIで確認される内容

GitHub ActionsでNode 22上の typecheck、Prettier check、ESLint、Vitest、TypeScript buildを実行する。

## 未解決の課題

なし。

## 次にやること

次の割り当て済み実験タスクに着手する。

## 次回最初に見るべきファイル

`docs/TODO.md` と対象タスクのプロンプト。

## 引き継ぎ事項

担当者を含む完了済みタスクのPATCHは409、タイトルのみのPATCHは200というTask 02の契約を維持する。
