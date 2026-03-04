import type { ReactElement } from 'react'
import { Icons } from '../../components/icons'
import type { Category, LeaveType } from './types'

export const catLabels: Record<Category, string> = {
  dev: 'Development',
  meeting: 'Meeting',
  design: 'Design',
  review: 'Review',
  other: 'Other',
  leave: 'Leave',
}

export const categories: { value: Category; label: string }[] = [
  { value: 'dev', label: 'Development' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'design', label: 'Design' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
  { value: 'leave', label: 'Leave' },
]

export const filterOptions: { value: string; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'dev', label: 'Dev' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'design', label: 'Design' },
  { value: 'review', label: 'Review' },
  { value: 'other', label: 'Other' },
  { value: 'leave', label: 'Leave' },
]

export const catIcons: Record<Category, ReactElement> = {
  dev: Icons.monitor,
  meeting: Icons.calendar,
  design: Icons.pen,
  review: Icons.search,
  other: Icons.file,
  leave: Icons.leave,
}

export const leaveOptions: { value: LeaveType; label: string; hrs: number; start: string; end: string }[] = [
  { value: 'full',          label: 'เต็มวัน', hrs: 8, start: '09:00', end: '18:00' },
  { value: 'half-morning',  label: 'เช้า (ครึ่งวัน)',  hrs: 4, start: '09:00', end: '13:00' },
  { value: 'half-afternoon',label: 'บ่าย (ครึ่งวัน)', hrs: 4, start: '13:00', end: '17:00' },
]
