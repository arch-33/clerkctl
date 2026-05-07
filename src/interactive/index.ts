import * as p from '@clack/prompts';
import { config } from '../commands/config/impl.js';
import { interactiveProject } from './project.js';
import { interactiveApp } from './app.js';
import { interactiveExtendSession } from './extend-session.js';
import { interactiveSwitchOrg } from './switch-org.js';
import { interactiveCreateSession } from './create-session.js';

export async function runInteractive(): Promise<void> {
  p.intro('clerkctl');

  const action = await p.select({
    message: 'What do you want to do?',
    options: [
      { value: 'project', label: 'Manage projects' },
      { value: 'app', label: 'Manage apps' },
      { value: 'create-session', label: 'Create session for user' },
      { value: 'extend-session', label: 'Extend session token' },
      { value: 'switch-org', label: 'Switch organization' },
      { value: 'config', label: 'Show config file path' },
    ],
  });

  if (p.isCancel(action)) {
    p.outro('Cancelled.');
    return;
  }

  if (action === 'project') await interactiveProject();
  else if (action === 'app') await interactiveApp();
  else if (action === 'create-session') await interactiveCreateSession();
  else if (action === 'extend-session') await interactiveExtendSession();
  else if (action === 'switch-org') await interactiveSwitchOrg();
  else if (action === 'config') await config();

  p.outro('Done.');
}
