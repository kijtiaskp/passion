import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { Icons } from '../../../components/icons'
import { useTimer } from '../hooks/use-timer'
import { categories, leaveOptions } from '../constants'
import { getInitialTime } from '../utils'
import type { Category, LeaveType } from '../types'

interface Props {
  projects: string[]
  onAddLog: (task: string, cat: string, project: string, start: Date, end: Date, hrs: number) => void
  onAddProject: (name: string) => void
}

export function LogForm({ projects, onAddLog, onAddProject }: Props) {
  const [selectedProject, setSelectedProject] = useState('')
  const [taskInput, setTaskInput] = useState('')
  const [catInput, setCatInput] = useState<Category>('dev')
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState(() => getInitialTime().start)
  const [endTime, setEndTime] = useState(() => getInitialTime().end)
  const [leaveType, setLeaveType] = useState<LeaveType>('full')
  const [showAddProject, setShowAddProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const newProjectInputRef = useRef<HTMLInputElement>(null)

  const timer = useTimer(onAddLog)
  const isLeave = catInput === 'leave'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && showAddProject) saveNewProject()
      if (e.key === 'Escape' && showAddProject) {
        setShowAddProject(false)
        setNewProjectName('')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  useEffect(() => {
    if (showAddProject) setTimeout(() => newProjectInputRef.current?.focus(), 50)
  }, [showAddProject])

  const addManualEntry = () => {
    if (!taskInput.trim()) { alert('กรุณากรอกชื่องาน'); return }
    if (!selectedDate) { alert('กรุณาเลือกวันที่'); return }

    let start: Date, end: Date, hrs: number

    if (isLeave) {
      const opt = leaveOptions.find(o => o.value === leaveType)!
      start = new Date(`${selectedDate}T${opt.start}`)
      end   = new Date(`${selectedDate}T${opt.end}`)
      hrs   = opt.hrs
    } else {
      if (!startTime || !endTime) { alert('กรุณาเลือกเวลาเริ่มและสิ้นสุด'); return }
      start = new Date(`${selectedDate}T${startTime}`)
      end   = new Date(`${selectedDate}T${endTime}`)
      if (end <= start) { alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม'); return }
      hrs = (end.getTime() - start.getTime()) / 3600000
    }

    onAddLog(taskInput.trim(), catInput, selectedProject, start, end, hrs)
    setTaskInput('')
    if (!isLeave) {
      const init = getInitialTime()
      setStartTime(init.start)
      setEndTime(init.end)
    }
  }

  const toggleTimer = () => {
    if (!timer.isRunning) {
      timer.start(taskInput.trim() || 'งานไม่ระบุชื่อ', selectedProject)
    } else {
      timer.stop(catInput)
    }
  }

  const saveNewProject = () => {
    const val = newProjectName.trim()
    if (!val) return
    if (projects.includes(val)) { alert('มีโปรเจคนี้อยู่แล้ว'); return }
    onAddProject(val)
    setSelectedProject(val)
    setNewProjectName('')
    setShowAddProject(false)
  }

  return (
    <div className="input-panel">
      {/* Row 1: Project · Task · Category */}
      <div className="input-row input-row-top">
        <div className="field">
          <label>โปรเจค</label>
          <div className="project-select-wrap">
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
              <option value="">— ไม่ระบุ —</option>
              {projects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <button
              className="btn-icon-sm"
              onClick={() => { setShowAddProject(!showAddProject); setNewProjectName('') }}
              title="เพิ่มโปรเจคใหม่"
            >
              {Icons.plus}
            </button>
          </div>
          <div className={`add-project-form${showAddProject ? ' open' : ''}`}>
            <input
              ref={newProjectInputRef}
              type="text"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              placeholder="ชื่อโปรเจคใหม่..."
              maxLength={60}
            />
            <button className="btn-save-proj" onClick={saveNewProject}>บันทึก</button>
            <button className="btn-cancel-proj" onClick={() => { setShowAddProject(false); setNewProjectName('') }}>ยกเลิก</button>
          </div>
        </div>

        <div className="field">
          <label>งาน / Task</label>
          <input type="text" value={taskInput} onChange={e => setTaskInput(e.target.value)} placeholder="ชื่องานที่ทำ..." />
        </div>

        <div className="field">
          <label>หมวดหมู่</label>
          <select value={catInput} onChange={e => setCatInput(e.target.value as Category)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Date · [Time fields or Leave selector] · Add */}
      <div className="input-row input-row-bottom">
        <div className="field">
          <label>วันที่</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>

        {isLeave ? (
          <div className="field leave-field">
            <label>ประเภทลา</label>
            <div className="leave-selector">
              {leaveOptions.map(opt => (
                <button
                  key={opt.value}
                  className={`leave-btn${leaveType === opt.value ? ' active' : ''}`}
                  onClick={() => setLeaveType(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="field">
              <label>เริ่ม</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="field">
              <label>สิ้นสุด</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </>
        )}

        <button className="btn btn-primary" onClick={addManualEntry}>
          {Icons.plus}
          เพิ่ม
        </button>
      </div>

      {/* Timer row — ซ่อนเมื่อเลือก Leave */}
      {!isLeave && (
        <div className="timer-row">
          <div className={`timer-display${timer.isRunning ? ' running' : ''}`}>{timer.timerDisplay}</div>
          <div style={{ flex: 1 }}>
            <div className="timer-label">
              {timer.isRunning
                ? `${timer.timerProject ? `[${timer.timerProject}] ` : ''}"${timer.timerTask}"`
                : 'พร้อมจับเวลา'}
            </div>
          </div>
          <button className={`btn btn-clock${timer.isRunning ? ' running' : ''}`} onClick={toggleTimer}>
            {timer.isRunning ? Icons.stop : Icons.play}
            <span>{timer.isRunning ? 'หยุด' : 'เริ่ม'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
