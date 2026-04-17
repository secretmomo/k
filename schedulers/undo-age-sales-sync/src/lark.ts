import {
  sendCardMessage,
  type InteractiveCard,
  type InteractiveCardHeader,
  type InteractiveCardBody,
} from '@k/notifier/lark';

import type { PageItem } from './types';

export async function success(pages: PageItem[]) {
  const rows = pages.map((page) => ({
    name: `[${page.title}](${page.url})`,
    latest: page.lastSoldCount,
    history: page.soldCount,
  }));

  const header: InteractiveCardHeader = {
    template: 'blue',
    title: {
      tag: 'plain_text',
      content: '营养工厂销量数据',
    },
    icon: {
      tag: 'standard_icon',
      token: 'sheet-line_outlined',
    },
    padding: '8px',
  };
  const body: InteractiveCardBody = {
    direction: 'vertical',
    padding: '8px',
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
      {
        tag: 'button',
        text: {
          tag: 'plain_text',
          content: '任务地址',
        },
        type: 'primary_filled',
        width: 'default',
        size: 'small',
        margin: '0px',
        behaviors: [{ type: 'open_url', default_url: process.env.RUN_URL! }],
      },
    ],
  };
  const template: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header,
    body,
  };

  return sendCardMessage(JSON.stringify(template));
}
