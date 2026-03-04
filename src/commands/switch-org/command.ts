import { buildCommand } from '@stricli/core';

export const switchOrgCommand = buildCommand({
  loader: async () => {
    const { switchOrg } = await import('./impl');
    return switchOrg;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'Session token (JWT)',
          parse: String,
        },
        {
          brief: 'Organization ID',
          parse: String,
        },
      ],
    },
    flags: {
      project: {
        kind: 'parsed',
        parse: String,
        brief: 'Project name (defaults to current project)',
        optional: true,
      },
      app: {
        kind: 'parsed',
        parse: String,
        brief: 'App name (defaults to current app)',
        optional: true,
      },
    },
  },
  docs: {
    brief: 'Switch active organization and return a new session token',
  },
});
