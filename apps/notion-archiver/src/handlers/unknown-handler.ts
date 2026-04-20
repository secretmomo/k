import { replyTextMessage } from '@k/notifier/lark';

import { Handler } from './handler';

export class UnknownHandler extends Handler {
  isMatch() {
    return true;
  }

  async process(message_id: string, text: string): Promise<void> {
    await replyTextMessage(message_id, `无法处理消息：${text}`);
  }
}
