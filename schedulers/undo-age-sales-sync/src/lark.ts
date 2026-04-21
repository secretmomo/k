import {
  sendCardMessage,
  type InteractiveCard,
  type InteractiveCardBody,
  type InteractiveCardHeader,
} from '@k/notifier/lark';
import { dateToNow } from '@k/utils';

import type { PageItem } from './types';

export async function success(pages: PageItem[]) {
  const rows = pages.map((page) => ({
    name: `[${page.title}](${page.url})`,
    latest: page.lastSoldCount,
    history: page.soldCount,
  }));

  const header: InteractiveCardHeader = {
    title: {
      tag: 'plain_text',
      content: `营养工厂销量数据（截止到 ${dateToNow()}）`,
    },
    template: 'blue',
    icon: {
      tag: 'standard_icon',
      token: 'sheet-line_outlined',
    },
  };
  const body: InteractiveCardBody = {
    direction: 'vertical',
    elements: [
      {
        tag: 'table',
        row_height: 'low',
        header_style: {
          background_style: 'grey',
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
  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header,
    body,
  };

  return sendCardMessage(card);
}
