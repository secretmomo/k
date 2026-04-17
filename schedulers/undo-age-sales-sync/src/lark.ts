import { sendCardMessage, type InteractiveCard, type InteractiveCardBody } from '@k/notifier/lark';

import type { PageItem } from './types';

export async function success(pages: PageItem[]) {
  const rows = pages.map((page) => ({
    name: `[${page.title}](${page.url})`,
    latest: page.lastSoldCount,
    history: page.soldCount,
  }));

  const body: InteractiveCardBody = {
    direction: 'vertical',
    elements: [
      {
        tag: 'table',
        row_height: 'low',
        header_style: {
          background_style: 'none',
          bold: true,
          lines: 1,
        },
        page_size: 10,
        margin: '0px',
        columns: [
          {
            data_type: 'markdown',
            name: 'name',
            display_name: '产品名称',
            horizontal_align: 'left',
            width: 'auto',
          },
          {
            data_type: 'number',
            name: 'latest',
            display_name: '最新销量',
            horizontal_align: 'center',
            width: '80px',
            format: { precision: 0 },
          },
          {
            data_type: 'number',
            name: 'history',
            display_name: '历史销量',
            horizontal_align: 'center',
            width: '80px',
            format: { precision: 0 },
          },
        ],
        rows,
      },
    ],
  };
  const template: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    body,
  };

  return sendCardMessage(JSON.stringify(template));
}
