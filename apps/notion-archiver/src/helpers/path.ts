import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

export const resourcesDir = join(root, 'resources');
