import { formatHrs, formatDays } from '../utils'

interface Stats {
  todayHrs: number
  weekHrs: number
  allHrs: number
}

export function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="stats">
      <div className="stat-card">
        <div className="label">วันนี้</div>
        <div className="value">{formatHrs(stats.todayHrs)}</div>
        <div className="stat-sub">= {formatDays(stats.todayHrs)} วัน</div>
      </div>
      <div className="stat-card">
        <div className="label">สัปดาห์นี้</div>
        <div className="value blue">{formatHrs(stats.weekHrs)}</div>
        <div className="stat-sub">= {formatDays(stats.weekHrs)} วัน</div>
      </div>
      <div className="stat-card">
        <div className="label">รวมทั้งหมด</div>
        <div className="value warn">{formatHrs(stats.allHrs)}</div>
        <div className="stat-sub">= {formatDays(stats.allHrs)} วัน</div>
      </div>
    </div>
  )
}
