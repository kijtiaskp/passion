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

export interface ActivityEntry {
  id: number
  text: string
  cat: ActivityCategory
  mood: Mood
  time: string // ISO datetime
}

export type ActivityCategory = 'food' | 'exercise' | 'rest' | 'travel' | 'other'

export type Mood = 'good' | 'neutral' | 'tired' | 'sleepy' | 'angry'
