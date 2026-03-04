import * as p from '@clack/prompts';
import { readConfig, writeConfig, CONFIG_FILE } from '../../lib/config.js';

export async function add(name: string): Promise<void> {
  const config = readConfig();
  if (config.projects[name]) {
    p.log.error(`Project "${name}" already exists.`);
    process.exit(1);
  }
  config.projects[name] = { apps: {} };
  if (!config.current_project) {
    config.current_project = name;
  }
  writeConfig(config);
  p.log.success(`Project "${name}" added.`);
  if (config.current_project === name) {
    p.log.info(`Set as current project.`);
  }
}

export async function list(): Promise<void> {
  const config = readConfig();
  const names = Object.keys(config.projects);
  if (names.length === 0) {
    p.log.info('No projects configured. Run `project add <name>` to create one.');
    return;
  }
  const lines = names.map((name) => {
    const isCurrent = name === config.current_project;
    const marker = isCurrent ? '* ' : '  ';
    const appCount = Object.keys(config.projects[name]?.apps ?? {}).length;
    return `${marker}${name} (${appCount} app${appCount === 1 ? '' : 's'})`;
  });
  p.note(lines.join('\n'), 'Projects');
}

export async function remove(name: string): Promise<void> {
  const config = readConfig();
  if (!config.projects[name]) {
    p.log.error(`Project "${name}" not found.`);
    process.exit(1);
  }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete config.projects[name];
  if (config.current_project === name) {
    const remaining = Object.keys(config.projects);
    config.current_project = remaining[0];
  }
  writeConfig(config);
  p.log.success(`Project "${name}" removed.`);
}

export async function use(name: string): Promise<void> {
  const config = readConfig();
  if (!config.projects[name]) {
    p.log.error(`Project "${name}" not found. Run \`project add ${name}\` first.`);
    process.exit(1);
  }
  config.current_project = name;
  writeConfig(config);
  p.log.success(`Current project set to "${name}".`);
  p.log.info(`Config saved to: ${CONFIG_FILE}`);
}
