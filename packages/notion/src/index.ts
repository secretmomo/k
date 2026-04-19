import {
  Client,
  type NumberPropertyItemObjectResponse,
  type PageObjectResponse,
  type RichTextItemResponse,
} from '@notionhq/client';

export type { NumberPropertyItemObjectResponse, PageObjectResponse, RichTextItemResponse };

export function n(num?: number) {
  return num ?? null;
}

export const notion = new Client({
  auth: process.env.NOTION_AUTH_TOKEN,
});

export async function traverseDataSource(cb: (item: PageObjectResponse) => void) {
  const data = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATA_SOURCE_ID ?? '',
  });

  data.results.forEach((item) => cb(item as PageObjectResponse));
}
