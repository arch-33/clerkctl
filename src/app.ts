import { buildApplication, buildRouteMap } from '@stricli/core';
import { buildInstallCommand, buildUninstallCommand } from '@stricli/auto-complete';
import { name, version, description } from '../package.json';
import { projectRoutes } from './commands/project/commands';
import { appRoutes } from './commands/app/commands';

const routes = buildRouteMap({
  routes: {
    project: projectRoutes,
    app: appRoutes,
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
