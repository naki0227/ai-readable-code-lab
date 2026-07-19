#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { format } from 'prettier';

const manifestPath = 'experiments/manifest.json';
const jsonOutputPath = 'results/summaries/main-experiment-summary.json';
const csvOutputPath = 'results/summaries/main-experiment-runs.csv';

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const mainRuns = manifest.experiments.filter(
  (experiment) => experiment.kind === 'main-experiment' && experiment.includedInMainResults,
);

const readEvaluation = (experiment) => {
  const artifactPath = `results/raw/${experiment.experimentId}/evaluation.json`;
  const ref = `origin/${experiment.branch}`;

  try {
    return JSON.parse(
      execFileSync('git', ['show', `${ref}:${artifactPath}`], { encoding: 'utf8' }),
    );
  } catch (error) {
    throw new Error(
      `評価証跡を取得できません: ${experiment.experimentId} (${ref}:${artifactPath})。` +
        ' 先に実験ブランチをfetchしてください。',
      { cause: error },
    );
  }
};

const asRate = (checks) => ({
  passed: checks.passed,
  total: checks.total,
  rate: checks.total === 0 ? null : checks.passed / checks.total,
});

const isPassed = (check) => check?.passed === check?.total;
const isFullyValidated = (evaluation) => {
  const checks = evaluation.automatedChecks;
  return (
    checks.build === true &&
    checks.typecheck === true &&
    checks.format === true &&
    checks.lint === true &&
    isPassed(checks.publicTests) &&
    isPassed(checks.hiddenTests)
  );
};

const runs = mainRuns.map((experiment) => {
  const evaluation = readEvaluation(experiment);
  const checks = evaluation.automatedChecks;

  return {
    experimentId: experiment.experimentId,
    target: experiment.target,
    taskId: experiment.taskId,
    run: Number(experiment.experimentId.match(/-R(\d+)$/)?.[1]),
    pullRequest: experiment.pullRequest,
    runnerResultCommit: experiment.runnerResultCommit,
    evaluatorResultCommit: experiment.resultCommit,
    humanCodeCorrections: evaluation.notes?.includes('parent formatting correction') ?? false,
    fullyValidated: isFullyValidated(evaluation),
    automatedChecks: {
      build: checks.build,
      typecheck: checks.typecheck,
      format: checks.format,
      lint: checks.lint,
      publicTests: asRate(checks.publicTests),
      hiddenTests: asRate(checks.hiddenTests),
    },
    metrics: evaluation.metrics,
    failureClassification: evaluation.failureClassification,
  };
});

const summarize = (items) => {
  const total = items.length;
  const sum = (selector) => items.reduce((value, item) => value + selector(item), 0);
  const count = (predicate) => items.filter(predicate).length;

  return {
    runCount: total,
    fullyValidatedRunCount: count((item) => item.fullyValidated),
    fullyValidatedRate: total === 0 ? null : count((item) => item.fullyValidated) / total,
    hiddenTestPassCount: count((item) => isPassed(item.automatedChecks.hiddenTests)),
    hiddenTestPassRate:
      total === 0 ? null : count((item) => isPassed(item.automatedChecks.hiddenTests)) / total,
    publicTestPassCount: count((item) => isPassed(item.automatedChecks.publicTests)),
    publicTestPassRate:
      total === 0 ? null : count((item) => isPassed(item.automatedChecks.publicTests)) / total,
    averageFilesChanged: total === 0 ? null : sum((item) => item.metrics.filesChanged ?? 0) / total,
    averageLinesAdded: total === 0 ? null : sum((item) => item.metrics.linesAdded ?? 0) / total,
    averageLinesDeleted: total === 0 ? null : sum((item) => item.metrics.linesDeleted ?? 0) / total,
  };
};

const groupBy = (items, selector) =>
  Object.fromEntries(
    [...new Set(items.map(selector))]
      .sort()
      .map((key) => [key, summarize(items.filter((item) => selector(item) === key))]),
  );

const failureClassifications = Object.fromEntries(
  [...new Set(runs.flatMap((run) => run.failureClassification))]
    .sort()
    .map((classification) => [
      classification,
      runs.filter((run) => run.failureClassification.includes(classification)).length,
    ]),
);

const summary = {
  kind: 'main-experiment-summary',
  phase: 'p1',
  generatedFrom: {
    manifest: manifestPath,
    evaluatorArtifacts: 'origin/<experiment branch>:results/raw/<experiment id>/evaluation.json',
  },
  runCount: runs.length,
  overall: summarize(runs),
  byTarget: groupBy(runs, (run) => run.target),
  byTask: groupBy(runs, (run) => run.taskId),
  failureClassifications,
  runs,
};

const csvEscape = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const csvColumns = [
  'experimentId',
  'target',
  'taskId',
  'run',
  'fullyValidated',
  'build',
  'typecheck',
  'format',
  'lint',
  'publicTestsPassed',
  'publicTestsTotal',
  'hiddenTestsPassed',
  'hiddenTestsTotal',
  'filesChanged',
  'linesAdded',
  'linesDeleted',
  'failureClassification',
  'pullRequest',
];

const toCsvRow = (run) => ({
  experimentId: run.experimentId,
  target: run.target,
  taskId: run.taskId,
  run: run.run,
  fullyValidated: run.fullyValidated,
  build: run.automatedChecks.build,
  typecheck: run.automatedChecks.typecheck,
  format: run.automatedChecks.format,
  lint: run.automatedChecks.lint,
  publicTestsPassed: run.automatedChecks.publicTests.passed,
  publicTestsTotal: run.automatedChecks.publicTests.total,
  hiddenTestsPassed: run.automatedChecks.hiddenTests.passed,
  hiddenTestsTotal: run.automatedChecks.hiddenTests.total,
  filesChanged: run.metrics.filesChanged,
  linesAdded: run.metrics.linesAdded,
  linesDeleted: run.metrics.linesDeleted,
  failureClassification: run.failureClassification.join('; '),
  pullRequest: run.pullRequest,
});

await mkdir(dirname(jsonOutputPath), { recursive: true });
await writeFile(
  jsonOutputPath,
  await format(JSON.stringify(summary), { parser: 'json', filepath: jsonOutputPath }),
);
await writeFile(
  csvOutputPath,
  `${csvColumns.join(',')}\n${runs
    .map((run) => {
      const row = toCsvRow(run);
      return csvColumns.map((column) => csvEscape(row[column])).join(',');
    })
    .join('\n')}\n`,
);
