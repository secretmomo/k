import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { dateTimeToNow } from '@k/utils';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

async function generateOutputPath(): Promise<string> {
  const dateTime = dateTimeToNow('YYYY-MM-DD_HH-mm-ss');
  const outputDir = join(root, 'webpages');

  await mkdir(outputDir, { recursive: true });

  return join(outputDir, `${dateTime}.html`);
}

export async function downloadWebpage(url: string): Promise<string> {
  const singleFileBin = join(root, 'node_modules', '.bin', 'single-file');
  const output = await generateOutputPath();
  const args = [singleFileBin, url, output];

  const proc = Bun.spawn(args, {
    cwd: root,
    stdout: 'inherit',
    stderr: 'inherit',
    env: process.env,
  });
  const code = await proc.exited;

  if (code === 0) {
    return output;
  }

  throw new Error(`网页下载失败: ${code} ${url}`);
}
