import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'
import * as api from '../lib/api'
import { addMyPoll } from '../lib/session'
import { COMMON_TIMEZONES, getTimezoneLabel } from '../lib/timezones'

const DAYS = [
  { value: 1, label: 'Mon' }, { value: 2, label: 'Tue' }, { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' }, { value: 5, label: 'Fri' }, { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
]

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

export default function Create({ user }: { user: User | null }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5])
  const [startTime, setStartTime] = useState(9)
  const [endTime, setEndTime] = useState(18)
  const [publicResults, setPublicResults] = useState(true)
  const [votingSystem, setVotingSystem] = useState<'simple' | 'detailed'>('simple')

  if (!user) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Create a New Poll</h1>
        <p className="mt-2 text-[var(--muted)]">Sign in with GitHub to create polls</p>
        <button onClick={() => fas.auth.signIn()} className="mt-6 rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-600">
          Sign in with GitHub
        </button>
      </div>
    )
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort(),
    )
  }

  const handleCreate = async () => {
    if (!title.trim()) { setError('Please enter a poll title'); return }
    if (selectedDays.length === 0) { setError('Please select at least one day'); return }
    if (startTime === endTime) { setError('Start and end time cannot be the same'); return }

    setLoading(true)
    setError(null)

    try {
      const id = await api.createPoll({
        title: title.trim(),
        timezone,
        startTime,
        endTime,
        publicResults,
        votingSystem,
      })
      addMyPoll(id)
      navigate(`/p/${id}`)
    } catch {
      setError('Failed to create poll. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-[var(--ink)]">Create a New Poll</h1>
      <p className="mt-1 text-[var(--muted)]">Set up a poll for recurring weekly time slots</p>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[var(--shadow-card)] transition hover:border-violet-200 md:p-7">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--ink)]">Poll Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Weekly Team Meeting"
              className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2.5 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-[var(--ink)]">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2.5 text-[var(--ink)] focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20">
              {COMMON_TIMEZONES.map(tz => <option key={tz} value={tz}>{getTimezoneLabel(tz)}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">Select Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(d => (
                <button key={d.value} onClick={() => toggleDay(d.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${selectedDays.includes(d.value) ? 'bg-violet-500 text-white' : 'border border-[var(--line-strong)] text-[var(--muted)] hover:border-violet-300'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">Time Range</label>
            <p className="mb-2 text-xs text-[var(--muted)]">Participants can express availability every 30 minutes in this range</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-[var(--muted)]">Start</label>
                <select value={startTime} onChange={e => setStartTime(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:border-violet-400 focus:outline-none">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-[var(--muted)]">End</label>
                <select value={endTime} onChange={e => setEndTime(Number(e.target.value))}
                  className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:border-violet-400 focus:outline-none">
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{formatHour(i)}</option>)}
                </select>
              </div>
            </div>
            <p className="mt-1.5 text-xs italic text-[var(--muted)]">
              Slots from {formatHour(startTime)} to {formatHour(endTime)}{endTime <= startTime && ' (next day)'}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">Voting System</label>
            <select value={votingSystem} onChange={e => setVotingSystem(e.target.value as 'simple' | 'detailed')}
              className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2.5 text-sm text-[var(--ink)] focus:border-violet-400 focus:outline-none">
              <option value="simple">Simple: Available / Unavailable</option>
              <option value="detailed">Detailed: Will attend / Maybe / Won't attend</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" checked={publicResults} onChange={e => setPublicResults(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-violet-500 focus:ring-violet-400" />
            <span className="text-sm text-[var(--ink)]">Show results to all participants</span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button onClick={() => navigate('/')} disabled={loading}
              className="rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={loading || !title.trim() || selectedDays.length === 0}
              className="rounded-lg bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:bg-violet-600 disabled:opacity-50 disabled:shadow-none">
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
