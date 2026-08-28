export type DayStatus = 'normal' | 'missed' | 'makeup' | 'rest'

export interface ClockRecord {
  confirmed: boolean
  confirmedAt?: string
}

export interface DayRecord {
  date: string
  clockIn?: ClockRecord
  clockOut?: ClockRecord
  status: DayStatus
}

export interface ReminderStrategy {
  before20: boolean
  before5: boolean
  afterOverdue: boolean
  auditAt22: boolean
}

export interface Settings {
  clockInTime: string
  clockOutTime: string
  bonusAmount: number
  reminderEnabled: boolean
  reminderStrategy: ReminderStrategy
}

export const DEFAULT_SETTINGS: Settings = {
  clockInTime: '08:50',
  clockOutTime: '18:15',
  bonusAmount: 1000,
  reminderEnabled: true,
  reminderStrategy: {
    before20: true,
    before5: true,
    afterOverdue: true,
    auditAt22: true,
  },
}

export interface ReminderSlot {
  id: string
  time: string
  label: string
  type: 'clockIn' | 'clockOut' | 'audit'
  urgent?: boolean
}

export const REMINDER_SLOTS: ReminderSlot[] = [
  { id: 'in-1', time: '08:30', label: '上班 · 第一次提醒', type: 'clockIn' },
  { id: 'in-2', time: '08:45', label: '上班 · 第二次提醒', type: 'clockIn' },
  { id: 'in-3', time: '08:52', label: '上班 · 超时兜底', type: 'clockIn', urgent: true },
  { id: 'out-1', time: '18:10', label: '下班 · 第一次提醒', type: 'clockOut' },
  { id: 'out-2', time: '18:25', label: '下班 · 第二次提醒', type: 'clockOut' },
  { id: 'out-3', time: '20:00', label: '下班 · 超时兜底', type: 'clockOut', urgent: true },
  { id: 'audit', time: '22:00', label: '今日打卡审计', type: 'audit', urgent: true },
]
