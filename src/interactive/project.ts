import * as p from '@clack/prompts';
import { readConfig } from '../lib/config.js';
import { add, list, remove, use } from '../commands/project/impl.js';

export async function interactiveProject(): Promise<void> {
  const action = await p.select({
    message: 'Project action',
    options: [
      { value: 'list', label: 'List projects' },
      { value: 'add', label: 'Add project' },
      { value: 'use', label: 'Switch current project' },
      { value: 'remove', label: 'Remove project' },
    ],
  });
  if (p.isCancel(action)) return;

  if (action === 'list') {
    await list();
    return;
  }

  if (action === 'add') {
    const name = await p.text({ message: 'Project name', validate: (v) => ((v ?? "").trim() ? undefined : 'Name is required') });
    if (p.isCancel(name)) return;
    await add(name.trim());
    return;
  }

  const config = readConfig();
  const existing = Object.keys(config.projects);
  if (existing.length === 0) {
    p.log.warn('No projects found. Add one first.');
    return;
  }

  const picked = await p.select({
    message: action === 'use' ? 'Select project to use' : 'Select project to remove',
    options: existing.map((n) => ({ value: n, label: n, hint: n === config.current_project ? 'current' : undefined })),
  });
  if (p.isCancel(picked)) return;

  if (action === 'use') {
    await use(picked);
  } else {
    const confirmed = await p.confirm({ message: `Remove project "${picked}"?` });
    if (p.isCancel(confirmed) || !confirmed) return;
    await remove(picked);
  }
}
