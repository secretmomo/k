import { Handler } from './handler';
import { parseTitle } from '../helpers/title-parser';
import { createPage } from '../helpers/notion';
import { downloadWebpage } from '../helpers/webpage-downloader';
import { LarkCardState } from '../helpers/lark-card-state';
import { screenshot } from '../helpers/screenshot';

export class WebpageHandler extends Handler {
  isMatch(text: string) {
    return text.startsWith('http://') || text.startsWith('https://');
  }

  async process(message_id: string, text: string): Promise<void> {
    // 1. 初始化卡片状态
    const state = new LarkCardState();
    await state.init(message_id);

    // 2. 解析标题、URL、标签
    const [url = '', ...tags] = text.split(' ');
    const title = await parseTitle(url);

    tags.forEach((tag, i) => {
      tags[i] = tag.toUpperCase().trim();
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
  }
}
