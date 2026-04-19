/**
 * Fund return rate by period
 * value: percentage (e.g. 0.1234 = 12.34%)
 */
export interface FundReturnRates {
  '1d'?: number; // 近 1 天
  '1w'?: number; // 近 1 周
  '1m'?: number; // 近 1 个月
  '3m'?: number; // 近 3 个月
  '6m'?: number; // 近 6 个月
  '1y'?: number; // 近 1 年
  '2y'?: number; // 近 2 年
  '3y'?: number; // 近 3 年
  '5y'?: number; // 近 5 年
  ytd?: number; // 今年以来 (Year To Date)
  sinceInception?: number; // 成立以来
}

export interface FundInfo {
  /** Notion Page ID */
  id: string;

  /** 基金名称 */
  name: string;

  /** 基金首页链接 */
  url: string;

  /** 基金代码 */
  code: string;

  /** Assets Under Management，基金规模，单位：亿元 */
  aum: number;

  /** 基金状态，如：开放申购、开放赎回、暂停申购、暂停赎回、清盘等 */
  status: string;

  /** 基金回报率 */
  returnRates: FundReturnRates;
}
