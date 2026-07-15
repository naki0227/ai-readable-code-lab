GitHub公開・Before／After比較計画

1. 公開方針

本プロジェクトでは、完成後のコードだけでなく、AIが変更する前後の状態、変更差分、実行ログ、評価結果をGitHub上で公開する。

読者が以下を簡単に確認できる状態を目指す。

* AIへ渡す前のコード
* AIが変更した後のコード
* 実際に変更されたファイル
* 追加・削除されたコード
* AIへ与えた課題文
* AIが実行したコマンド
* 公開テストと隠しテストの結果
* 採点結果
* 同一課題における設計間・言語間の差
* 同一条件を複数回実行した場合の出力差

BeforeとAfterの比較には、GitHubのPull RequestおよびCompare画面を利用する。

⸻

2. 最重要ルール

各課題は必ず同じBaselineから開始する

課題1のAfterを課題2のBeforeとして使用してはならない。

悪い例：

Baseline
  ↓
課題1の変更
  ↓
課題2の変更
  ↓
課題3の変更

この方式では、後の課題ほど以前のAI生成コードの影響を受ける。

正しい方式：

                    ┌─ 課題1 Run 1
                    ├─ 課題1 Run 2
Baseline ───────────├─ 課題1 Run 3
                    ├─ 課題2 Run 1
                    ├─ 課題2 Run 2
                    └─ 課題2 Run 3

すべての実験ブランチを、対応するBaselineの同一コミットから作成する。

これにより、各課題と各試行を独立した実験として扱える。

⸻

3. リポジトリ構成

ai-readable-code-experiment/
├── README.md
├── LICENSE
├── CONTRIBUTING.md
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── COMMON_SPEC.md
│   ├── EXPERIMENT_PROTOCOL.md
│   ├── EVALUATION_RULES.md
│   ├── REPRODUCTION_GUIDE.md
│   ├── MODEL_CONFIGURATION.md
│   └── LIMITATIONS.md
│
├── phase1-architecture/
│   ├── monolithic/
│   ├── layered/
│   └── feature-based/
│
├── phase2-languages/
│   ├── python/
│   ├── typescript/
│   ├── go/
│   └── rust/
│
├── tasks/
│   ├── phase1/
│   │   ├── task-01-category/
│   │   │   ├── README.md
│   │   │   ├── prompt.md
│   │   │   ├── specification.md
│   │   │   └── expected-behavior.md
│   │   └── ...
│   └── phase2/
│
├── experiments/
│   ├── manifest.json
│   ├── phase1/
│   └── phase2/
│
├── results/
│   ├── raw/
│   ├── normalized/
│   ├── summaries/
│   └── figures/
│
├── hidden-tests/
│   ├── phase1/
│   └── phase2/
│
├── scripts/
│   ├── create-experiment-branch
│   ├── reset-to-baseline
│   ├── validate-baseline
│   ├── run-public-tests
│   ├── run-hidden-tests
│   ├── collect-git-metrics
│   ├── collect-agent-log
│   ├── generate-comparison-page
│   └── aggregate-results
│
└── articles/
    ├── phase1-draft.md
    └── phase2-draft.md

実際のソースコードは各フェーズのディレクトリへ置く。

experiments/には、ソースコードのコピーではなく、実験ID、ブランチ、コミット、PR、結果ファイルなどのメタデータを保存する。

⸻

4. Baselineブランチ

各比較対象について、変更前の状態を保持するBaselineブランチを作成する。

第1弾

baseline/p1-monolithic
baseline/p1-layered
baseline/p1-feature-based

第2弾

baseline/p2-python
baseline/p2-typescript
baseline/p2-go
baseline/p2-rust

Baseline完成時には、ブランチだけでなくタグも付ける。

p1-monolithic-v1.0.0
p1-layered-v1.0.0
p1-feature-based-v1.0.0
p2-python-v1.0.0
p2-typescript-v1.0.0
p2-go-v1.0.0
p2-rust-v1.0.0

タグを付けたBaselineは、実験開始後に変更しない。

不具合が発覚してBaselineを修正する場合は、既存タグを動かさず、新しいバージョンを作る。

p1-monolithic-v1.0.1

異なるBaselineバージョンの結果は、同じ集計へ混ぜない。

⸻

5. 実験ブランチ

命名規則は以下とする。

experiment/{phase}/{target}/{task}/{run}

例：

experiment/p1/monolithic/task-01/run-01
experiment/p1/layered/task-01/run-01
experiment/p1/feature-based/task-01/run-01
experiment/p2/python/task-03/run-02
experiment/p2/typescript/task-03/run-02
experiment/p2/go/task-03/run-02
experiment/p2/rust/task-03/run-02

各ブランチは必ず対応するBaselineのタグまたは固定コミットから作成する。

例：

git switch --detach p1-monolithic-v1.0.0
git switch -c experiment/p1/monolithic/task-01/run-01

人間が実験開始後にコードを修正してはならない。

実験環境の準備、ログ保存、結果ファイルの追加だけは、自動スクリプトによって行う。

⸻

6. Pull RequestによるBefore／After表示

各実験につき、1つのPull Requestを作成する。

PRのBase

対応するBaselineブランチを指定する。

PRのHead

AIが変更した実験ブランチを指定する。

例：

Base:
baseline/p1-monolithic
Head:
experiment/p1/monolithic/task-01/run-01

これにより、GitHubの「Files changed」で、AIがBaselineから何を変更したかをそのまま確認できる。

実験用PRはBaselineへマージしない。

評価完了後は、以下のいずれかにする。

* Openのまま保持する
* experiment-completedラベルを付けてCloseする
* Closeするがマージしない

推奨は、評価完了後にCloseし、マージしない運用である。

PRをマージするとBaselineが変更され、次の実験条件が崩れるためである。

⸻

7. PRタイトルの命名規則

[P1][Monolithic][Task 01][Run 01] Add task category
[P1][Layered][Task 03][Run 02] Add task history
[P2][Rust][Task 07][Run 03] Support optional assignee

タイトルだけで以下が分かるようにする。

* フェーズ
* 設計または言語
* 課題番号
* 試行回数
* 課題概要

⸻

8. PR本文テンプレート

## Experiment
| Item | Value |
|---|---|
| Experiment ID | P1-MONOLITHIC-T01-R01 |
| Phase | Phase 1: Architecture |
| Target | Monolithic |
| Task | Task 01: Add category |
| Run | 01 |
| Baseline tag | p1-monolithic-v1.0.0 |
| Baseline commit | `{commit hash}` |
| Model | GPT-5.6 Terra |
| Reasoning level | `{reasoning level}` |
| Execution environment | Codex |
| Started at | `{ISO 8601 timestamp}` |
| Finished at | `{ISO 8601 timestamp}` |
## Task given to the AI
課題文を省略せず、そのまま記載する。
## Conditions
- The AI could inspect the entire repository.
- The AI could edit files and execute commands.
- The AI could access public tests.
- The AI could not access hidden tests.
- No human code corrections were made after execution.
- This branch started from the baseline commit shown above.
## Before
- Baseline branch: `baseline/p1-monolithic`
- Baseline tag: `p1-monolithic-v1.0.0`
- Baseline commit: `{commit hash}`
## After
- Experiment branch: `experiment/p1/monolithic/task-01/run-01`
- Result commit: `{commit hash}`
## Automated result
| Check | Result |
|---|---:|
| Build | PASS / FAIL |
| Type check | PASS / FAIL |
| Lint | PASS / FAIL |
| Public tests | 00 / 00 |
| Hidden tests | 00 / 00 |
| Existing tests broken | 0 |
| Files changed | 0 |
| Lines added | 0 |
| Lines deleted | 0 |
| Commands executed | 0 |
| Test runs | 0 |
| Correction loops | 0 |
## Evaluation
| Category | Score |
|---|---:|
| Requirement satisfaction | 0 / 25 |
| Hidden tests | 0 / 20 |
| Regression prevention | 0 / 15 |
| Responsibility placement | 0 / 10 |
| Architectural consistency | 0 / 10 |
| Minimal changes | 0 / 10 |
| Added tests | 0 / 5 |
| Naming and readability | 0 / 5 |
| Total | 0 / 100 |
## Failure classification
成功した場合は `None` とする。
失敗した場合は、事前に定義した分類から選択する。
## Agent report
AIが作業完了時に出力した報告を、編集せず掲載する。
## Notes
実験者による観察を書く。
AIのコードを後から修正したり、実験結果を改善したりしてはならない。

⸻

9. 課題ごとの比較ページ

各課題に専用のREADMEを作る。

例：

tasks/phase1/task-01-category/README.md

内容：

# Task 01: Add category
## Requirement
タスクにcategoryを追加し、作成・更新・取得APIで扱えるようにする。
## Purpose
局所的な属性追加において、設計構造がAIの変更漏れへ与える影響を確認する。
## Comparison
| Architecture | Run | Before | After | Diff | PR | Score | Hidden tests |
|---|---:|---|---|---|---|---:|---:|
| Monolithic | 1 | Link | Link | Link | Link | 92 | 10/10 |
| Monolithic | 2 | Link | Link | Link | Link | 84 | 9/10 |
| Monolithic | 3 | Link | Link | Link | Link | 95 | 10/10 |
| Layered | 1 | Link | Link | Link | Link | 88 | 10/10 |
| Feature-based | 1 | Link | Link | Link | Link | 96 | 10/10 |
## Summary
- Highest average score:
- Lowest exploration cost:
- Fewest missed files:
- Most common failure:

読者は記事からこのページへ移動し、同一課題の全条件を横並びで確認できる。

⸻

10. Beforeリンク

Beforeは、Baselineタグの固定コミットへリンクする。

ブランチへのリンクだけでは、後から状態が変わる可能性があるため、記事や比較表からは原則としてタグまたはコミットへリンクする。

表示名の例：

Before: p1-monolithic-v1.0.0

⸻

11. Afterリンク

Afterは、各実験の最終コミットへリンクする。

表示名の例：

After: P1-MONOLITHIC-T01-R01 result

AIが複数回コミットした場合も、最終コミットだけでなく、ブランチのコミット履歴を残す。

可能であれば、AIの作業を以下のように分ける。

1. 実装コミット
2. テスト追加コミット
3. AIによる修正コミット

ただし、コミット方法をAIへ強く指定すると実験結果へ影響する可能性がある。

本実験ではAIの自然な作業を優先し、実験終了時に自動処理で結果保存コミットを作る方法でもよい。

⸻

12. Diffリンク

各行に次の3種類を用意する。

全体差分

BaselineとAfterの全変更を表示する。

Baseline commit ... After commit

Pull Request

会話、評価、CI結果を含む比較ページとして使用する。

Raw patch

GitHub外でも解析できるよう、差分をpatch形式で保存する。

results/raw/P1-MONOLITHIC-T01-R01/changes.patch

patchは以下のように生成する。

git diff \
  p1-monolithic-v1.0.0...experiment/p1/monolithic/task-01/run-01 \
  > results/raw/P1-MONOLITHIC-T01-R01/changes.patch

⸻

13. 実験結果ディレクトリ

各実験について、次の形式で保存する。

results/raw/P1-MONOLITHIC-T01-R01/
├── metadata.json
├── prompt.md
├── agent-final-report.md
├── agent-log.jsonl
├── commands.log
├── changed-files.txt
├── changes.patch
├── git-stat.txt
├── public-test-result.txt
├── hidden-test-result.txt
├── typecheck-result.txt
├── lint-result.txt
├── evaluation.json
└── notes.md

metadata.json

{
  "experimentId": "P1-MONOLITHIC-T01-R01",
  "phase": 1,
  "targetType": "architecture",
  "target": "monolithic",
  "taskId": "task-01",
  "run": 1,
  "model": "gpt-5.6-terra",
  "reasoningLevel": "high",
  "environment": "codex",
  "baselineTag": "p1-monolithic-v1.0.0",
  "baselineCommit": "",
  "resultCommit": "",
  "pullRequest": "",
  "startedAt": "",
  "finishedAt": "",
  "humanCodeCorrections": false
}

利用できない指標は推測せず、nullとして記録する。

⸻

14. 読者向けのトップページ

リポジトリのトップREADMEには、実装方法より先に比較への入口を置く。

# Human-Readable Code vs AI-Readable Code
人間に読みやすいコードは、AIにも変更しやすいのかを検証するプロジェクトです。
## Experiments
### Phase 1: Architecture
| Task | Monolithic | Layered | Feature-based | Summary |
|---|---|---|---|---|
| 01 Category | Results | Results | Results | Comparison |
| 02 Business rule | Results | Results | Results | Comparison |
| 03 History | Results | Results | Results | Comparison |
### Phase 2: Language
| Task | Python | TypeScript | Go | Rust | Summary |
|---|---|---|---|---|---|
| 01 Category | Results | Results | Results | Results | Comparison |
## How to read
1. 課題を選ぶ
2. 各条件のPRを開く
3. Files changedでBefore／Afterを確認する
4. CIと隠しテスト結果を確認する
5. 同じ課題の別構成または別言語と比較する

読者がディレクトリを探索しなくても、2〜3クリックで任意の差分へ到達できる状態にする。

⸻

15. CI表示

各実験ブランチおよびPRで、GitHub Actionsを実行する。

表示するチェック：

build
typecheck
lint
public-tests
baseline-regression

隠しテストは、実験中にAIから参照できない環境で実行する。

実験完了後、結果だけをPRへ反映する。

隠しテストのコード自体は、すべての本実験が終了するまで公開しない。

実験終了後、再現性確保のために隠しテストを公開する。その際、公開日と、実験時にはAIからアクセスできなかったことを明記する。

⸻

16. AIへ作らせる範囲

Codexには以下を作成させる。

企画・仕様

* プロジェクト計画書のファイル化
* 共通仕様書
* API仕様書
* 実験手順書
* 評価基準
* 課題定義
* ログ形式
* 再現手順

第1弾の実装

* TypeScript基準実装
* モノリシック構成
* レイヤー分割構成
* 機能単位構成
* 公開テスト
* 隠しテスト
* 検証スクリプト

実験基盤

* Baseline検証
* ブランチ生成スクリプト
* 結果収集スクリプト
* Git差分収集
* テスト結果収集
* 集計処理
* README比較表生成
* PRテンプレート
* GitHub Actions

第2弾の実装

* Python版
* TypeScript版
* Go版
* Rust版
* 言語別テスト
* 共通外部仕様検証

記事支援

* 結果CSV
* グラフ生成
* 成功例と失敗例の抽出
* Qiita記事の下書き

⸻

17. AIへ一度に実験まで実行させない

最初のCodexタスクでは、以下までを作成する。

1. 計画書と仕様書
2. リポジトリ構造
3. 第1弾の3つのBaseline
4. 公開テスト
5. 隠しテスト
6. 実験自動化基盤
7. サンプル実験用のDry Run
8. 読者向けREADME
9. PRテンプレート
10. CI

本実験はBaselineと評価方法を確認した後、別セッションで実施する。

理由は、Baselineを作成した同じ会話コンテキストで実験を実行すると、AIが設計意図や隠しテストの内容を知った状態になり、公平な比較にならないためである。

⸻

18. コンテキスト分離

最低でも以下の役割を分離する。

Builder

Baseline、公開テスト、隠しテスト、実験基盤を作る。

Runner

課題文と対象Baselineだけを受け取り、実装する。

Runnerは以下へアクセスできない。

* 隠しテスト
* 他構成の実験結果
* 他Runの結果
* 採点結果
* 記事の予想結論

Evaluator

実験後に隠しテストと採点を実行する。

RunnerとEvaluatorは別セッションにする。

同じモデルを使用してもよいが、コンテキストは共有しない。

⸻

19. AI生成コードであることの記録

各PRに以下を明記する。

This change was generated by an AI coding agent as part of a controlled experiment.
No human code correction was applied after the agent completed the task.

人間が修正した場合は、その実験結果を通常の本実験へ含めない。

環境上の問題だけを人間が修正した場合も、何を変更したか記録する。

⸻

20. 比較の単位

記事では3段階で比較する。

課題単位

同一課題における構成または言語の差を確認する。

実験単位

同じ条件を複数回実行した際のばらつきを確認する。

集計単位

全課題を通した平均、中央値、成功率、失敗分類を確認する。

1つの代表的なPRだけで結論を出さず、全試行へのリンクを掲載する。

⸻

21. GitHub上の表示イメージ

Task 03: Add operation history
│
├── Monolithic
│   ├── Run 01 → PR #21 → Score 78
│   ├── Run 02 → PR #22 → Score 84
│   └── Run 03 → PR #23 → Score 69
│
├── Layered
│   ├── Run 01 → PR #24 → Score 91
│   ├── Run 02 → PR #25 → Score 88
│   └── Run 03 → PR #26 → Score 94
│
└── Feature-based
    ├── Run 01 → PR #27 → Score 96
    ├── Run 02 → PR #28 → Score 93
    └── Run 03 → PR #29 → Score 95

各PRを開くと、次が確認できる。

Conversation → 実験条件と評価
Commits      → AIの変更履歴
Checks       → 自動テスト結果
Files changed → Before／After

⸻

22. 完了条件

GitHub公開部分について、以下を満たした時点で完了とする。

* すべてのBaselineに固定タグがある
* 各実験がBaselineから独立して分岐している
* 各実験にPRまたはCompareリンクがある
* 各PRから課題文を確認できる
* BeforeとAfterのコミットが固定されている
* 差分patchが保存されている
* 公開テストと隠しテストの結果がある
* 人間による修正の有無が記録されている
* 同一課題の全条件を一覧比較できる
* トップREADMEから各課題へ移動できる
* 記事から代表例だけでなく全データへ到達できる
* 実験終了後に再現手順と隠しテストを公開できる