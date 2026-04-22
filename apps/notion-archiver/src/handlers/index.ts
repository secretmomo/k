import { sendErrorCardMessage } from '@k/notifier/lark';
import consola from 'consola';

import type { Handler } from './handler';
import { UnknownHandler } from './unknown-handler';
import { WebpageHandler } from './webpage-handler';

const handlers: Handler[] = [new WebpageHandler(), new UnknownHandler()];

export async function handle(message_id: string, text: string) {
  for (const handler of handlers) {
    if (handler.isMatch(text)) {
      try {
        await handler.process(message_id, text);
      } catch (e: unknown) {
        consola.error(e);

        if (e instanceof Error) {
          await sendErrorCardMessage(`存在未捕获的异常：\n${e.message}。`);
        } else {
          await sendErrorCardMessage('存在未捕获的异常：未知错误。');
        }
      }

      return;
    }
  }
}
