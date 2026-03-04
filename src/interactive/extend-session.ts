import * as p from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { extendSession } from '../commands/extend-session/impl.js';

export async function interactiveExtendSession(): Promise<void> {
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

  const token = await p.text({ message: 'Session token (JWT)', validate: (v) => ((v ?? "").trim() ? undefined : 'Token is required') });
  if (p.isCancel(token)) return;

  await extendSession(token.trim(), { project: projectName, app: appName });
}
