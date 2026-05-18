import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'
import type { Poll } from '../types'
import * as api from '../lib/api'
import { getMyPollIds, removeMyPoll } from '../lib/session'

export default function MyPolls({ user }: { user: User | null }) {
  const navigate = useNavigate()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ;(async () => {
      const ids = getMyPollIds()
      const results = await api.getPolls(ids)
      setPolls(results)
      setLoading(false)
    })()
  }, [user])

  if (!user) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)]">My Polls</h1>
        <p className="mt-2 text-[var(--muted)]">Sign in to see your polls</p>
        <button onClick={() => fas.auth.signIn()} className="mt-6 rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-600">
          Sign in with GitHub
        </button>
      </div>
    )
  }

  const handleDelete = async (poll: Poll) => {
    if (!confirm(`Delete "${poll.title}"? This cannot be undone.`)) return
    setDeleting(poll.id)
    try {
      await api.deletePoll(poll.id)
      removeMyPoll(poll.id)
      setPolls(prev => prev.filter(p => p.id !== poll.id))
    } catch { /* ignore */ }
    setDeleting(null)
  }

  const copyLink = async (pollId: string) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/p/${pollId}`) } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-500" />
      </div>
    )
  }

  if (polls.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--ink)]">My Polls</h1>
        <p className="mt-2 text-[var(--muted)]">You haven't created any polls yet.</p>
        <button onClick={() => navigate('/new')} className="mt-6 rounded-lg bg-violet-500 px-6 py-3 font-semibold text-white transition hover:bg-violet-600">
          Create Your First Poll
        </button>
      </div>
    )
  }

  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-[var(--ink)]">My Polls</h1>
      <p className="mt-1 text-[var(--muted)]">Manage your created polls</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {polls.map(poll => (
          <div key={poll.id} className="flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-5 shadow-[var(--shadow-card)] transition hover:border-violet-200">
            <h2 className="text-lg font-bold text-[var(--ink)]">{poll.title}</h2>
            <div className="mt-2 space-y-1 text-xs text-[var(--muted)]">
              <p>{poll.totalVotes} participant{poll.totalVotes !== 1 ? 's' : ''}</p>
              <p>{Object.keys(poll.slotVoteCounts || {}).length} slots rated</p>
              <p>{Math.max(...Object.values(poll.slotAttendance || {}), 0)} max attendance</p>
            </div>
            <div className="mt-auto flex items-center gap-2 pt-4">
              <button onClick={() => navigate(`/p/${poll.id}`)} className="rounded-lg bg-violet-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-violet-600">
                Open
              </button>
              <button onClick={() => copyLink(poll.id)} className="rounded-lg border border-[var(--line-strong)] p-2 text-[var(--muted)] transition hover:text-[var(--ink)]" title="Copy link">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>
              <div className="flex-1" />
              <button onClick={() => handleDelete(poll)} disabled={deleting === poll.id} className="rounded-lg p-2 text-red-400 transition hover:bg-red-50 hover:text-red-600" title="Delete">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
