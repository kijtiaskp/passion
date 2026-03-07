import { format, subHours } from 'date-fns'
import { th } from 'date-fns/locale'

export function formatHrs(h: number): string {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${hh}h ${String(mm).padStart(2, '0')}m`
}

export function formatDays(h: number): string {
  return parseFloat((h / 8).toFixed(4)).toString()
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: th })
}

export function formatDate(iso: string): string {
  return format(new Date(iso), 'd MMM yyyy', { locale: th })
}

export function formatDayName(iso: string): string {
  return format(new Date(iso), 'EEEE', { locale: th })
}

export function getInitialTime(): { start: string; end: string } {
  const now = new Date()
  return {
    end: format(now, 'HH:mm'),
    start: format(subHours(now, 1), 'HH:mm'),
  }
}
