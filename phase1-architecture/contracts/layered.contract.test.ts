import { taskApiContract } from './task-api-contract.js';
import { buildApp } from '../layered/src/app.js';
taskApiContract('layered', buildApp);
