import {
  Client,
  type NumberPropertyItemObjectResponse,
  type PageObjectResponse,
} from '@notionhq/client';

import type { PageItem } from './types';

const notion = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

export async function fetchPages(): Promise<PageItem[]> {
  const result: PageItem[] = [];
  const data = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATA_SOURCE_ID ?? '',
  });

  data.results.forEach((i) => {
    const item = i as unknown as PageObjectResponse;
    const titleProperty = item.properties['产品名称'];
    const soldCountProperty = item.properties['销量'] as NumberPropertyItemObjectResponse;

    if (titleProperty?.type !== 'title') {
      throw new Error('产品名称属性不是 title 类型');
    }

    const firstTitleItem = titleProperty.title[0];

    if (firstTitleItem) {
      result.push({
        id: item.id,
        title: firstTitleItem.plain_text,
        url: firstTitleItem.href ?? '',
        soldCount: soldCountProperty.number ?? 0,
        lastSoldCount: 0,
      });
    }
  });

  return result;
}

export async function updatePage({ id, lastSoldCount }: PageItem) {
  await notion.pages.update({
    page_id: id,
    properties: {
      销量: {
        number: lastSoldCount,
      },
    },
  });
}
