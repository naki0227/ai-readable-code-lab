import { taskApiContract } from './task-api-contract.js';
import { buildApp } from '../feature-based/src/app.js';
taskApiContract('feature-based', buildApp);
