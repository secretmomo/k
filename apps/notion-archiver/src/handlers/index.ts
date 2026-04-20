import type { Handler } from './handler';
import { UnknownHandler } from './unknown-handler';
import { WebpageHandler } from './webpage-handler';

const handlers: Handler[] = [new WebpageHandler(), new UnknownHandler()];

export function handle(message_id: string, text: string) {
  for (const handler of handlers) {
    if (handler.isMatch(text)) {
      return handler.process(message_id, text);
    }
  }
}
