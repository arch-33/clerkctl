import * as p from '@clack/prompts';
import { readConfig, resolveProject, resolveApp } from '../../lib/config.js';
import { decodeJwtPayload } from '../../lib/jwt.js';
import { createSession, createSessionToken } from '../../lib/clerk.js';

export interface SwitchOrgOptions {
  project?: string;
  app?: string;
}

export async function switchOrg(token: string, orgId: string, opts: SwitchOrgOptions = {}): Promise<void> {
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

  const userId = payload['sub'];
  if (typeof userId !== 'string' || !userId) {
    p.log.error(`Session token does not contain a valid "sub" (user ID) field.`);
    process.exit(1);
  }

  const spinner = p.spinner();
  spinner.start('Switching organization...');
  try {
    const session = await createSession(app.secret_key, userId, orgId);
    const result = await createSessionToken(app.secret_key, session.id, 2 * 24 * 60 * 60);
    spinner.stop('Organization switched.');
    process.stdout.write(`\n> ${result.jwt}\n`);
  } catch (err) {
    spinner.stop('Failed.');
    p.log.error(String(err));
    process.exit(1);
  }
}
