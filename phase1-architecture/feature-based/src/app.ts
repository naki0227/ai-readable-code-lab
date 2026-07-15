import Fastify from 'fastify';
import { registerTaskRoutes } from './tasks/routes.js';
export function buildApp() {
  const app = Fastify();
  registerTaskRoutes(app);
  return app;
}
