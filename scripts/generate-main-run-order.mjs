#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';

const seed = 20260716;
const repetitions = 3;
const targets = ['monolithic', 'layered', 'feature-based'];
const tasks = ['task-01', 'task-02', 'task-03', 'task-04', 'task-05', 'task-06'];
const baselineFor = (target, task) => `p1-${target}-v${task === 'task-01' ? '1.0.0' : '1.0.1'}`;

let state = seed;
const random = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 2 ** 32;
};

const conditions = Array.from({ length: repetitions }, (_, repetitionIndex) =>
  tasks.flatMap((task) => targets.map((target) => ({ task, target, run: repetitionIndex + 1 }))),
).flat();

for (let index = conditions.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(random() * (index + 1));
  [conditions[index], conditions[swapIndex]] = [conditions[swapIndex], conditions[index]];
}

const runs = conditions.map(({ task, target, run }, index) => {
  const taskNumber = task.slice(-2);
  const targetId = target === 'feature-based' ? 'FEATURE-BASED' : target.toUpperCase();
  const runId = String(run).padStart(2, '0');
  return {
    sequence: index + 1,
    experimentId: `P1-${targetId}-T${taskNumber}-R${runId}`,
    phase: 'p1',
    taskId: task,
    target,
    run,
    baselineTag: baselineFor(target, task),
    branch: `experiment/p1/${target}/${task}/r${runId}`,
    kind: 'main-experiment',
    includedInMainResults: true,
    runner: { isolation: 'separate clone and fresh session', model: null, reasoningLevel: null },
    evaluator: { isolation: 'separate clone and session from runner', independentFromRunner: true },
  };
});

const output = {
  schemaVersion: 1,
  status: 'ready-for-isolated-execution',
  randomSeed: seed,
  repetitionsPerCondition: repetitions,
  runCount: runs.length,
  constraints: {
    runnerCannotAccess: ['hidden-tests', 'results', 'other targets', 'dry-run branches'],
    evaluatorCannotModify: ['runner source code', 'runner result commit'],
  },
  runs,
};

await mkdir('experiments', { recursive: true });
await writeFile('experiments/phase1-main-run-order.json', `${JSON.stringify(output, null, 2)}\n`);
