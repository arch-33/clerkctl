import * as p from '@clack/prompts';
import { readConfig, resolveProject, resolveApp } from '../../lib/config.js';
import { createSession, createSessionToken } from '../../lib/clerk.js';

export interface CreateSessionOptions {
  project?: string;
  app?: string;
  org?: string;
}

export async function createUserSession(userId: string, opts: CreateSessionOptions = {}): Promise<void> {
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

  const spinner = p.spinner();
  spinner.start('Creating session...');
  try {
    const session = await createSession(app.secret_key, userId, opts.org);
    const token = await createSessionToken(app.secret_key, session.id, 2 * 24 * 60 * 60);
    spinner.stop('Session created.');
    process.stdout.write(`\n> ${token.jwt}\n`);
  } catch (err) {
    spinner.stop('Failed.');
    p.log.error(String(err));
    process.exit(1);
  }
}
