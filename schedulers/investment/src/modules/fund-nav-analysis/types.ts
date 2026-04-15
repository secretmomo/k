// 基金净值数据信息
export interface FundNavData {
  date: string;
  percentage: number;
  value: number;
}

export interface AnalyzeFundNavResult {
  /** 基金代码 */
  fundCode: string;

  /** 基金名称 */
  fundName: string;

  /** 基金首页链接 */
  fundHomePageUrl: string;

  /** ETF 首页链接 */
  etfHomePageUrl: string;

  /** 今日预估涨幅 */
  todayEstimatedChange: number;

  /** 今日预估净值日期 */
  todayEstimatedDate: string;

  /** 最近一天的净值 */
  lastNav: number;

  /** 最近一天的净值日期 */
  lastNavDate: string;

  /** 最近一天的净值涨跌幅 */
  lastNavChange: number;

  /** 当前净值处于历史百分位 */
  lastNavPercentileInHistory: number;

  /** 当前净值处于最近一年百分位 */
  lastNavPercentileInLastYear: number;

  /** 历史最低净值 */
  lowestNavInHistory: number;

  /** 历史最低净值日期 */
  lowestNavInHistoryDate: string;

  /** 历史最高净值 */
  highestNavInHistory: number;

  /** 历史最高净值日期 */
  highestNavInHistoryDate: string;

  /** 最近一月净值数据 */
  lastMonthNavList: FundNavData[];
}
