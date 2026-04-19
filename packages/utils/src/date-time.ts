import dayjs from 'dayjs';

export function dateTimeToNow(fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs().format(fmt);
}

export function dateToNow(fmt = 'YYYY-MM-DD'): string {
  return dayjs().format(fmt);
}

/**
 * 将时间戳转换为日期
 * @param timestamp 时间戳（毫秒）
 * @returns 日期（YYYY-MM-DD）
 */
export function timestampToDate(timestamp: number, fmt = 'YYYY-MM-DD'): string {
  return dayjs(timestamp).format(fmt);
}
