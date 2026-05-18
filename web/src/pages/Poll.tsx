import { useParams, useNavigate } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'
import { usePoll } from '../hooks/usePoll'
import { TimeGrid } from '../components/TimeGrid'

export default function Poll({ user }: { user: User | null }) {
  const { pollId } = useParams<{ pollId: string }>()
  const navigate = useNavigate()
  const { poll, loading, error, userVote, voterName, setVoterName, handleSlotRating } = usePoll(pollId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="py-16 text-center">
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error || 'Poll not found'}</div>
        <button onClick={() => navigate('/')} className="rounded-lg bg-violet-500 px-5 py-2 text-sm font-semibold text-white">
          Go Home
        </button>
      </div>
    )
  }

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/p/${pollId}`) } catch { /* ignore */ }
  }

  const share = async () => {
    const url = `${window.location.origin}/p/${pollId}`
    if (navigator.share) {
      try { await navigator.share({ title: poll.title, url }) } catch { /* cancelled */ }
    } else {
      copyLink()
    }
  }

  const selectedSlotsCount = Object.values(userVote).filter(v => v > 0).length

  return (
    <div className="py-2">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">{poll.title}</h1>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {poll.timezone} &middot; Created {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={copyLink} className="rounded-lg border border-[var(--line-strong)] p-2 text-[var(--muted)] transition hover:text-[var(--ink)]" title="Copy link">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          </button>
          <button onClick={share} className="rounded-lg border border-[var(--line-strong)] p-2 text-[var(--muted)] transition hover:text-[var(--ink)]" title="Share">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 flex gap-4 text-sm text-[var(--muted)]">
        <span>{poll.totalVotes} participant{poll.totalVotes !== 1 ? 's' : ''}</span>
        <span>{Object.keys(poll.slotVoteCounts).length} slots rated</span>
        <span>{Math.max(...Object.values(poll.slotAttendance), 0)} max attendance</span>
      </div>

      {/* Auth gate for voting */}
      {!user ? (
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-center">
          <p className="text-sm text-[var(--muted)]">Sign in to vote on this poll</p>
          <button onClick={() => fas.auth.signIn()} className="mt-2 rounded-lg bg-violet-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-violet-600">
            Sign in with GitHub
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <input type="text" value={voterName} onChange={e => setVoterName(e.target.value)} placeholder="Your name (optional)"
            className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20" />
        </div>
      )}

      {/* Time grid — always visible (public read), but clicks require auth */}
      <TimeGrid
        selectedDays={[1, 2, 3, 4, 5, 6, 0]}
        userRatings={userVote}
        slotAttendance={poll.slotAttendance}
        startTime={poll.startTime}
        endTime={poll.endTime}
        onTimeClick={user ? handleSlotRating : () => fas.auth.signIn()}
        pollTimezone={poll.timezone}
        votingSystem={poll.votingSystem}
      />

      {user && (
        <p className="mt-3 text-center text-xs text-[var(--muted)]">
          {selectedSlotsCount} slot{selectedSlotsCount !== 1 ? 's' : ''} rated &middot; Automatically saved
        </p>
      )}

      {/* Participants */}
      {poll.totalVotes > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold text-[var(--ink)]">Participants ({poll.totalVotes})</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {Object.entries(poll.voters).map(([id, data]) => (
              <div key={id} className="rounded-lg border border-[var(--line)] bg-violet-50/30 p-3">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {data.name || `Anonymous ${id.slice(-4)}`}
                </p>
                <p className="text-[0.65rem] text-[var(--muted)]">
                  Last voted: {new Date(data.lastVoteAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
