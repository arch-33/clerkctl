import { buildCommand } from '@stricli/core';

export const extendSessionCommand = buildCommand({
  loader: async () => {
    const { extendSession } = await import('./impl');
    return extendSession;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'Session token (JWT)',
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
    brief: 'Generate a new session token with 8h expiration',
  },
});
