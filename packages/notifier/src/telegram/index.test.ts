import { expect, test, describe } from 'bun:test';

import { sendMessage } from './index';

describe('telegram', () => {
  test('send message failed', async () => {
    const res = await sendMessage('Hello, world!');

    expect(res.ok).toBe(false);
  });

  test('send message success', async () => {
    const res = await sendMessage('Hello, world\\!');

    expect(res.ok).toBe(true);
  });
});
