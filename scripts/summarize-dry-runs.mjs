#!/usr/bin/env node
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const summariesDirectory = 'results/summaries';
const outputFile = join(summariesDirectory, 'dry-run-overview.json');

const summaryFiles = (await readdir(summariesDirectory))
  .filter((file) => /^task-\d\d-dry-run-evaluation\.json$/.test(file))
  .sort();

const taskSummaries = await Promise.all(
  summaryFiles.map(async (file) =>
    JSON.parse(await readFile(join(summariesDirectory, file), 'utf8')),
  ),
);

const runs = taskSummaries.flatMap((summary) =>
  summary.runs.map((run) => ({ taskId: summary.taskId, ...run })),
);
const allPublicTestsPassed = runs.every((run) =>
  typeof run.publicTests === 'string'
    ? /^\d+\/\d+$/.test(run.publicTests) &&
      run.publicTests.split('/')[0] === run.publicTests.split('/')[1]
    : run.publicTests.passed === run.publicTests.total,
);

const overview = {
  kind: 'dry-run-overview',
  includedInMainResults: false,
  taskCount: taskSummaries.length,
  runCount: runs.length,
  publicTests: allPublicTestsPassed ? 'ALL_PASS' : 'NOT_ALL_PASS',
  hiddenTests: runs.every((run) => run.hiddenTests === 'PASS') ? 'ALL_PASS' : 'NOT_ALL_PASS',
  scoredRunCount: runs.filter((run) => run.score !== null).length,
  unscoredRunCount: runs.filter((run) => run.score === null).length,
  targets: [
    ...new Set(
      runs.map((run) => {
        const target = run.experimentId.split('-')[1].toLowerCase();
        return target === 'feature' ? 'feature-based' : target;
      }),
    ),
  ].sort(),
  taskSummaries: taskSummaries.map((summary) => ({
    taskId: summary.taskId,
    runCount: summary.runs.length,
    includedInMainResults: summary.includedInMainResults,
  })),
};

await writeFile(outputFile, `${JSON.stringify(overview, null, 2)}\n`);
