import { buildCommand, buildRouteMap } from '@stricli/core';

const addCommand = buildCommand({
  loader: async () => {
    const { add } = await import('./impl');
    return add;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'App name',
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
      'secret-key': {
        kind: 'parsed',
        parse: String,
        brief: 'Clerk secret key (sk_...)',
        optional: true,
      },
      'publishable-key': {
        kind: 'parsed',
        parse: String,
        brief: 'Clerk publishable key (pk_...)',
        optional: true,
      },
      'webhook-secret': {
        kind: 'parsed',
        parse: String,
        brief: 'Clerk webhook secret (whsec_...)',
        optional: true,
      },
    },
  },
  docs: {
    brief: 'Add a new app to a project',
  },
});

const listCommand = buildCommand({
  loader: async () => {
    const { list } = await import('./impl');
    return list;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [],
    },
    flags: {
      project: {
        kind: 'parsed',
        parse: String,
        brief: 'Project name (defaults to current project)',
        optional: true,
      },
    },
  },
  docs: {
    brief: 'List apps in a project',
  },
});

const removeCommand = buildCommand({
  loader: async () => {
    const { remove } = await import('./impl');
    return remove;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'App name',
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
    },
  },
  docs: {
    brief: 'Remove an app from a project',
  },
});

const useCommand = buildCommand({
  loader: async () => {
    const { use } = await import('./impl');
    return use;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'App name',
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
    },
  },
  docs: {
    brief: 'Set the current active app for a project',
  },
});

const showCommand = buildCommand({
  loader: async () => {
    const { show } = await import('./impl');
    return show;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [],
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
    brief: 'Show config for an app',
  },
});

const defaultCommand = buildCommand({
  loader: async () => {
    const { setDefault } = await import('./impl');
    return setDefault;
  },
  parameters: {
    positional: {
      kind: 'tuple',
      parameters: [
        {
          brief: 'App name',
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
    },
  },
  docs: {
    brief: 'Set the default app for a project',
  },
});

export const appRoutes = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    remove: removeCommand,
    use: useCommand,
    show: showCommand,
    default: defaultCommand,
  },
  docs: {
    brief: 'Manage Clerk apps within a project',
  },
});
