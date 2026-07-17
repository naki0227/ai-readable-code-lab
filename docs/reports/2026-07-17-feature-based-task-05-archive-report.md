# 作業報告書

## 作業日時

2026年07月17日 21時19分43秒

## 作業対象

`phase1-architecture/feature-based` のタスク削除API。

## 作業目的

`DELETE /tasks/:id` を物理削除ではなくアーカイブへ変更する。

## 変更内容

DELETE時にタスクの `status` を `ARCHIVED` に更新して200で返すようにした。アーカイブ済みタスクは一覧から除外され、詳細取得では保持される。アーカイブ済みは過去の期限日を持っていても `isOverdue: false` を返す。

## 変更したファイル

`phase1-architecture/feature-based/src/tasks/task.ts`、`phase1-architecture/feature-based/src/tasks/routes.ts`、`phase1-architecture/feature-based/tests/app.test.ts`、`docs/TODO.md`。

## 変更意図

削除操作の履歴とタスク詳細を保持しつつ、通常の一覧には表示しないため。

## 設計上の意図

保存済みタスクの状態遷移はルートで管理し、一覧の公開条件とレスポンス上の期限判定は既存の責務分離を維持した。物理削除は行わない。

## 影響範囲

feature-based構成のDELETEレスポンスと、アーカイブ済みタスクの期限判定のみ。ほかの構成と共通契約は変更していない。

## 追加・更新したテスト

feature-basedのAPIテストに、200/`ARCHIVED`応答、一覧除外、詳細取得保持、アーカイブ済みの期限切れ抑止、未存在IDの404を追加した。

## 実行した確認コマンド

`npm ci`、`npm test -- --run phase1-architecture/feature-based/tests/app.test.ts`、`npm run validate`、`npm run build`、`npm run format:check`、`git diff --check` を実行した。対象テスト、build、format check、差分チェックは通過した。`npm run validate` はtypecheck、format check、lintまで通過し、全体テストでは旧共通契約のDELETE=204期待と今回のfeature-basedの200応答が衝突して1件失敗した。buildは単独実行で通過した。

## CIで確認される内容

typecheck、format check、lint、test、build。

## 未解決の課題

共通契約はDELETEの204を前提としており、feature-basedのみを変更する今回の要件とは一致しない。そのため全体検証では当該既存契約テストの失敗が見込まれる。

## 次にやること

実験全体で同じアーカイブ契約を採用する場合は、共通仕様・契約テストと他構成を別タスクで整合させる。

## 次回最初に見るべきファイル

`phase1-architecture/feature-based/src/tasks/routes.ts`、`docs/COMMON_SPEC.md`、`phase1-architecture/contracts/task-api-contract.ts`。

## 引き継ぎ事項

今回は利用者指定どおりfeature-basedのみを変更した。共通契約と他構成は意図的に未変更である。
