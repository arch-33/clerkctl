import * as p from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { listUsers, listUserOrganizationMemberships } from '../lib/clerk.js';
import type { ClerkUser } from '../lib/clerk.js';
import { createUserSession } from '../commands/create-session/impl.js';

function userLabel(user: ClerkUser): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const primary = user.email_addresses.find((e) => e.id === user.primary_email_address_id);
  const email = primary?.email_address ?? user.email_addresses[0]?.email_address;
  return name || email || user.username || user.id;
}

function userHint(user: ClerkUser): string | undefined {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const primary = user.email_addresses.find((e) => e.id === user.primary_email_address_id);
  const email = primary?.email_address ?? user.email_addresses[0]?.email_address;
  if (name && email) return email;
  if (name || email) return user.username ?? undefined;
  return undefined;
}

export async function interactiveCreateSession(): Promise<void> {
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

  const spinner = p.spinner();
  spinner.start('Fetching users...');
  let users: ClerkUser[];
  try {
    users = await listUsers(secretKey);
    spinner.stop(`${users.length} user(s) loaded.`);
  } catch (err) {
    spinner.stop('Failed.');
    p.log.error(String(err));
    return;
  }

  if (users.length === 0) {
    p.log.warn('No users found in this app.');
    return;
  }

  const userId = await p.select({
    message: 'Select user',
    options: users.map((u) => ({
      value: u.id,
      label: userLabel(u),
      hint: userHint(u),
    })),
  });
  if (p.isCancel(userId)) return;

  spinner.start('Fetching organization memberships...');
  let memberships: Awaited<ReturnType<typeof listUserOrganizationMemberships>>;
  try {
    memberships = await listUserOrganizationMemberships(secretKey, userId);
    spinner.stop('Organizations loaded.');
  } catch (err) {
    spinner.stop('Failed to load organizations.');
    p.log.warn(String(err));
    memberships = [];
  }

  let orgId: string | undefined;
  if (memberships.length > 0) {
    const orgChoice = await p.select({
      message: 'Select organization (optional)',
      options: [
        { value: '__none__', label: 'No organization' },
        ...memberships.map((m) => ({
          value: m.organization.id,
          label: m.organization.name,
          hint: m.organization.slug ?? m.organization.id,
        })),
      ],
    });
    if (p.isCancel(orgChoice)) return;
    if (orgChoice !== '__none__') orgId = orgChoice;
  }

  await createUserSession(userId, { project: projectName, app: appName, org: orgId });
}
