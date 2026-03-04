#!/usr/bin/env node
import { Command } from 'commander';
import { version } from '../../package.json';
import { runInteractive } from '../interactive/index.js';
import { add as projectAdd, list as projectList, remove as projectRemove, use as projectUse } from '../commands/project/impl.js';
import { add as appAdd, list as appList, remove as appRemove, use as appUse, show as appShow, setDefault as appSetDefault } from '../commands/app/impl.js';
import { config } from '../commands/config/impl.js';
import { extendSession } from '../commands/extend-session/impl.js';
import { switchOrg } from '../commands/switch-org/impl.js';

if (process.argv.length <= 2) {
  await runInteractive();
  process.exit(0);
}

const program = new Command();
program.name('clerk-utils').description('Clerk utilities CLI').version(version);

// project commands
const project = program.command('project').description('Manage Clerk projects');
project
  .command('add <name>')
  .description('Add a new project')
  .action(async (name: string) => { await projectAdd(name); });
project
  .command('list')
  .description('List all projects')
  .action(async () => { await projectList(); });
project
  .command('remove <name>')
  .description('Remove a project')
  .action(async (name: string) => { await projectRemove(name); });
project
  .command('use <name>')
  .description('Set the current active project')
  .action(async (name: string) => { await projectUse(name); });

// app commands
const app = program.command('app').description('Manage Clerk apps within a project');
app
  .command('add <name>')
  .description('Add a new app to a project')
  .option('--project <name>', 'Project name (defaults to current project)')
  .option('--secret-key <key>', 'Clerk secret key (sk_...)')
  .option('--publishable-key <key>', 'Clerk publishable key (pk_...)')
  .option('--webhook-secret <secret>', 'Clerk webhook secret (whsec_...)')
  .action(async (name: string, opts: { project?: string; secretKey?: string; publishableKey?: string; webhookSecret?: string }) => {
    await appAdd(name, opts);
  });
app
  .command('list')
  .description('List apps in a project')
  .option('--project <name>', 'Project name (defaults to current project)')
  .action(async (opts: { project?: string }) => { await appList(opts.project); });
app
  .command('remove <name>')
  .description('Remove an app from a project')
  .option('--project <name>', 'Project name (defaults to current project)')
  .action(async (name: string, opts: { project?: string }) => { await appRemove(name, opts.project); });
app
  .command('use <name>')
  .description('Set the current active app for a project')
  .option('--project <name>', 'Project name (defaults to current project)')
  .action(async (name: string, opts: { project?: string }) => { await appUse(name, opts.project); });
app
  .command('show')
  .description('Show config for an app')
  .option('--project <name>', 'Project name (defaults to current project)')
  .option('--app <name>', 'App name (defaults to current app)')
  .action(async (opts: { project?: string; app?: string }) => { await appShow(opts.project, opts.app); });
app
  .command('default <name>')
  .description('Set the default app for a project')
  .option('--project <name>', 'Project name (defaults to current project)')
  .action(async (name: string, opts: { project?: string }) => { await appSetDefault(name, opts.project); });

// config command
program
  .command('config')
  .description('Print config file path')
  .action(async () => { await config(); });

// extend-session command
program
  .command('extend-session <token>')
  .description('Generate a new session token with 8h expiration')
  .option('--project <name>', 'Project name (defaults to current project)')
  .option('--app <name>', 'App name (defaults to current app)')
  .action(async (token: string, opts: { project?: string; app?: string }) => {
    await extendSession(token, opts);
  });

// switch-org command
program
  .command('switch-org <token> <org-id>')
  .description('Switch active organization and return a new session token')
  .option('--project <name>', 'Project name (defaults to current project)')
  .option('--app <name>', 'App name (defaults to current app)')
  .action(async (token: string, orgId: string, opts: { project?: string; app?: string }) => {
    await switchOrg(token, orgId, opts);
  });

await program.parseAsync(process.argv);
