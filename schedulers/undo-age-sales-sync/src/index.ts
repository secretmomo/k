import { sendErrorCardMessage } from '@k/notifier/lark';

import { fetchPages, updatePage } from './notion';
import { fetchSoldCount, printTable } from './helper';
import { success } from './lark';

async function main() {
  try {
    const pages = await fetchPages();

    for (const page of pages) {
      page.lastSoldCount = await fetchSoldCount(page.url);
      await updatePage(page);
    }

    pages.sort((a, b) => b.lastSoldCount - a.lastSoldCount);

    printTable(pages);
    await success(pages);
  } catch (e) {
    console.error(e);
    await sendErrorCardMessage(e instanceof Error ? e.message : '未知错误');
    process.exit(1);
  }
}

await main();
