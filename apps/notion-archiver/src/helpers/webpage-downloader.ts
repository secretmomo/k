import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

import consola from 'consola';
import { dateTimeToNow } from '@k/utils';

import { root, resourcesDir } from './path';

const MAX_RETRY = 5;

async function generateOutputPath(): Promise<string> {
  await mkdir(resourcesDir, { recursive: true });

  return join(resourcesDir, `${dateTimeToNow('YYYY-MM-DD_HH-mm-ss')}.html`);
}

async function isHtmlFileValid(filePath: string): Promise<boolean> {
  const content = await Bun.file(filePath).text();

  // 抓取微信公众号文章，偶尔出现验证环境异常的情况
  if (content.includes('当前环境异常，完成验证后即可继续访问。')) {
    return false;
  }

  return true;
}

async function download(url: string, retry = MAX_RETRY): Promise<string> {
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

  if (code !== 0) {
    throw new Error(`网页下载失败: ${code} ${url}`);
  }

  const valid = await isHtmlFileValid(output);

  if (valid) {
    return output;
  }

  if (retry > 0) {
    consola.warn(`网页下载失败，第 ${MAX_RETRY + 1 - retry} 次重试...`);
    await Bun.sleep(1000 * (MAX_RETRY + 1 - retry));

    return download(url, retry - 1);
  }

  return output;
}

export async function downloadWebpage(url: string): Promise<string> {
  return download(url);
}
