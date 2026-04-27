import { unlinkSync } from 'node:fs';
import { basename } from 'node:path';

import { traverseDataSource } from '@k/notion';

import { Handler } from './handler';
import { parseTitle } from '../helpers/title-parser';
import { createPage } from '../helpers/notion';
import { downloadWebpage } from '../helpers/webpage-downloader';
import { LarkCardState } from '../helpers/lark-card-state';
import { screenshot } from '../helpers/screenshot';

const tagMap: Record<string, string> = {
  t: '待读',
  h: '重要',
};

export class WebpageHandler extends Handler {
  /**
   * 已保存的 URL 集合，避免重复保存
   */
  private urls = new Set<string>();

  constructor() {
    super();

    // 从 Notion 中获取已保存的 URL 集合
    traverseDataSource((item) => {
      const titleProperty = item.properties['名称'];

      if (titleProperty?.type !== 'title') {
        throw new Error('名称属性不是 title 类型');
      }

      const firstTitleItem = titleProperty.title[0];

      if (firstTitleItem?.href) {
        this.urls.add(firstTitleItem.href);
      }
    });
  }

  isMatch(text: string) {
    return text.startsWith('http://') || text.startsWith('https://');
  }

  async process(message_id: string, text: string): Promise<void> {
    // 1. 初始化卡片状态
    const state = new LarkCardState();
    state.logger.info(`1. 初始化卡片状态 messageId: ${message_id}`);
    await state.init(message_id, '1. 正在解析网页标题...');

    // 2. 解析标题、URL、标签
    const [url = '', ...tags] = text.split(' ');

    if (this.urls.has(url)) {
      await state.error(`该 URL 已保存：${url}`);
      return;
    } else {
      this.urls.add(url);
    }

    const title = await parseTitle(url);

    tags.forEach((tag, i) => {
      tags[i] = tagMap[tag.toLowerCase()] ?? tag;
    });

    state.logger.info(`2. title: ${title}, tags: ${tags.join(',')}`);

    const tagsString = tags.map((tag) => `<text_tag color='blue'>${tag}</text_tag>`).join('');
    await state.update(`1. 标题：[${title}](${url}) ${tagsString}`, '2. 正在下载网页内容...');

    // 3. 下载网页内容
    const htmlFilePath = await downloadWebpage(url);
    state.logger.info(`3. htmlFileName: ${basename(htmlFilePath)}`);
    await state.update(`2. 文件路径：\`${basename(htmlFilePath)}\``, '3. 正在创建 Notion 页面...');

    // 4. 创建 Notion 页面
    const notionLink = await createPage({ title, url, tags, htmlFilePath });
    state.logger.info(`4. notionLink: ${notionLink}`);
    await state.update(`3. [Notion 页面链接](${notionLink})`, '4. 正在生成预览图...');

    // 5. 生成预览图，并更新卡片状态
    const imagePath = await screenshot(htmlFilePath);
    await state.success({
      title,
      tags,
      notionLink,
      imagePath,
    });

    // 6. 清理资源，删除图片和网页
    unlinkSync(imagePath);
    unlinkSync(htmlFilePath);
  }
}
