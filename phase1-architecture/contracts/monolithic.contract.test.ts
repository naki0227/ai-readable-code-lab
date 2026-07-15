import { taskApiContract } from './task-api-contract.js';
import { buildApp } from '../monolithic/src/app.js';
taskApiContract('monolithic', buildApp);
