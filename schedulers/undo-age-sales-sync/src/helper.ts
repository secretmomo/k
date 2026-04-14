import Table from 'cli-table3';

import type { PageItem } from './types';

export async function fetchSoldCount(url: string): Promise<number> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const html = await (await fetch(url)).text();
  const match = html.match(/,"soldNum":(\d+)/);

  return match?.[1] ? Number(match[1]) : 0;
}

export function printTable(pages: PageItem[]) {
  const table = new Table({
    head: ['序号', '产品名称', '历史销量', '最新销量'],
    colWidths: [6, 32, 10, 10],
    colAligns: ['center', 'left', 'center', 'center'],
    wordWrap: true,
  });

  pages.forEach((page, index) => {
    table.push([index + 1, page.title, page.soldCount, page.lastSoldCount]);
  });

  console.log(table.toString());
}
