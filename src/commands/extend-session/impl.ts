import * as p from '@clack/prompts';
import { readConfig, resolveProject, resolveApp } from '../../lib/config.js';
import { decodeJwtPayload } from '../../lib/jwt.js';
import { createSessionToken } from '../../lib/clerk.js';

export interface ExtendSessionOptions {
  project?: string;
  app?: string;
}

export async function extendSession(token: string, opts: ExtendSessionOptions = {}): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, opts.project);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  const appName = resolveApp(project, opts.app);
  const app = project.apps[appName];
  if (!app) {
    p.log.error(`App "${appName}" not found in project "${projectName}".`);
    process.exit(1);
  }
  if (!app.secret_key) {
    p.log.error(`App "${appName}" has no secret_key configured. Run \`app add ${appName} --secret-key=sk_...\`.`);
    process.exit(1);
  }

  let payload: Record<string, unknown>;
  try {
    payload = decodeJwtPayload(token);
  } catch (err) {
    p.log.error(`Failed to decode session token: ${String(err)}`);
    process.exit(1);
  }

  const sessionId = payload['sid'];
  if (typeof sessionId !== 'string' || !sessionId) {
    p.log.error(`Session token does not contain a valid "sid" field.`);
    process.exit(1);
  }

  const spinner = p.spinner();
  spinner.start('Extending session...');
  try {
    const result = await createSessionToken(app.secret_key, sessionId, 2 * 24 * 60 * 60);
    spinner.stop('Session extended.');
    process.stdout.write(`\n> ${result.jwt}\n`);
  } catch (err) {
    spinner.stop('Failed.');
    p.log.error(String(err));
    process.exit(1);
  }
}
