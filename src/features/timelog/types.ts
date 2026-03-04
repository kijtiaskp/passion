export interface LogEntry {
  id: number
  task: string
  cat: string
  project: string
  start: string
  end: string
  hrs: number
}

export type Category = 'dev' | 'meeting' | 'design' | 'review' | 'other' | 'leave'

export type LeaveType = 'full' | 'half-morning' | 'half-afternoon'
