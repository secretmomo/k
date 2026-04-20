import * as cheerio from 'cheerio';
import { fetchText } from '@k/utils';

/**
 * 解析网页标题，优先使用 og:title 标签，否则使用 title 标签。
 * @param url - 网页 URL
 * @returns 网页标题
 */
export async function parseTitle(url: string): Promise<string> {
  const text = await fetchText(url);
  const $ = cheerio.load(text);
  const title = $("meta[property='og:title']").attr('content')?.trim();

  return title || $('title').text().trim();
}
