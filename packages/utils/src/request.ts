import { sleep } from 'bun';

const MAX_RETRIES = 5; // 最大重试次数
const BASE_RETRY_DELAY = 2000; // 基础重试延迟（毫秒）

/**
 * 带重试机制的 fetch 函数
 * 处理网络不稳定导致的 ECONNRESET 等错误
 */
export async function fetchText(url: string, retries = MAX_RETRIES): Promise<string> {
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  // 如果是 eastmoney 域名，添加 Referer
  if (url.includes('eastmoney.com')) {
    headers['Referer'] = 'https://www.eastmoney.com/';
  }

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(60000), // 设置超时时间为 60 秒
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} url: ${url}`);
    }

    return await response.text();
  } catch (error) {
    // 注意：AbortSignal.timeout() 在 Bun 中会抛出 DOMException (name: 'TimeoutError')，不是 Error 实例
    const err = error as { name?: string; message?: string };
    const message = err?.message ?? String(error);

    // 如果是最后一次重试，直接抛出错误
    if (retries <= 0) {
      throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} retries: ${message}`);
    }

    // 判断是否是可重试的错误
    const isRetryableError =
      err?.name === 'TimeoutError' ||
      err?.name === 'AbortError' ||
      (error instanceof Error &&
        (error.message.includes('ECONNRESET') ||
          error.message.includes('socket connection') ||
          message.includes('timeout') ||
          error.message.includes('network') ||
          error.name === 'TypeError'));

    if (!isRetryableError) {
      // 如果不是可重试的错误，直接抛出
      throw error;
    }

    // 计算指数退避延迟：2s, 4s, 8s, 16s, 32s
    const delay = BASE_RETRY_DELAY * Math.pow(2, MAX_RETRIES - retries);

    console.warn(`请求失败，${delay}ms 后重试 (剩余 ${retries} 次): ${url}`);
    console.warn(`错误信息: ${message}`);

    // 等待后重试
    await sleep(delay);

    return fetchText(url, retries - 1);
  }
}
