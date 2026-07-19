# 作業報告書: Phase 1可視化とQiita記事下書き

## 作業日時

2026年07月20日 00時26分58秒

## 作業対象

Phase 1本実験の集計結果、比較グラフ、Qiita記事下書き。

## 作業目的

54 Runの集計結果を読みやすく比較可能にし、実験条件・結果・制約を含む公開記事の初稿を作る。

## 変更内容

集計スクリプトから構成別・課題別の完全検証通過率と隠しテスト通過率、および構成別の平均変更ファイル数を描くSVGを生成するようにした。Qiita向けのMarkdown下書きは、タイトルを条件付きの比較表現へ変更し、実装能力（隠しテスト）と開発品質（完全検証）の二軸を先に定義した。

Task 05の契約不整合は結果の前に記載し、構成差として解釈しないことを明示した。成功例にはTask 03の公開PRと責務配置の差分を、失敗例にはTask 06の公開Evaluatorログと実際の型・重複ルートエラーを追加した。実行環境を偽装したスクリーンショットは作らず、追跡可能な公開ログを一次証跡としてリンクしている。

再集計ではTask 05除外後の完全検証通過率（monolithic 100%、feature-based 86.7%、layered 80.0%）と、構成別のformat・lint・typecheck・隠しテスト失敗数をJSONへ追加した。記事では観測値である平均変更ファイル数と、推測である探索負荷を明確に分けた。

## 変更したファイル

- `scripts/summarize-main-experiment.mjs`
- `results/summaries/main-experiment-validation-rates.svg`
- `results/summaries/main-experiment-change-scope.svg`
- `docs/articles/phase1-qiita-draft.md`
- `docs/TODO.md`
- `docs/reports/2026-07-20-phase1-visualization-article-report.md`

## 変更意図

グラフは集計JSONから毎回生成し、記事用の数値転記を手作業にしない。記事では完全検証通過率だけでなく隠しテスト通過率と失敗分類を併記し、Task 05の評価契約不整合を設計差と誤認しないようにする。

## 設計上の意図

SVGは外部ライブラリを使わず、既存の集計スクリプトで生成する。記事は結論を先に示すが、対象範囲・反復回数・未実施の人間評価を明記して過度な一般化を避ける。

## 影響範囲

実験コード、Baseline、Evaluator証跡は変更しない。集計の表示と公開用ドキュメントだけを追加する。

## 追加・更新したテスト

`npm run summarize:main-experiment` によりSVGを再生成し、54 Runの集計JSON/CSVと同じ入力から出力されることを確認した。

## 実行した確認コマンド

- `npm run summarize:main-experiment`
- `npm run validate`
- `git diff --check`

## CIで確認される内容

CIはtypecheck、format check、lint、test、buildを実行する。SVG生成は集計時の明示コマンドで確認する。

## 未解決の課題

- Qiita公開前に著者情報・タグ・代表PRリンクを最終確認する。
- 人間またはブラインド評価者の品質採点は未実施。
- Task 05の共有公開契約不整合は第2弾の前に解消する。

## 次にやること

Qiita投稿用に記事を最終編集し、必要なら代表PRへのリンクと著者コメントを追加する。第2弾の実験計画ではTask 05の契約を修正する。

## 次回最初に見るべきファイル

- `docs/articles/phase1-qiita-draft.md`
- `results/summaries/main-experiment-validation-rates.svg`
- `docs/PROJECT_PLAN.md`

## 引き継ぎ事項

記事の数値は `npm run summarize:main-experiment` の出力を正本とする。再集計前には実験ブランチをfetchする。
