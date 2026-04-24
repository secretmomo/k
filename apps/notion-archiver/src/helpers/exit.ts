import { sendCardMessage } from '@k/notifier/lark';
import consola from 'consola';

import { stopSuccessCard } from './lark.template';

export async function safeExit(code = 0) {
  try {
    await sendCardMessage(stopSuccessCard());
  } catch (err) {
    consola.error('清理过程出错:', err);
  }

  process.exit(code);
}
