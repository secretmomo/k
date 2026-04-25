import Table from 'cli-table3';
import * as cheerio from 'cheerio';
import type { InteractiveCard, InteractiveCardBody, InteractiveCardHeader } from '@k/notifier/lark';
import {
  n,
  newNotionClient,
  traverseDataSource,
  type PageObjectResponse,
  type RichTextItemResponse,
} from '@k/notion';
import { dateToNow, fetchText, fixed4, toPercentage } from '@k/utils';

import type { FundInfo, FundReturnRates } from './types';

export async function readFromNotion(): Promise<FundInfo[]> {
  const pages: FundInfo[] = [];

  await traverseDataSource((item: PageObjectResponse) => {
    const titleProperty = item.properties['基金名称'];
    const codeProperty = item.properties['基金代码'] as unknown as {
      rich_text: RichTextItemResponse[];
    };

    if (titleProperty?.type !== 'title') {
      throw new Error('基金名称属性不是 title 类型');
    }

    const firstTitleItem = titleProperty.title[0];
    if (!firstTitleItem) {
      throw new Error('基金名称不能为空');
    }

    pages.push({
      id: item.id,
      name: firstTitleItem.plain_text,
      url: firstTitleItem.href ?? '',
      code: codeProperty.rich_text[0]!.plain_text,
      aum: 0,
      status: '',
      returnRates: {},
    });
  });

  return pages;
}

export async function updateNotionPage(fund: FundInfo) {
  const { id, returnRates } = fund;

  await newNotionClient().pages.update({
    page_id: id,
    properties: {
      基金规模: { number: n(fund.aum) },
      基金状态: {
        rich_text: [
          {
            type: 'text',
            text: { content: fund.status },
          },
        ],
      },
      今年以来: { number: n(returnRates.ytd) },
      成立以来: { number: n(returnRates.sinceInception) },
      '近 1 天': { number: n(returnRates['1d']) },
      '近 1 周': { number: n(returnRates['1w']) },
      '近 1 月': { number: n(returnRates['1m']) },
      '近 3 月': { number: n(returnRates['3m']) },
      '近 6 月': { number: n(returnRates['6m']) },
      '近 1 年': { number: n(returnRates['1y']) },
      '近 2 年': { number: n(returnRates['2y']) },
      '近 3 年': { number: n(returnRates['3y']) },
      '近 5 年': { number: n(returnRates['5y']) },
    },
  });
}

export function printTable(infos: FundInfo[]) {
  const table = new Table({
    head: [
      '序号',
      '基金名称',
      '近 1 天',
      '近 1 周',
      '近 1 月',
      '近 3 月',
      '近 6 月',
      '近 1 年',
      '成立以来',
    ],
    colWidths: [6, 36, 10, 10, 10, 10, 10, 10, 10],
    colAligns: [
      'center',
      'left',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
      'center',
    ],
    wordWrap: true,
  });

  infos.forEach((info, index) => {
    table.push([
      index + 1,
      info.name,
      toPercentage(info.returnRates['1d']),
      toPercentage(info.returnRates['1w']),
      toPercentage(info.returnRates['1m']),
      toPercentage(info.returnRates['3m']),
      toPercentage(info.returnRates['6m']),
      toPercentage(info.returnRates['1y']),
      toPercentage(info.returnRates.sinceInception),
    ]);
  });

  console.log(table.toString());
}

export function buildLarkCard(infos: FundInfo[]): InteractiveCard {
  const rows = infos.map((info) => ({
    name: `[${info.name}](${info.url})`,
    d: toPercentage(info.returnRates['1d']),
    w: toPercentage(info.returnRates['1w']),
    m: toPercentage(info.returnRates['1m']),
    q: toPercentage(info.returnRates['3m']),
    y: toPercentage(info.returnRates['1y']),
  }));
  const header: InteractiveCardHeader = {
    title: {
      tag: 'plain_text',
      content: `基金收益率数据（截止到 ${dateToNow()}）`,
    },
    template: 'blue',
    icon: {
      tag: 'standard_icon',
      token: 'sheet-line_outlined',
    },
  };
  const body: InteractiveCardBody = {
    direction: 'vertical',
    elements: [
      {
        tag: 'table',
        row_height: 'low',
        header_style: {
          background_style: 'grey',
          bold: true,
          lines: 1,
        },
        page_size: 10,
        margin: '0px',
        columns: [
          {
            data_type: 'markdown',
            name: 'name',
            display_name: '基金名称',
            horizontal_align: 'left',
            width: '260px',
          },
          {
            data_type: 'text',
            name: 'd',
            display_name: '近 1 天',
            horizontal_align: 'center',
            width: '80px',
          },
          {
            data_type: 'text',
            name: 'w',
            display_name: '近 1 周',
            horizontal_align: 'center',
            width: '80px',
          },
          {
            data_type: 'text',
            name: 'm',
            display_name: '近 1 月',
            horizontal_align: 'center',
            width: '80px',
          },
          {
            data_type: 'text',
            name: 'q',
            display_name: '近 3 月',
            horizontal_align: 'center',
            width: '80px',
          },
          {
            data_type: 'text',
            name: 'y',
            display_name: '近 1 年',
            horizontal_align: 'center',
            width: '80px',
          },
        ],
        rows,
      },
    ],
  };

  return {
    schema: '2.0',
    config: { update_multi: true },
    header,
    body,
  };
}

export async function fetchFundInfo(fund: FundInfo): Promise<FundInfo> {
  const url = `https://fund.eastmoney.com/${fund.code}.html`;
  const html = await fetchText(url);
  const aum = html.match(/规模<\/a>：(.*?)亿元/)?.[1];

  fund.aum = Number(aum ?? 0);
  fund.status = parseStatus(html);
  fund.returnRates = await fetchFundReturnRates(fund.code);

  return fund;
}

const BASE_URL = 'https://fundf10.eastmoney.com';

async function fetchLatestReturnRate(code: string): Promise<number> {
  const url = `${BASE_URL}/jdzf_${code}.html`;
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const text = $('label > b.lar.bold').text();
  const percentage = text.match(/\(\s(.*)%/)?.[1];

  return fixed4(Number(percentage ?? 0) / 100);
}

async function fetchFundReturnRates(code: string): Promise<FundReturnRates> {
  const url = `${BASE_URL}/FundArchivesDatas.aspx?type=jdzf&code=${code}`;
  const text = await fetchText(url);
  const html = text.replace('var apidata={ content:"', '').replace('"};', '');
  const $ = cheerio.load(html);

  const nums: (number | undefined)[] = [];

  $('.jdzfnew > ul')
    .not('.fcol')
    .each((_idx, element) => {
      const $element = $(element);
      const text = $element.find('li:nth-child(2)').text().replace('%', '');

      if (text === '---') {
        nums.push(undefined);
        return;
      }

      nums.push(fixed4(Number(text) / 100));
    });

  return {
    '1d': await fetchLatestReturnRate(code),
    '1w': nums[1], // 近 1 周
    '1m': nums[2], // 近 1 个月
    '3m': nums[3], // 近 3 个月
    '6m': nums[4], // 近 6 个月
    '1y': nums[5], // 近 1 年
    '2y': nums[6], // 近 2 年
    '3y': nums[7], // 近 3 年
    '5y': nums[8], // 近 5 年
    ytd: nums[0], // 今年以来 (Year To Date)
    sinceInception: nums[9], // 成立以来
  };
}

function parseStatus(html: string): string {
  const reg = /交易状态：<\/span><span class="staticCell">(.*?)<\/span>/;
  const matches = html.match(reg);

  if (matches && matches[1]) {
    let status = matches[1].trim();

    status = status.replace('限大额  (<span>', '');
    status = status.replace('.00', ''); // 去掉小数点后的 00

    if (status.includes('暂停申购')) {
      status = '暂停申购';
    } else if (status.includes('单日累计购买上限')) {
      status = status.replace('单日累计购买上限', '');
      status = `限购${status}`;
    }

    return status;
  }

  return '状态未知';
}
