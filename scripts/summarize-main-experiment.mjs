#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { format } from 'prettier';

const manifestPath = 'experiments/manifest.json';
const jsonOutputPath = 'results/summaries/main-experiment-summary.json';
const csvOutputPath = 'results/summaries/main-experiment-runs.csv';
const chartOutputPath = 'results/summaries/main-experiment-validation-rates.svg';
const changeScopeChartOutputPath = 'results/summaries/main-experiment-change-scope.svg';

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

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const percentage = (value) => `${(value * 100).toFixed(1)}%`;

const chartRows = (entries, top, title) => {
  const left = 240;
  const width = 520;
  const rowHeight = 34;
  const bars = Object.entries(entries)
    .map(([label, values], index) => {
      const y = top + 36 + index * rowHeight;
      const fullyValidatedWidth = width * values.fullyValidatedRate;
      const hiddenTestWidth = width * values.hiddenTestPassRate;
      return `
        <text x="${left - 12}" y="${y + 13}" text-anchor="end">${escapeXml(label)}</text>
        <rect x="${left}" y="${y}" width="${width}" height="12" fill="#e5e7eb" rx="2" />
        <rect x="${left}" y="${y}" width="${fullyValidatedWidth}" height="12" fill="#2563eb" rx="2" />
        <rect x="${left}" y="${y + 15}" width="${width}" height="12" fill="#e5e7eb" rx="2" />
        <rect x="${left}" y="${y + 15}" width="${hiddenTestWidth}" height="12" fill="#059669" rx="2" />
        <text x="${left + width + 12}" y="${y + 11}">${percentage(values.fullyValidatedRate)}</text>
        <text x="${left + width + 12}" y="${y + 26}">${percentage(values.hiddenTestPassRate)}</text>`;
    })
    .join('\n');

  return `<text class="section-title" x="40" y="${top}">${escapeXml(title)}</text>${bars}`;
};

const chart = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="760" viewBox="0 0 960 760" role="img" aria-labelledby="title description">
  <title id="title">Phase 1 main experiment validation rates</title>
  <desc id="description">54 Runの構成別および課題別の完全検証通過率と隠しテスト通過率。</desc>
  <style>
    text { fill: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; }
    .title { font-size: 22px; font-weight: 600; }
    .section-title { font-size: 17px; font-weight: 600; }
    .legend { font-size: 13px; }
  </style>
  <text class="title" x="40" y="40">Phase 1 main experiment: validation rates</text>
  <rect x="520" y="57" width="14" height="14" fill="#2563eb" rx="2" />
  <text class="legend" x="542" y="69">Fully validated</text>
  <rect x="680" y="57" width="14" height="14" fill="#059669" rx="2" />
  <text class="legend" x="702" y="69">Hidden test passed</text>
  ${chartRows(summary.byTarget, 112, 'By architecture (18 runs each)')}
  ${chartRows(summary.byTask, 290, 'By task (9 runs each)')}
  <text x="40" y="735" fill="#4b5563">Fully validated = build, typecheck, format, lint, public tests, and hidden tests all passed.</text>
</svg>`;

const scopeValues = Object.entries(summary.byTarget).map(([target, values]) => ({
  target,
  value: values.averageFilesChanged,
}));
const scopeMaximum = Math.max(...scopeValues.map((item) => item.value));
const scopeBars = scopeValues
  .map((item, index) => {
    const y = 130 + index * 70;
    const width = (item.value / scopeMaximum) * 540;
    return `
      <text x="230" y="${y + 17}" text-anchor="end">${escapeXml(item.target)}</text>
      <rect x="250" y="${y}" width="540" height="28" fill="#e5e7eb" rx="3" />
      <rect x="250" y="${y}" width="${width}" height="28" fill="#7c3aed" rx="3" />
      <text x="805" y="${y + 19}">${item.value.toFixed(2)} files</text>`;
  })
  .join('\n');
const changeScopeChart = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="410" viewBox="0 0 960 410" role="img" aria-labelledby="title description">
  <title id="title">Phase 1 main experiment change scope</title>
  <desc id="description">54 Runにおける構成別の平均変更ファイル数。</desc>
  <style>
    text { fill: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 15px; }
    .title { font-size: 22px; font-weight: 600; }
    .caption { fill: #4b5563; font-size: 13px; }
  </style>
  <text class="title" x="40" y="45">Phase 1 main experiment: average changed files</text>
  <text class="caption" x="40" y="75">A proxy for change scope, not a direct measure of exploration time.</text>
  ${scopeBars}
  <text class="caption" x="40" y="370">Each architecture has 18 runs. Higher values indicate that a completed task touched more files on average.</text>
</svg>`;

await mkdir(dirname(jsonOutputPath), { recursive: true });
await writeFile(
  jsonOutputPath,
  await format(JSON.stringify(summary), { parser: 'json', filepath: jsonOutputPath }),
);
await writeFile(chartOutputPath, chart);
await writeFile(changeScopeChartOutputPath, changeScopeChart);
await writeFile(
  csvOutputPath,
  `${csvColumns.join(',')}\n${runs
    .map((run) => {
      const row = toCsvRow(run);
      return csvColumns.map((column) => csvEscape(row[column])).join(',');
    })
    .join('\n')}\n`,
);
