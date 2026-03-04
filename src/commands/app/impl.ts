import type { LocalContext } from '../../context';
import { readConfig, writeConfig, resolveProject, resolveApp } from '../../lib/config';

interface AddFlags {
  project?: string;
  'secret-key'?: string;
  'publishable-key'?: string;
  'webhook-secret'?: string;
}

export async function add(this: LocalContext, flags: AddFlags, name: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found. Run \`project add ${projectName}\` first.\n`);
    this.process.exit(1);
    return;
  }
  if (project.apps[name]) {
    this.process.stderr.write(`App "${name}" already exists in project "${projectName}".\n`);
    this.process.exit(1);
    return;
  }
  project.apps[name] = {
    ...(flags['secret-key'] ? { secret_key: flags['secret-key'] } : {}),
    ...(flags['publishable-key'] ? { publishable_key: flags['publishable-key'] } : {}),
    ...(flags['webhook-secret'] ? { webhook_secret: flags['webhook-secret'] } : {}),
  };
  if (!project.current_app) {
    project.current_app = name;
  }
  writeConfig(config);
  this.process.stdout.write(`App "${name}" added to project "${projectName}".\n`);
  if (project.current_app === name) {
    this.process.stdout.write(`Set as current app.\n`);
  }
}

interface ProjectFlag {
  project?: string;
}

export async function list(this: LocalContext, flags: ProjectFlag): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found.\n`);
    this.process.exit(1);
    return;
  }
  const names = Object.keys(project.apps);
  if (names.length === 0) {
    this.process.stdout.write(`No apps in project "${projectName}". Run \`app add <name>\` to create one.\n`);
    return;
  }
  this.process.stdout.write(`Apps in project "${projectName}":\n`);
  for (const name of names) {
    const isCurrent = name === project.current_app;
    const marker = isCurrent ? '* ' : '  ';
    const app = project.apps[name] ?? {};
    const fields = [app.secret_key ? 'secret_key' : null, app.publishable_key ? 'publishable_key' : null, app.webhook_secret ? 'webhook_secret' : null].filter(
      Boolean,
    );
    const detail = fields.length > 0 ? ` [${fields.join(', ')}]` : ' [no keys set]';
    this.process.stdout.write(`${marker}${name}${detail}\n`);
  }
}

export async function remove(this: LocalContext, flags: ProjectFlag, name: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found.\n`);
    this.process.exit(1);
    return;
  }
  if (!project.apps[name]) {
    this.process.stderr.write(`App "${name}" not found in project "${projectName}".\n`);
    this.process.exit(1);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete project.apps[name];
  if (project.current_app === name) {
    const remaining = Object.keys(project.apps);
    project.current_app = remaining[0];
  }
  writeConfig(config);
  this.process.stdout.write(`App "${name}" removed from project "${projectName}".\n`);
}

export async function use(this: LocalContext, flags: ProjectFlag, name: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found.\n`);
    this.process.exit(1);
    return;
  }
  if (!project.apps[name]) {
    this.process.stderr.write(`App "${name}" not found in project "${projectName}". Run \`app add ${name}\` first.\n`);
    this.process.exit(1);
    return;
  }
  project.current_app = name;
  writeConfig(config);
  this.process.stdout.write(`Current app set to "${name}" in project "${projectName}".\n`);
}

interface ShowFlags {
  project?: string;
  app?: string;
}

export async function show(this: LocalContext, flags: ShowFlags): Promise<void> {
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
  this.process.stdout.write(`Project: ${projectName}\n`);
  this.process.stdout.write(`App:     ${appName}\n`);
  this.process.stdout.write(`\n`);
  if (app.secret_key) {
    this.process.stdout.write(`secret_key:      ${app.secret_key}\n`);
  }
  if (app.publishable_key) {
    this.process.stdout.write(`publishable_key: ${app.publishable_key}\n`);
  }
  if (app.webhook_secret) {
    this.process.stdout.write(`webhook_secret:  ${app.webhook_secret}\n`);
  }
  if (!app.secret_key && !app.publishable_key && !app.webhook_secret) {
    this.process.stdout.write(`(no keys configured)\n`);
  }
}

export async function setDefault(this: LocalContext, flags: ProjectFlag, name: string): Promise<void> {
  const config = readConfig();
  const projectName = resolveProject(config, flags.project);
  const project = config.projects[projectName];
  if (!project) {
    this.process.stderr.write(`Project "${projectName}" not found.\n`);
    this.process.exit(1);
  }
  if (!project.apps[name]) {
    this.process.stderr.write(`App "${name}" not found in project "${projectName}". Run \`app add ${name}\` first.\n`);
    this.process.exit(1);
  }
  project.default_app = name;
  writeConfig(config);
  this.process.stdout.write(`Default app set to "${name}" in project "${projectName}".\n`);
}
