import { Icons } from '../../../components/icons'
import { formatHrs, formatDays } from '../utils'

export function TimesheetBar({ todayHrs }: { todayHrs: number }) {
  const pct = Math.min((todayHrs / 8) * 100, 100)
  const over = todayHrs > 8

  return (
    <div className="timesheet-bar">
      <div className="ts-left">
        <span className="ts-icon">{Icons.clipboard}</span>
        <span className="ts-label">Timesheet วันนี้</span>
        <div className="ts-progress-wrap">
          <div className="ts-progress-track">
            <div className={`ts-progress-fill${over ? ' over' : ''}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="ts-progress-text">{formatHrs(todayHrs)} / 8h</span>
        </div>
      </div>
      <div className="ts-right">
        <div className={`ts-days-big${over ? ' over' : ''}`}>
          {formatDays(todayHrs)} <span>วัน</span>
        </div>
        <div className="ts-note">8h = 1 วัน</div>
      </div>
    </div>
  )
}
