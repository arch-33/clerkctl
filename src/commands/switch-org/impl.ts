import type { LocalContext } from '../../context';
import { readConfig, resolveProject, resolveApp } from '../../lib/config';
import { decodeJwtPayload } from '../../lib/jwt';
import { createSession, createSessionToken } from '../../lib/clerk';

interface SwitchOrgFlags {
  project?: string;
  app?: string;
}

export async function switchOrg(this: LocalContext, flags: SwitchOrgFlags, token: string, orgId: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found.\n`);
    this.process.exit(1);
    return;
  }
  const appName = resolveApp(project, flags.app);
  const app = project.apps[appName];
  if (!app) {
    this.process.stderr.write(`App "${appName}" not found in project "${projectName}".\n`);
    this.process.exit(1);
    return;
  }
  if (!app.secret_key) {
    this.process.stderr.write(`App "${appName}" has no secret_key configured. Run \`app add ${appName} --secret-key=sk_...\`.\n`);
    this.process.exit(1);
    return;
  }

  let payload: Record<string, unknown>;
  try {
    payload = decodeJwtPayload(token);
  } catch (err) {
    this.process.stderr.write(`Failed to decode session token: ${String(err)}\n`);
    this.process.exit(1);
    return;
  }

  const userId = payload['sub'];
  if (typeof userId !== 'string' || !userId) {
    this.process.stderr.write(`Session token does not contain a valid "sub" (user ID) field.\n`);
    this.process.exit(1);
    return;
  }

  try {
    const session = await createSession(app.secret_key, userId, orgId);
    const result = await createSessionToken(app.secret_key, session.id, 2 * 24 * 60 * 60);
    this.process.stdout.write(`\n> ${result.jwt}\n`);
  } catch (err) {
    this.process.stderr.write(`${String(err)}\n`);
    this.process.exit(1);
  }
}
