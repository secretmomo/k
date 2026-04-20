import { notion, uploadLocalFileToPageBody } from '@k/notion';

interface CreatePageOptions {
  title: string;
  url: string;
  htmlFilePath: string;
  tags: string[];
}

/** 从 API 返回的 page（或任意带 `id` 的对象）拼出可在浏览器打开的 Notion 页面地址 */
function notionPageWebUrl(pageId: string): string {
  return `https://www.notion.so/${pageId.replace(/-/g, '')}`;
}

function getSourceName(url: string): string {
  if (url.startsWith('https://mp.weixin.qq.com/')) return '微信公众号';

  return '网页';
}

export async function createPage(options: CreatePageOptions) {
  const { title, url, tags, htmlFilePath } = options;

  const page = await notion.pages.create({
    parent: { data_source_id: process.env.NOTION_DATA_SOURCE_ID ?? '' },
    properties: {
      名称: {
        title: [
          {
            type: 'text',
            text: {
              content: title,
              link: { url },
            },
          },
        ],
      },
      来源: {
        select: { name: getSourceName(url) },
      },
      标签: {
        multi_select: tags.map((tag) => ({ name: tag })),
      },
    },
  });

  await uploadLocalFileToPageBody(page.id, htmlFilePath);

  return notionPageWebUrl(page.id);
}
