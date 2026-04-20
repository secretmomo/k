import { startWsClient, type LarkMessageReceiveEvent } from '@k/notifier/lark';

import { handle } from './handlers';

function dispatcher(event: LarkMessageReceiveEvent) {
  const { message, sender } = event;

  const isTextMessage = message?.message_type === 'text'; // 只处理文本消息
  const isGroupMessage = message?.chat_type === 'group'; // 只处理群消息
  const isTheChat = message?.chat_id === process.env.LARK_CHAT_ID; // 只处理指定群的消息
  const isTheUser = sender?.sender_id?.user_id === process.env.LARK_USER_ID; // 只处理指定用户的消息

  if (isTextMessage && isGroupMessage && isTheChat && isTheUser) {
    const message_id = message?.message_id ?? '';
    const content = message?.content ?? '';
    const text = JSON.parse(content).text ?? '';

    handle(message_id, text);
  }
}

startWsClient(dispatcher);
