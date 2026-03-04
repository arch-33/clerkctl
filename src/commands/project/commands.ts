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
          brief: 'Project name',
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: 'Add a new project',
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
  },
  docs: {
    brief: 'List all projects',
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
          brief: 'Project name',
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: 'Remove a project',
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
          brief: 'Project name',
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: 'Set the current active project',
  },
});

export const projectRoutes = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    remove: removeCommand,
    use: useCommand,
  },
  docs: {
    brief: 'Manage Clerk projects',
  },
});
