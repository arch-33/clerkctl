import * as p from '@clack/prompts';
import { readConfig, writeConfig, resolveProject, resolveApp } from '../../lib/config.js';

export interface AddAppOptions {
  project?: string;
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
}

export async function add(name: string, opts: AddAppOptions = {}): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, opts.project);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found. Run \`project add ${projectName}\` first.`);
    process.exit(1);
  }
  if (project.apps[name]) {
    p.log.error(`App "${name}" already exists in project "${projectName}".`);
    process.exit(1);
  }
  project.apps[name] = {
    ...(opts.secretKey ? { secret_key: opts.secretKey } : {}),
    ...(opts.publishableKey ? { publishable_key: opts.publishableKey } : {}),
    ...(opts.webhookSecret ? { webhook_secret: opts.webhookSecret } : {}),
  };
  if (!project.current_app) {
    project.current_app = name;
  }
  writeConfig(config);
  p.log.success(`App "${name}" added to project "${projectName}".`);
  if (project.current_app === name) {
    p.log.info(`Set as current app.`);
  }
}

export async function list(projectFlag?: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, projectFlag);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  const names = Object.keys(project.apps);
  if (names.length === 0) {
    p.log.info(`No apps in project "${projectName}". Run \`app add <name>\` to create one.`);
    return;
  }
  const lines = names.map((name) => {
    const isCurrent = name === project.current_app;
    const marker = isCurrent ? '* ' : '  ';
    const app = project.apps[name] ?? {};
    const fields = [app.secret_key ? 'secret_key' : null, app.publishable_key ? 'publishable_key' : null, app.webhook_secret ? 'webhook_secret' : null].filter(Boolean);
    const detail = fields.length > 0 ? ` [${fields.join(', ')}]` : ' [no keys set]';
    return `${marker}${name}${detail}`;
  });
  p.note(lines.join('\n'), `Apps in project "${projectName}"`);
}

export async function remove(name: string, projectFlag?: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, projectFlag);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  if (!project.apps[name]) {
    p.log.error(`App "${name}" not found in project "${projectName}".`);
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete project.apps[name];
  if (project.current_app === name) {
    const remaining = Object.keys(project.apps);
    project.current_app = remaining[0];
  }
  writeConfig(config);
  p.log.success(`App "${name}" removed from project "${projectName}".`);
}

export async function use(name: string, projectFlag?: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, projectFlag);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  if (!project.apps[name]) {
    p.log.error(`App "${name}" not found in project "${projectName}". Run \`app add ${name}\` first.`);
    process.exit(1);
  }
  project.current_app = name;
  writeConfig(config);
  p.log.success(`Current app set to "${name}" in project "${projectName}".`);
}

export async function show(projectFlag?: string, appFlag?: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, projectFlag);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  const appName = resolveApp(project, appFlag);
  const app = project.apps[appName];
  if (!app) {
    p.log.error(`App "${appName}" not found in project "${projectName}".`);
    process.exit(1);
  }
  const lines = [`Project: ${projectName}`, `App:     ${appName}`, ''];
  if (app.secret_key) lines.push(`secret_key:      ${app.secret_key}`);
  if (app.publishable_key) lines.push(`publishable_key: ${app.publishable_key}`);
  if (app.webhook_secret) lines.push(`webhook_secret:  ${app.webhook_secret}`);
  if (!app.secret_key && !app.publishable_key && !app.webhook_secret) lines.push('(no keys configured)');
  p.note(lines.join('\n'), 'App Config');
}

export async function setDefault(name: string, projectFlag?: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, projectFlag);
  const project = config.projects[projectName];
  if (!project) {
    p.log.error(`Project "${projectName}" not found.`);
    process.exit(1);
  }
  if (!project.apps[name]) {
    p.log.error(`App "${name}" not found in project "${projectName}". Run \`app add ${name}\` first.`);
    process.exit(1);
  }
  project.default_app = name;
  writeConfig(config);
  p.log.success(`Default app set to "${name}" in project "${projectName}".`);
}
