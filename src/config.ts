import { parse, stringify } from 'yaml';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface ClerkAppConfig {
  secret_key?: string;
  publishable_key?: string;
  webhook_secret?: string;
}

export interface ProjectConfig {
  current_app?: string;
  apps: Record<string, ClerkAppConfig>;
}

export interface ClerkUtilsConfig {
  current_project?: string;
  projects: Record<string, ProjectConfig>;
}

const CONFIG_DIR = path.join(os.homedir(), '.clerk-utils');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yml');

export function readConfig(): ClerkUtilsConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { projects: {} };
  }
  const raw = fs.readFileSync(CONFIG_FILE, 'utf8');
  const parsed = parse(raw) as ClerkUtilsConfig | null;
  return parsed ?? { projects: {} };
}

export function writeConfig(config: ClerkUtilsConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, stringify(config), 'utf8');
}

export function resolveProject(config: ClerkUtilsConfig, flag?: string): string {
  const name = flag ?? config.current_project;
  if (!name) {
    throw new Error('No project specified and no current project set. Use --project or run `project use <name>` first.');
  }
  return name;
}

export function resolveApp(project: ProjectConfig, flag?: string): string {
  const name = flag ?? project.current_app;
  if (!name) {
    throw new Error('No app specified and no current app set. Use --app or run `app use <name>` first.');
  }
  return name;
}

export { CONFIG_FILE };
