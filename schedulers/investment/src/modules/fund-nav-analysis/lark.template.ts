import { fixed2, fixed4 } from '@k/utils';
import type { InteractiveCard, InteractiveCardHeader } from '@k/notifier/lark';

import type { AnalyzeFundNavResult } from './types';

function findMinMax(values: number[]): { min: number; max: number } {
  const result = { min: values[0]!, max: values[0]! };

  for (const value of values) {
    if (value < result.min) {
      result.min = value;
    }
    if (value > result.max) {
      result.max = value;
    }
  }

  result.min = Number(Math.floor(result.min * 100) / 100);
  result.max = Number(Math.ceil(result.max * 100) / 100);

  return result;
}

function buildHeader(fundNavAnalysis: AnalyzeFundNavResult) {
  const { fundName, fundCode } = fundNavAnalysis;
  const header: InteractiveCardHeader = {
    template: 'blue',
    padding: '8px 8px 8px 8px',
    icon: { tag: 'standard_icon', token: 'sheet-line_outlined' },
    title: {
      content: `${fundName}(${fundCode})`,
      tag: 'plain_text',
    },
  };

  return header;
}

export function buildFundNavAnalysisCardMessage(fundNavAnalysis: AnalyzeFundNavResult): string {
  const {
    fundHomePageUrl,
    etfHomePageUrl,
    todayEstimatedChange,
    todayEstimatedDate,
    lastNav,
    lastNavDate,
    lastNavChange,
    lastNavPercentileInHistory,
    lastNavPercentileInLastYear,
    lowestNavInHistory,
    lowestNavInHistoryDate,
    highestNavInHistory,
    highestNavInHistoryDate,
    lastMonthNavList,
  } = fundNavAnalysis;
  const color = lastNavChange > 0 ? 'red' : lastNavChange < 0 ? 'green' : 'grey';
  const etfColor = todayEstimatedChange > 0 ? 'red' : todayEstimatedChange < 0 ? 'green' : 'grey';
  const estimatedNav = fixed4(lastNav * (1 + todayEstimatedChange / 100));
  const values = lastMonthNavList
    .map((d) => {
      return { date: d.date.substring(5), value: d.value }; //Math.round(d.value * 10000)
    })
    .reverse();
  const { min, max } = findMinMax(values.map((d) => d.value));
  const isSameDay = lastNavDate === todayEstimatedDate;
  const card: InteractiveCard = {
    schema: '2.0',
    config: { update_multi: true },
    header: buildHeader(fundNavAnalysis),
    body: {
      direction: 'vertical',
      elements: [
        {
          tag: 'column_set',
          flex_mode: 'stretch',
          horizontal_spacing: '12px',
          horizontal_align: 'left',
          columns: [
            {
              tag: 'column',
              width: 'weighted',
              background_style: `${color}-50`,
              action: { multi_url: { url: fundHomePageUrl } },
              elements: [
                {
                  tag: 'markdown',
                  content: `**<font color='grey'>最新净值</font> <text_tag color='${color}'>${lastNavChange}%</text_tag>**`,
                  text_size: 'normal',
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `## <font color='grey'>${lastNav}</font>`,
                  text_align: 'center',
                },
                {
                  tag: 'markdown',
                  content: `<font color='grey'>${lastNavDate}</font>`,
                  text_align: 'center',
                  text_size: 'normal',
                },
              ],
              padding: '12px 12px 12px 12px',
              direction: 'vertical',
              horizontal_spacing: '8px',
              vertical_spacing: '2px',
              horizontal_align: 'left',
              vertical_align: 'top',
              weight: 1,
            },
            isSameDay
              ? null
              : {
                  tag: 'column',
                  width: 'weighted',
                  background_style: `${etfColor}-50`,
                  action: { multi_url: { url: etfHomePageUrl } },
                  elements: [
                    {
                      tag: 'markdown',
                      content: `**<font color='grey'>预估净值</font> <text_tag color='${etfColor}'>${todayEstimatedChange}%</text_tag>**`,
                      text_size: 'normal',
                      text_align: 'center',
                    },
                    {
                      tag: 'markdown',
                      content: `## <font color='gray'>${estimatedNav}</font>`,
                      text_align: 'center',
                    },
                    {
                      tag: 'markdown',
                      content: `<font color='grey'>${todayEstimatedDate}</font>`,
                      text_align: 'center',
                      text_size: 'normal',
                    },
                  ],
                  padding: '12px 12px 12px 12px',
                  direction: 'vertical',
                  horizontal_spacing: '8px',
                  vertical_spacing: '2px',
                  horizontal_align: 'left',
                  vertical_align: 'top',
                  weight: 1,
                },
          ],
        },
        {
          tag: 'markdown',
          content: `> 近一年：**${fixed2(lastNavPercentileInLastYear * 100)}%**，成立以来：**${fixed2(lastNavPercentileInHistory * 100)}%**，[任务地址](${process.env.RUN_URL})。`,
          text_size: 'normal',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'chart',
          chart_spec: {
            data: {
              values,
            },
            line: {
              style: {
                lineWidth: 2,
                stroke: 'blue',
              },
            },
            point: {
              visible: true,
            },
            title: {
              text: '最近一个月净值走势',
            },
            type: 'line',
            xField: 'date',
            yField: 'value',
            axes: [
              {
                orient: 'left',
                min,
                max,
              },
            ],
          },
          preview: true,
          aspect_ratio: '2:1',
          height: 'auto',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'hr',
          margin: '0px 0px 0px 0px',
        },
        {
          tag: 'div',
          icon: {
            tag: 'standard_icon',
            token: 'info_outlined',
            color: 'light_grey',
          },
          text: {
            tag: 'plain_text',
            content: `最低 ${lowestNavInHistoryDate} ${lowestNavInHistory} ，最高 ${highestNavInHistoryDate} ${highestNavInHistory}。`,
            text_size: 'notation',
            text_align: 'left',
            text_color: 'grey',
          },
        },
      ],
    },
  };

  return JSON.stringify(card);
}
