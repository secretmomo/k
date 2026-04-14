import * as lark from '@larksuiteoapi/node-sdk';

import type { Post } from './post.type';
import type {
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardBody,
  InteractiveCardElement,
  InteractiveCardMarkdownElement,
  InteractiveCardButtonElement,
} from './card.type';

export type {
  Post,
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardBody,
  InteractiveCardElement,
  InteractiveCardMarkdownElement,
  InteractiveCardButtonElement,
};

const client = new lark.Client({
  appId: process.env.LARK_APP_ID ?? '',
  appSecret: process.env.LARK_APP_SECRET ?? '',
});
const chatId = process.env.LARK_CHAT_ID ?? '';

/**
 * 发送普通文本消息，文档地址：
 * https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#c9e08671
 */
export async function sendTextMessage(message: string) {
  return client.im.v1.message.create({
    params: {
      receive_id_type: 'chat_id',
    },
    data: {
      receive_id: chatId,
      msg_type: 'text',
      content: JSON.stringify({ text: message }),
    },
  });
}

/**
 * 发送富文本消息，文档地址：
 * https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#45e0953e
 */
export async function sendPostMessage(content: string) {
  return await client.im.v1.message.create({
    params: { receive_id_type: 'chat_id' },
    data: {
      receive_id: chatId,
      msg_type: 'post',
      content,
    },
  });
}

/**
 * 发送卡片消息，文档地址：
 * https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#3ea4c2d5
 */
export async function sendCardMessage(content: string) {
  return await client.im.v1.message.create({
    params: { receive_id_type: 'chat_id' },
    data: {
      receive_id: chatId,
      msg_type: 'interactive',
      content,
    },
  });
}

export async function sendErrorCardMessage(content: string) {
  const tpl: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header: {
      template: 'red',
      padding: '8px 8px 8px 8px',
      icon: { tag: 'standard_icon', token: 'buzz_outlined' },
      title: { content: '错误提示', tag: 'plain_text' },
    },
    body: {
      direction: 'vertical',
      elements: [
        {
          tag: 'markdown',
          content: `<font color="red">${content}</font>`,
          text_size: 'normal_v2',
          text_align: 'left',
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  if (process.env.RUN_URL) {
    tpl.body.elements.push({
      tag: 'button',
      type: 'danger_filled',
      width: 'default',
      size: 'tiny',
      margin: '0px 0px 0px 0px',
      behaviors: [
        {
          type: 'open_url',
          default_url: process.env.RUN_URL,
        },
      ],
      text: {
        tag: 'plain_text',
        content: '查看详情',
      },
    });
  }

  return await sendCardMessage(JSON.stringify(tpl));
}
