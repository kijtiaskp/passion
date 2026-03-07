export function fmt(n: number): string {
  return n.toLocaleString('th-TH', { minimumFractionDigits: 2 })
}

export function fmtSigned(n: number): string {
  const prefix = n < 0 ? '' : '+'
  return `${prefix}${fmt(n)}`
}

export function sumBy<T>(items: T[], fn: (item: T) => number): number {
  return items.reduce((s, item) => s + fn(item), 0)
}
