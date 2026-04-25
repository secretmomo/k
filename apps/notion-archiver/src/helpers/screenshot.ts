import { mkdir, access, mkdtemp } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { dirname, join, extname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';

/**
 * 在常见路径中查找 Chrome/Chromium；如未找到，支持环境变量 CHROME_PATH。
 */
async function findChromeBinary(): Promise<string> {
  const candidates: string[] = [];

  if (process.env.CHROME_PATH) {
    candidates.push(process.env.CHROME_PATH);
  }

  // macOS 常见路径
  candidates.push(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  );

  // Linux 常见路径
  candidates.push(
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  );

  // Windows 常见路径
  candidates.push(
    'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
    'C:\\\\Program Files\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
    'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
  );

  for (const p of candidates) {
    try {
      await access(p, FS.X_OK);
      return p;
    } catch {
      // continue
    }
  }

  throw new Error(
    '未找到 Chrome/Chromium 可执行文件。请安装 Chrome 或设置环境变量 CHROME_PATH 指向浏览器可执行文件。',
  );
}

export interface ScreenshotOptions {
  outputPath?: string; // 输出 PNG 路径（默认与 HTML 同名）
  virtualTimeBudgetMs?: number;
}

async function waitForFile(path: string, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await access(path, FS.F_OK);
      return true;
    } catch {
      await Bun.sleep(1000);
    }
  }
  return false;
}

async function terminateProcessGracefully(proc: Bun.Subprocess, graceMs = 1000): Promise<boolean> {
  if (proc.exitCode !== null) {
    return false;
  }

  proc.kill('SIGTERM');

  await Promise.race([proc.exited, Bun.sleep(graceMs)]);

  if (proc.exitCode === null) {
    proc.kill('SIGKILL');
    await proc.exited;
  }

  return true;
}

/**
 * 使用 Chrome Headless 对给定 HTML 截取首屏（非整页），返回截图路径等信息。
 * 流程：
 * 1. 生成去 CSP 的 HTML 副本；
 * 2. 调用 Chrome --headless --screenshot 以固定窗口与像素比保存 PNG。
 */
export async function screenshot(htmlFilePath: string): Promise<string> {
  const ext = extname(htmlFilePath);
  const base = basename(htmlFilePath, ext);
  const outputImagePath = join(dirname(htmlFilePath), `${base}.png`);

  await mkdir(dirname(outputImagePath), { recursive: true }); // 确保输出目录存在

  const chrome = await findChromeBinary();

  const tmpProfileDir = await mkdtemp(join(tmpdir(), 'chrome-headless-'));

  const args: string[] = [
    '--headless=new',
    `--window-size=1280,800`, // 视口宽高
    `--force-device-scale-factor=1`, // 1x 像素比（device scale factor）
    '--no-first-run', // 跳过首次运行向导等初始化流程，避免干扰自动化任务
    '--no-default-browser-check', // 跳过「设为默认浏览器」的检查/提示，减少额外对话框或逻辑
    '--disable-background-networking', // 禁用后台网络服务（如预测、上报、在线服务）
    '--disable-component-update', // 禁用组件更新（降低 updater 相关行为）
    '--disable-sync', // 禁用账号同步相关后台任务
    '--disable-domain-reliability', // 禁用域可靠性监测上报
    '--metrics-recording-only', // 仅本地记录 metrics，不主动上传
    '--disable-features=MediaRouter,OptimizationHints,AutofillServerCommunication,CertificateTransparencyComponentUpdater', // 关闭常见后台特性
    `--user-data-dir=${tmpProfileDir}`, // 临时用户数据目录，避免干扰自动化任务
    `--virtual-time-budget=10000`, // 虚拟时间预算（等待异步渲染）
    `--screenshot=${outputImagePath}`,
    '--allow-file-access-from-files', // 允许 file:// 访问
    pathToFileURL(htmlFilePath).toString(), // 转换为 file:// 协议的 URL
  ];

  const proc = Bun.spawn([chrome, ...args], {
    stdout: 'ignore',
    stderr: 'pipe',
    env: process.env,
  });
  const stderrTextPromise = proc.stderr ? new Response(proc.stderr).text() : Promise.resolve('');

  const wroteImage = await waitForFile(outputImagePath, 15000);
  if (!wroteImage) {
    const exitCode = await proc.exited;
    const stderrText = await stderrTextPromise;
    throw new Error(
      `截图输出文件未生成，exitCode=${exitCode}，html=${htmlFilePath}${stderrText ? `，stderr=${stderrText}` : ''}`,
    );
  }

  const terminatedByUs = await terminateProcessGracefully(proc, 1000);

  const exitCode = await proc.exited;

  if (!terminatedByUs && exitCode !== 0) {
    const stderrText = await stderrTextPromise;
    throw new Error(
      `Chrome Headless 截图失败，exitCode=${exitCode}，html=${htmlFilePath}${stderrText ? `，stderr=${stderrText}` : ''}`,
    );
  }

  return outputImagePath;
}
