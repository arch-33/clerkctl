import * as p from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { decodeJwtPayload } from '../lib/jwt.js';
import { listUserOrganizationMemberships } from '../lib/clerk.js';
import { switchOrg } from '../commands/switch-org/impl.js';

export async function interactiveSwitchOrg(): Promise<void> {
  const config = readConfig();
  const projectNames = Object.keys(config.projects);
  if (projectNames.length === 0) {
    p.log.warn('No projects configured.');
    return;
  }

  const projectName = await p.select({
    message: 'Select project',
    options: projectNames.map((n) => ({ value: n, label: n, hint: n === config.current_project ? 'current' : undefined })),
  });
  if (p.isCancel(projectName)) return;

  const project = config.projects[projectName];
  const appNames = Object.keys(project?.apps ?? {});
  if (appNames.length === 0) {
    p.log.warn(`No apps in project "${projectName}".`);
    return;
  }

  const appName = await p.select({
    message: 'Select app',
    options: appNames.map((n) => ({ value: n, label: n, hint: n === project?.current_app ? 'current' : undefined })),
  });
  if (p.isCancel(appName)) return;

  const secretKey = project?.apps[appName]?.secret_key;
  if (!secretKey) {
    p.log.error(`App "${appName}" has no secret_key configured.`);
    return;
  }

  const token = await p.text({ message: 'Session token (JWT)', validate: (v) => ((v ?? '').trim() ? undefined : 'Token is required') });
  if (p.isCancel(token)) return;

  let userId: string;
  try {
    const payload = decodeJwtPayload(token.trim());
    const sub = payload['sub'];
    if (typeof sub !== 'string' || !sub) throw new Error('Missing "sub" field');
    userId = sub;
  } catch (err) {
    p.log.error(`Failed to decode session token: ${String(err)}`);
    return;
  }

  const spinner = p.spinner();
  spinner.start('Fetching organization memberships...');
  let memberships: Awaited<ReturnType<typeof listUserOrganizationMemberships>>;
  try {
    memberships = await listUserOrganizationMemberships(secretKey, userId);
    spinner.stop('Organizations loaded.');
  } catch (err) {
    spinner.stop('Failed.');
    p.log.error(String(err));
    return;
  }

  if (memberships.length === 0) {
    p.log.warn('This user is not a member of any organizations.');
    return;
  }

  const orgId = await p.select({
    message: 'Select organization',
    options: memberships.map((m) => ({
      value: m.organization.id,
      label: m.organization.name,
      hint: m.organization.slug ?? m.organization.id,
    })),
  });
  if (p.isCancel(orgId)) return;

  await switchOrg(token.trim(), orgId, { project: projectName, app: appName });
}
