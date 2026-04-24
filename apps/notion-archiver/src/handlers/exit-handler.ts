import { Handler } from './handler';
import { safeExit } from '../helpers/exit';

export class ExitHandler extends Handler {
  isMatch(text: string) {
    return text === 'exit';
  }

  async process(): Promise<void> {
    await safeExit();
  }
}
