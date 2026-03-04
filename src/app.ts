import { buildApplication, buildRouteMap } from '@stricli/core';
import { buildInstallCommand, buildUninstallCommand } from '@stricli/auto-complete';
import { name, version, description } from '../package.json';
import { projectRoutes } from './commands/project/commands';
import { appRoutes } from './commands/app/commands';
import { configCommand } from './commands/config/command';
import { extendSessionCommand } from './commands/extend-session/command';
import { switchOrgCommand } from './commands/switch-org/command';

const routes = buildRouteMap({
  routes: {
    project: projectRoutes,
    app: appRoutes,
    config: configCommand,
    'extend-session': extendSessionCommand,
    'switch-org': switchOrgCommand,
    install: buildInstallCommand('clerk-utils', { bash: '__clerk-utils_bash_complete' }),
    uninstall: buildUninstallCommand('clerk-utils', { bash: true }),
  },
  docs: {
    brief: description,
    hideRoute: {
      install: true,
      uninstall: true,
    },
  },
});

export const app = buildApplication(routes, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
