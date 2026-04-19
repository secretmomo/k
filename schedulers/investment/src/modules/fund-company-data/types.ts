export interface FundCompanyInfo {
  /** Notion Page ID */
  id: string;

  /** 基金公司名称 */
  name: string;

  /** 基金公司首页链接 */
  url: string;

  /** 管理规模 Assets Under Management */
  aum: number;

  /** 基金数量 Number of Funds */
  fundCount: number;

  /** 经理人数 Number of Fund Managers */
  managerCount: number;
}
