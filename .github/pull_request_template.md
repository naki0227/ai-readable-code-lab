## Experiment

| Item            | Value                                |
| --------------- | ------------------------------------ |
| Experiment ID   | `P1-TARGET-TXX-RXX`                  |
| Kind            | Main experiment / Dry run            |
| Phase           | Phase 1: Architecture                |
| Target          | Monolithic / Layered / Feature-based |
| Task            | Task ID and name                     |
| Run             | `01`                                 |
| Baseline tag    | `p1-target-v1.0.0`                   |
| Baseline commit | commit SHA                           |
| Result commit   | commit SHA                           |
| Model           | model identifier                     |
| Reasoning level | configured level                     |
| Environment     | Runner / Evaluator environment       |
| Started at      | ISO 8601                             |
| Finished at     | ISO 8601                             |

## Task given to the Runner

<!-- Paste the complete task prompt without editing it. -->

## Conditions

- [ ] Branch was created from the stated immutable Baseline tag.
- [ ] Runner could access the target code and public tests only.
- [ ] Runner could not access `hidden-tests/`, other runs, scores, or expected conclusions.
- [ ] No human code correction was made after the Runner completed.
- [ ] This branch will not be merged into a Baseline branch.

## Automated results

| Check                 | Result                   |
| --------------------- | ------------------------ |
| Build                 | PASS / FAIL              |
| Type check            | PASS / FAIL              |
| Format                | PASS / FAIL              |
| Lint                  | PASS / FAIL              |
| Public tests          | `00 / 00`                |
| Hidden tests          | `00 / 00` or unavailable |
| Files changed         | `0`                      |
| Lines added / deleted | `0 / 0`                  |

## Evaluation

Link the committed `evaluation.json` and state the total score, or `null` when no independent evaluation occurred.

## Failure classification

`None` or one or more categories from `docs/EVALUATION_RULES.md`.

## Runner report

<!-- Paste the Runner's final report without editing it. -->

## Evaluator notes

<!-- Record observed evidence. Do not modify Runner source code. -->
