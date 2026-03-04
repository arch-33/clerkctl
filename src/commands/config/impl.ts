import type { LocalContext } from '../../context';
import { CONFIG_FILE } from '../../config';
import fs from 'node:fs';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NoFlags {}

export async function config(this: LocalContext, _flags: NoFlags): Promise<void> {
  const exists = fs.existsSync(CONFIG_FILE);
  this.process.stdout.write(`${CONFIG_FILE}${exists ? '' : ' (not yet created)'}\n`);
}
