import { buildCommand } from '@stricli/core';

export const configCommand = buildCommand({
  loader: async () => {
    const { config } = await import('./impl');
    return config;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [],
    },
  },
  docs: {
    brief: 'Print the config file path',
  },
});
