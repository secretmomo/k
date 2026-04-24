import { unlinkSync } from 'node:fs';

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
    await state.init(message_id);

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

    await state.updateTitle(title, url, tags);

    // 3. 下载网页内容
    const htmlFilePath = await downloadWebpage(url);
    await state.updateHtmlFilePath(htmlFilePath);

    // 4. 创建 Notion 页面
    const notionLink = await createPage({ title, url, tags, htmlFilePath });
    await state.updateNotionLink(notionLink);

    // 5. 生成预览图，并更新卡片状态
    const imagePath = await screenshot(htmlFilePath);
    await state.success(imagePath);

    // 6. 清理资源，删除图片和网页
    unlinkSync(imagePath);
    unlinkSync(htmlFilePath);
  }
}
