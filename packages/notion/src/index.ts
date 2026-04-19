import { basename } from 'node:path';

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

/**
 * 将本地文件经 Notion File Upload API 上传后，作为「文件」块挂到页面正文中。
 * @param pageId - 页面 ID
 * @param absolutePath - 本地文件路径
 */
export async function uploadLocalFileToPageBody(pageId: string, absolutePath: string) {
  const displayName = basename(absolutePath);
  const file = Bun.file(absolutePath);

  if (!(await file.exists())) {
    throw new Error(`找不到要上传的文件: ${absolutePath}`);
  }

  // Blob 必须带与 create 时相同的 MIME
  // 否则 multipart 会落成 application/octet-stream，Notion 会校验失败
  const contentType = 'text/html';
  const data = new Blob([await file.arrayBuffer()], { type: contentType });
  const created = await notion.fileUploads.create({
    mode: 'single_part',
    filename: displayName,
    content_type: contentType,
  });

  const afterSend = await notion.fileUploads.send({
    file_upload_id: created.id,
    file: { filename: displayName, data },
  });

  if (afterSend.status !== 'uploaded') {
    throw new Error(`文件上传未就绪，状态: ${afterSend.status}`);
  }

  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        type: 'file',
        file: {
          type: 'file_upload',
          file_upload: { id: created.id },
          name: displayName,
        },
      },
    ],
  });
}
