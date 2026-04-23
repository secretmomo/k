import { replyTextMessage } from '@k/notifier/lark';

import { Handler } from './handler';

export class ExitHandler extends Handler {
  isMatch(text: string) {
    return text === 'exit';
  }

  async process(message_id: string): Promise<void> {
    await replyTextMessage(message_id, '退出程序');
    process.exit(0);
  }
}
