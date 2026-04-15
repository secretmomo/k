import { fixed4, timestampToDate } from '@k/utils';

import type { AnalyzeFundNavResult, FundNavData } from './types';

export class Xueqiu {
  async analyzeFundNav(fundCode: string, etfCode: string): Promise<AnalyzeFundNavResult> {
    const result: AnalyzeFundNavResult = {
      fundCode,
      fundName: '',
      fundHomePageUrl: `https://danjuanfunds.com/funding/${fundCode}`,
      etfHomePageUrl: `https://xueqiu.com/S/${etfCode}`,
      todayEstimatedChange: 0,
      todayEstimatedDate: '',
      lastNav: 0,
      lastNavDate: '',
      lastNavChange: 0,
      lastNavPercentileInHistory: 0,
      lastNavPercentileInLastYear: 0,
      lowestNavInHistory: 0,
      lowestNavInHistoryDate: '',
      highestNavInHistory: 0,
      highestNavInHistoryDate: '',
      lastMonthNavList: [],
    };
    const fundNavList = await this.fetchFundNavList(fundCode);
    const estimatedNavData = await this.fetchTodayEstimatedChange(etfCode);
    const lowestNavInHistory = this.findLowestNavInHistory(fundNavList);
    const highestNavInHistory = this.findHighestNavInHistory(fundNavList);

    result.fundName = await this.fetchFundName(fundCode);
    result.todayEstimatedChange = estimatedNavData.percent ?? 0;
    result.todayEstimatedDate = timestampToDate(estimatedNavData.timestamp);
    result.lastNav = fundNavList[0]!.value;
    result.lastNavDate = fundNavList[0]!.date;
    result.lastNavChange = fundNavList[0]!.percentage;
    result.lastNavPercentileInHistory = this.calcPercentile(
      fundNavList.slice(1).map((d) => d.value),
      fundNavList[0]!.value,
    );
    result.lastNavPercentileInLastYear = this.calcPercentile(
      this.filterByDays(fundNavList, 365)
        .slice(1)
        .map((d) => d.value),
      fundNavList[0]!.value,
    );
    result.lowestNavInHistory = lowestNavInHistory.value;
    result.lowestNavInHistoryDate = lowestNavInHistory.date;
    result.highestNavInHistory = highestNavInHistory.value;
    result.highestNavInHistoryDate = highestNavInHistory.date;
    result.lastMonthNavList = this.filterByDays(fundNavList, 30);

    return result;
  }

  private async fetchFundName(fundCode: string): Promise<string> {
    const url = `https://danjuanfunds.com/djapi/fund/${fundCode}`;
    const response = await fetch(url);
    const { data } = (await response.json()) as any;

    return data?.fd_name;
  }

  private async fetchFundNavList(fundCode: string): Promise<FundNavData[]> {
    const url = `https://danjuanfunds.com/djapi/fund/nav/history/${fundCode}?page=1&size=10000`;
    const response = await fetch(url);
    const {
      data: { items },
      result_code,
    } = (await response.json()) as any;

    if (result_code !== 0) {
      throw new Error(`Failed to fetch fund nav list: ${result_code}`);
    }

    return items.map(({ date, value, percentage }: any) => ({
      date,
      value: Number(value),
      percentage: Number(percentage),
    }));
  }

  private async fetchTodayEstimatedChange(etfCode: string): Promise<any> {
    const url = `https://stock.xueqiu.com/v5/stock/realtime/quotec.json?symbol=${etfCode}&_=${Date.now()}`;
    const response = await fetch(url);
    const { data } = (await response.json()) as any;

    return data[0];
  }

  private findLowestNavInHistory(fundNavList: FundNavData[]): FundNavData {
    return fundNavList.reduce((min, current) => {
      return current.value < min.value ? current : min;
    }, fundNavList[0]!);
  }

  private findHighestNavInHistory(fundNavList: FundNavData[]): FundNavData {
    return fundNavList.reduce((max, current) => {
      return current.value > max.value ? current : max;
    }, fundNavList[0]!);
  }

  /**
   * 计算分位（排除当前值 + 重复值处理）
   */
  private calcPercentile(values: number[], latest: number): number {
    let less = 0;
    let equal = 0;

    for (const v of values) {
      if (v < latest) less++;
      else if (v === latest) equal++;
    }

    return fixed4((less + 0.5 * equal) / values.length); // 保留四位小数
  }

  /**
   * 获取最近 N 天数据（按日期过滤）
   */
  private filterByDays(data: FundNavData[], days: number): FundNavData[] {
    const latestDate = new Date(data[0]!.date).getTime();
    const cutoff = latestDate - days * 24 * 60 * 60 * 1000;

    return data.filter((item) => {
      const t = new Date(item.date).getTime();
      return t >= cutoff;
    });
  }
}
