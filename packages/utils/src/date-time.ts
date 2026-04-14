import dayjs from 'dayjs';

export function dateTimeToNow(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss');
}

export function dateToNow(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 将时间戳转换为日期
 * @param timestamp 时间戳（毫秒）
 * @returns 日期（YYYY-MM-DD）
 */
export function timestampToDate(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD');
}
