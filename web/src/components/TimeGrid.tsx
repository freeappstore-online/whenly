import { useState } from 'react'
import { DAYS, DAYS_FULL, getTimeKey, formatTime, getHours } from '../lib/time-slots'
import { formatTimezone, convertTimeToDisplayTimezone } from '../lib/timezones'

interface TimeGridProps {
  selectedDays: number[]
  userRatings: Record<string, number>
  slotAttendance?: Record<string, number>
  startTime: number
  endTime: number
  onTimeClick: (day: number, hour: number, minute: number) => void
  pollTimezone: string
  votingSystem: 'simple' | 'detailed'
}

export function TimeGrid({
  selectedDays, userRatings, slotAttendance, startTime, endTime,
  onTimeClick, pollTimezone, votingSystem,
}: TimeGridProps) {
  const [showHostTz, setShowHostTz] = useState(false)
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const currentTz = showHostTz ? pollTimezone : userTz
  const sameTimezone = userTz === pollTimezone

  const hours = getHours(startTime, endTime)
  const minutes = [0, 30] as const

  const displayTimes = hours.flatMap(h =>
    minutes.map(m => {
      const d = convertTimeToDisplayTimezone(h, m, pollTimezone, currentTz)
      return { displayHour: d.hour, displayMinute: d.minute, pollHour: h, pollMinute: m }
    }),
  ).filter(({ pollHour, pollMinute }) => {
    if (endTime > startTime) {
      return pollHour < endTime || (pollHour === endTime && pollMinute === 0)
    }
    return true
  })

  function ratingBg(rating: number): string {
    if (rating === 1) return 'bg-green-500 text-white'
    if (rating === 0.5) return 'bg-amber-500 text-white'
    return ''
  }

  const cols = selectedDays.length

  return (
    <div className="mt-3">
      {/* Timezone toggle */}
      {!sameTimezone && (
        <div className="mb-3 flex items-center justify-center gap-2">
          <button
            onClick={() => setShowHostTz(false)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${!showHostTz ? 'bg-violet-500 text-white' : 'border border-violet-300 text-violet-600'}`}
          >
            <span className="block text-[0.6rem] font-normal">Your timezone</span>
            {formatTimezone(userTz)}
          </button>
          <button
            onClick={() => setShowHostTz(true)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${showHostTz ? 'bg-violet-500 text-white' : 'border border-violet-300 text-violet-600'}`}
          >
            <span className="block text-[0.6rem] font-normal">Poll timezone</span>
            {formatTimezone(pollTimezone)}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
        <div className="grid" style={{ gridTemplateColumns: `3rem repeat(${cols}, minmax(0, 1fr))` }}>
          {/* Header */}
          <div className="bg-[var(--paper-deep)] p-1.5 text-center text-[0.65rem] font-bold text-violet-600">
            {formatTimezone(currentTz)}
          </div>
          {selectedDays.map(day => (
            <div key={day} className="bg-[var(--paper-deep)] p-1.5 text-center text-xs font-bold text-[var(--ink)]">
              <span className="hidden sm:inline">{DAYS_FULL[day]}</span>
              <span className="sm:hidden">{DAYS[day]}</span>
            </div>
          ))}

          {/* Rows */}
          {displayTimes.map(({ displayHour, displayMinute, pollHour, pollMinute }) => (
            <div key={`${pollHour}-${pollMinute}`} className="contents">
              <div className="border-t border-[var(--line)] p-1 text-center text-[0.7rem] text-[var(--muted)]">
                {formatTime(displayHour, displayMinute)}
              </div>
              {selectedDays.map(day => {
                const key = getTimeKey(day, pollHour, pollMinute)
                const rating = userRatings[key] || 0
                const attendance = slotAttendance?.[key] || 0
                return (
                  <div
                    key={key}
                    onClick={() => onTimeClick(day, pollHour, pollMinute)}
                    className={`flex cursor-pointer items-center justify-center border-t border-[var(--line)] p-0.5 text-xs font-semibold transition-all hover:scale-105 ${ratingBg(rating)}`}
                    style={{ minHeight: '1.75rem' }}
                  >
                    {attendance > 0 && (
                      <span>{attendance % 1 === 0 ? attendance : attendance.toFixed(1)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted)]">
        <span className="font-semibold">Legend:</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded border border-[var(--line)]" /> Unavailable
        </span>
        {votingSystem === 'detailed' && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-4 w-4 rounded bg-amber-500" /> Maybe
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block h-4 w-4 rounded bg-green-500" /> {votingSystem === 'simple' ? 'Available' : 'Will attend'}
        </span>
      </div>
    </div>
  )
}
