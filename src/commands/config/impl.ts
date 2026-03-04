import * as p from '@clack/prompts';
import { CONFIG_FILE } from '../../lib/config.js';
import fs from 'node:fs';

export async function config(): Promise<void> {
  const exists = fs.existsSync(CONFIG_FILE);
  p.log.info(`${CONFIG_FILE}${exists ? '' : ' (not yet created)'}`);
}
