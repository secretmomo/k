import { sleep } from 'bun';

export function sleep_random() {
  return sleep(Math.floor(Math.random() * 500) + 750);
}
