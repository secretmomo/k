import * as cheerio from 'cheerio';
import Table from 'cli-table3';
import type { InteractiveCard, InteractiveCardBody, InteractiveCardHeader } from '@k/notifier/lark';
import { n, newNotionClient, traverseDataSource, type PageObjectResponse } from '@k/notion';
import { dateToNow } from '@k/utils';

import type { FundCompanyInfo } from './types';

export async function fetchFundCompanyInfo(data: FundCompanyInfo): Promise<FundCompanyInfo> {
  const html = await (await fetch(data.url)).text();
  const $ = cheerio.load(html);

  $('div.fund-info > ul > li').each((_idx, element) => {
    const $element = $(element);
    const text = $element.text().replace(/\s+/g, '');

    if (text.includes('管理规模')) {
      data.aum = Number(text.split(':')[1]!.replace('亿元', ''));
    } else if (text.includes('基金数量')) {
      data.fundCount = Number(text.split(':')[1]!.replace('只', ''));
    } else if (text.includes('经理人数')) {
      data.managerCount = Number(text.split(':')[1]!.replace('人', ''));
    }
  });

  return data;
}

export function printTable(infos: FundCompanyInfo[]) {
  const table = new Table({
    head: ['序号', '公司名称', '管理规模', '基金数量', '经理人数'],
    colWidths: [6, 14, 10, 10, 10],
    colAligns: ['center', 'left', 'center', 'center', 'center'],
    wordWrap: true,
  });

  infos.forEach((info, index) => {
    table.push([index + 1, info.name, info.aum, info.fundCount, info.managerCount]);
  });

  console.log(table.toString());
}

export async function readFromNotion(): Promise<FundCompanyInfo[]> {
  const infos: FundCompanyInfo[] = [];

  await traverseDataSource((item: PageObjectResponse) => {
    const titleProperty = item.properties['公司名称'];

    if (titleProperty?.type !== 'title') {
      throw new Error('公司名称属性不是 title 类型');
    }

    const firstTitleItem = titleProperty.title[0];
    if (!firstTitleItem) {
      throw new Error('公司名称不能为空');
    }

    infos.push({
      id: item.id,
      name: firstTitleItem.plain_text,
      url: firstTitleItem.href ?? '',
      aum: 0,
      fundCount: 0,
      managerCount: 0,
    });
  });

  return infos;
}

export async function updateNotionPage(info: FundCompanyInfo) {
  const { id, aum, fundCount, managerCount } = info;

  await newNotionClient().pages.update({
    page_id: id,
    properties: {
      管理规模: { number: n(aum) },
      基金数量: { number: n(fundCount) },
      经理人数: { number: n(managerCount) },
    },
  });
}

export function buildLarkCard(infos: FundCompanyInfo[]): InteractiveCard {
  const rows = infos.map((info) => ({
    name: `[${info.name}](${info.url})`,
    aum: info.aum,
    fundCount: info.fundCount,
    managerCount: info.managerCount,
  }));
  const header: InteractiveCardHeader = {
    title: {
      tag: 'plain_text',
      content: `基金公司数据排名（截止到 ${dateToNow()}）`,
    },
    template: 'blue',
    icon: {
      tag: 'standard_icon',
      token: 'room_outlined',
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
            display_name: '公司名称',
            horizontal_align: 'left',
            width: 'auto',
          },
          {
            data_type: 'number',
            name: 'aum',
            display_name: '管理规模',
            horizontal_align: 'center',
            width: '80px',
            format: { precision: 2 },
          },
          {
            data_type: 'number',
            name: 'fundCount',
            display_name: '基金数量',
            horizontal_align: 'center',
            width: '80px',
            format: { precision: 0 },
          },
          {
            data_type: 'number',
            name: 'managerCount',
            display_name: '经理人数',
            horizontal_align: 'center',
            width: '80px',
            format: { precision: 0 },
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
