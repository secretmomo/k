export function fixed2(n: number): number {
  return Number(n.toFixed(2));
}

export function fixed4(n: number): number {
  return Number(n.toFixed(4));
}

/**
 * 将数字转为百分比字符串，如：12.34%
 *
 * @param n 数字，如：0.1234
 * @returns 百分比字符串，如：12.34%
 */
export function toPercentage(n?: number): string {
  if (n === undefined) return '-';

  return `${fixed2(n * 100)}%`;
}
