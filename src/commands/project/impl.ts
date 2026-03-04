import type { LocalContext } from '../../context';
import { readConfig, writeConfig, CONFIG_FILE } from '../../config';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NoFlags {}

export async function add(this: LocalContext, _flags: NoFlags, name: string): Promise<void> {
  const config = readConfig();
  if (config.projects[name]) {
    this.process.stderr.write(`Project "${name}" already exists.\n`);
    this.process.exit(1);
    return;
  }
  config.projects[name] = { apps: {} };
  if (!config.current_project) {
    config.current_project = name;
  }
  writeConfig(config);
  this.process.stdout.write(`Project "${name}" added.\n`);
  if (config.current_project === name) {
    this.process.stdout.write(`Set as current project.\n`);
  }
}

export async function list(this: LocalContext, _flags: NoFlags): Promise<void> {
  const config = readConfig();
  const names = Object.keys(config.projects);
  if (names.length === 0) {
    this.process.stdout.write(`No projects configured. Run \`project add <name>\` to create one.\n`);
    return;
  }
  for (const name of names) {
    const isCurrent = name === config.current_project;
    const marker = isCurrent ? '* ' : '  ';
    const appCount = Object.keys(config.projects[name]?.apps ?? {}).length;
    this.process.stdout.write(`${marker}${name} (${appCount} app${appCount === 1 ? '' : 's'})\n`);
  }
}

export async function remove(this: LocalContext, _flags: NoFlags, name: string): Promise<void> {
  const config = readConfig();
  if (!config.projects[name]) {
    this.process.stderr.write(`Project "${name}" not found.\n`);
    this.process.exit(1);
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete config.projects[name];
  if (config.current_project === name) {
    const remaining = Object.keys(config.projects);
    config.current_project = remaining[0];
  }
  writeConfig(config);
  this.process.stdout.write(`Project "${name}" removed.\n`);
}

export async function use(this: LocalContext, _flags: NoFlags, name: string): Promise<void> {
  const config = readConfig();
  if (!config.projects[name]) {
    this.process.stderr.write(`Project "${name}" not found. Run \`project add ${name}\` first.\n`);
    this.process.exit(1);
    return;
  }
  config.current_project = name;
  writeConfig(config);
  this.process.stdout.write(`Current project set to "${name}".\n`);
  this.process.stdout.write(`Config saved to: ${CONFIG_FILE}\n`);
}
