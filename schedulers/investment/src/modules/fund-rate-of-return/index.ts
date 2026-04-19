import ora from 'ora';
import { sendErrorCardMessage, sendCardMessage } from '@k/notifier/lark';
import { sleep_random } from '@k/utils';

import {
  fetchFundInfo,
  printTable,
  buildLarkCard,
  readFromNotion,
  updateNotionPage,
} from './helper';

async function main() {
  const spinner = ora('开始获取基金数据...').start();

  try {
    const infos = await readFromNotion();
    const total = infos.length;

    for (const [index, info] of infos.entries()) {
      spinner.text = `${index + 1}/${total} ${info.name} 正在获取基金数据...`;
      await fetchFundInfo(info);

      spinner.text = `${index + 1}/${total} ${info.name} 正在更新基金数据...`;
      await updateNotionPage(info);

      spinner.text = `${index + 1}/${total} ${info.name} 基金数据获取成功`;

      await sleep_random();
    }

    spinner.succeed('基金数据获取完成');

    infos.sort((a, b) => b.returnRates['1d']! - a.returnRates['1d']!);

    printTable(infos);

    await sendCardMessage(buildLarkCard(infos));
  } catch (e) {
    await sendErrorCardMessage(`获取基金数据失败: ${e}`);

    spinner.fail('基金数据获取失败');
    process.exit(1);
  }
}

await main();
