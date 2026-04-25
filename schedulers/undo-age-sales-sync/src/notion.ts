import {
  newNotionClient,
  traverseDataSource,
  type NumberPropertyItemObjectResponse,
  type PageObjectResponse,
} from '@k/notion';

import type { PageItem } from './types';

export async function fetchPages(): Promise<PageItem[]> {
  const result: PageItem[] = [];

  await traverseDataSource((item: PageObjectResponse) => {
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
  await newNotionClient().pages.update({
    page_id: id,
    properties: {
      销量: {
        number: lastSoldCount,
      },
    },
  });
}
