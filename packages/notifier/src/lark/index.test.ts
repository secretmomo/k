import { test, expect } from 'bun:test';

import {
  sendTextMessage,
  sendPostMessage,
  sendCardMessage,
  sendErrorCardMessage,
  type InteractiveCard,
  type Post,
} from './index';

test('sendTextMessage', async () => {
  const result = await sendTextMessage(`TEST ${new Date().toISOString()}`);
  expect(result).toBeDefined();
});

test('sendPostMessage', async () => {
  const post: Post = {
    zh_cn: {
      title: `TEST ${new Date().toISOString()}`,
      content: [
        [
          {
            tag: 'text',
            text: 'Hello, world!',
          },
        ],
        [
          {
            tag: 'emotion',
            emoji_type: 'SMILE',
          },
        ],
      ],
    },
  };

  const result = await sendPostMessage(post);
  expect(result).toBeDefined();
});

test('sendCardMessage', async () => {
  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header: {
      template: 'green',
      padding: '12px 8px 12px 8px',
      icon: { tag: 'standard_icon', token: 'sheet-line_outlined' },
      title: {
        content: `TEST ${new Date().toISOString()}`,
        tag: 'plain_text',
      },
      subtitle: {
        tag: 'plain_text',
        content: '',
      },
    },
    body: {
      direction: 'vertical',
      padding: '12px 12px 12px 12px',
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'plain_text',
            content: '示例文本',
            text_size: 'normal_v2',
            text_align: 'left',
            text_color: 'default',
          },
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  const result = await sendCardMessage(card);
  expect(result).toBeDefined();
});

test('errorCardMessage', async () => {
  const result = await sendErrorCardMessage('测试错误信息');
  expect(result).toBeDefined();
});
