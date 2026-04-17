import ora from 'ora';
import { sendErrorCardMessage } from '@k/notifier/lark';

import { fetchPages, updatePage } from './notion';
import { fetchSoldCount, printTable } from './helper';
import { success } from './lark';

async function main() {
  try {
    const pages = await fetchPages();
    const total = pages.length;
    const spinner = ora('开始获取销量...').start();

    for (const [index, page] of pages.entries()) {
      spinner.text = `${index + 1}/${total} ${page.title} 正在获取销量...`;
      page.lastSoldCount = await fetchSoldCount(page.url);
      spinner.text = `${index + 1}/${total} ${page.title} 正在更新销量...`;
      await updatePage(page);
      spinner.text = `${index + 1}/${total} ${page.title} 销量更新成功`;
    }

    spinner.succeed('销量更新完成');

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
