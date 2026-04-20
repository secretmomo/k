import fs from 'node:fs';

import * as lark from '@larksuiteoapi/node-sdk';

import type { Post } from './types/post.type';
import type {
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardBody,
  InteractiveCardElement,
  InteractiveCardMarkdownElement,
  InteractiveCardButtonElement,
} from './types/card.type';
import type { LarkMessageReceiveEvent } from './types/receive.type';

export type {
  Post,
  InteractiveCard,
  InteractiveCardHeader,
  InteractiveCardBody,
  InteractiveCardElement,
  InteractiveCardMarkdownElement,
  InteractiveCardButtonElement,
  LarkMessageReceiveEvent,
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
export async function sendPostMessage(post: Post) {
  return await client.im.v1.message.create({
    params: { receive_id_type: 'chat_id' },
    data: {
      receive_id: chatId,
      msg_type: 'post',
      content: JSON.stringify(post),
    },
  });
}

/**
 * 发送卡片消息，文档地址：
 * https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#3ea4c2d5
 */
export async function sendCardMessage(card: InteractiveCard) {
  return await client.im.v1.message.create({
    params: { receive_id_type: 'chat_id' },
    data: {
      receive_id: chatId,
      msg_type: 'interactive',
      content: JSON.stringify(card),
    },
  });
}

/**
 * 发送通用的错误卡片消息
 */
export async function sendErrorCardMessage(message: string) {
  const card: InteractiveCard = {
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
          content: `<font color="red">${message}</font>`,
          text_size: 'normal_v2',
          text_align: 'left',
          margin: '0px 0px 0px 0px',
        },
      ],
    },
  };

  if (process.env.RUN_URL) {
    card.body.elements.push({
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

  return await sendCardMessage(card);
}

/**
 * [回复文本消息](https://open.feishu.cn/document/server-docs/im-v1/message/reply)
 */
export async function replyTextMessage(message_id: string, message: string) {
  return await client.im.v1.message.reply({
    path: { message_id },
    data: {
      msg_type: 'text',
      reply_in_thread: false,
      content: JSON.stringify({ text: message }),
    },
  });
}

export async function replyCardMessage(message_id: string, card: InteractiveCard) {
  return await client.im.v1.message.reply({
    path: { message_id },
    data: {
      msg_type: 'interactive',
      reply_in_thread: false,
      content: JSON.stringify(card),
    },
  });
}

/**
 * 更新卡片消息，文档地址：
 * https://open.feishu.cn/document/server-docs/im-v1/message-card/patch
 */
export async function updateCardMessage(message_id: string, card: InteractiveCard) {
  return await client.im.v1.message.patch({
    path: { message_id },
    data: {
      content: JSON.stringify(card),
    },
  });
}

export async function uploadImage(filePath: string): Promise<string> {
  const res = await client.im.v1.image.create({
    data: {
      image_type: 'message',
      image: fs.readFileSync(filePath),
    },
  });

  return res!.image_key!;
}

/**
 * 启动 WebSocket 客户端
 *
 * @param callback 回调函数
 */
export function startWsClient(callback: (event: LarkMessageReceiveEvent) => void) {
  const wsClient = new lark.WSClient({
    appId: process.env.LARK_APP_ID ?? '',
    appSecret: process.env.LARK_APP_SECRET ?? '',
  });

  wsClient.start({
    eventDispatcher: new lark.EventDispatcher({}).register({ 'im.message.receive_v1': callback }),
  });
}
