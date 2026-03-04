import * as p from '@clack/prompts';
import { readConfig, resolveProject } from '../lib/config.js';
import { add, list, remove, use, show, setDefault } from '../commands/app/impl.js';

export async function interactiveApp(): Promise<void> {
  const config = readConfig();
  const projectNames = Object.keys(config.projects);
  if (projectNames.length === 0) {
    p.log.warn('No projects found. Run `project add <name>` first.');
    return;
  }

  const projectName = await p.select({
    message: 'Select project',
    options: projectNames.map((n) => ({ value: n, label: n, hint: n === config.current_project ? 'current' : undefined })),
  });
  if (p.isCancel(projectName)) return;

  const action = await p.select({
    message: 'App action',
    options: [
      { value: 'list', label: 'List apps' },
      { value: 'add', label: 'Add app' },
      { value: 'use', label: 'Switch current app' },
      { value: 'show', label: 'Show app config' },
      { value: 'default', label: 'Set default app' },
      { value: 'remove', label: 'Remove app' },
    ],
  });
  if (p.isCancel(action)) return;

  if (action === 'list') {
    await list(projectName);
    return;
  }

  if (action === 'add') {
    const name = await p.text({ message: 'App name', validate: (v) => ((v ?? "").trim() ? undefined : 'Name is required') });
    if (p.isCancel(name)) return;

    const secretKey = await p.password({ message: 'Secret key (sk_...) — leave blank to skip' });
    if (p.isCancel(secretKey)) return;

    const publishableKey = await p.text({ message: 'Publishable key (pk_...) — leave blank to skip', defaultValue: '' });
    if (p.isCancel(publishableKey)) return;

    const webhookSecret = await p.password({ message: 'Webhook secret (whsec_...) — leave blank to skip' });
    if (p.isCancel(webhookSecret)) return;

    await add(name.trim(), {
      project: projectName,
      secretKey: secretKey || undefined,
      publishableKey: publishableKey || undefined,
      webhookSecret: webhookSecret || undefined,
    });
    return;
  }

  const project = config.projects[projectName];
  const appNames = Object.keys(project?.apps ?? {});
  if (appNames.length === 0) {
    p.log.warn(`No apps in project "${projectName}". Add one first.`);
    return;
  }

  const resolvedProject = resolveProject(config, projectName);
  const resolvedProjectData = config.projects[resolvedProject];

  const picked = await p.select({
    message: 'Select app',
    options: appNames.map((n) => ({ value: n, label: n, hint: n === resolvedProjectData?.current_app ? 'current' : undefined })),
  });
  if (p.isCancel(picked)) return;

  if (action === 'use') {
    await use(picked, projectName);
  } else if (action === 'show') {
    await show(projectName, picked);
  } else if (action === 'default') {
    await setDefault(picked, projectName);
  } else {
    const confirmed = await p.confirm({ message: `Remove app "${picked}" from project "${projectName}"?` });
    if (p.isCancel(confirmed) || !confirmed) return;
    await remove(picked, projectName);
  }
}
