import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Join() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const extractPollId = (raw: string): string | null => {
    const trimmed = raw.trim()
    if (/^[a-zA-Z0-9]+$/.test(trimmed)) return trimmed
    const patterns = [/\/p\/([a-zA-Z0-9]+)/, /https?:\/\/[^/]+\/p\/([a-zA-Z0-9]+)/, /[/?]([a-zA-Z0-9]+)$/]
    for (const p of patterns) {
      const m = trimmed.match(p)
      if (m?.[1]) return m[1]
    }
    return null
  }

  const handleJoin = () => {
    const id = extractPollId(input)
    if (!id) { setError('Please enter a valid poll ID or URL'); return }
    navigate(`/p/${id}`)
  }

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="text-center text-2xl font-bold text-[var(--ink)]">Join a Poll</h1>
      <p className="mt-1 text-center text-[var(--muted)]">Enter the poll ID or paste a poll URL</p>

      <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-6 shadow-[var(--shadow-card)]">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setError(null) }}
          onKeyDown={e => e.key === 'Enter' && handleJoin()}
          placeholder="Poll ID or URL"
          autoFocus
          className="w-full rounded-lg border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-2.5 text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20"
        />
        <p className="mt-1.5 text-xs text-[var(--muted)]">
          Examples: abc123, /p/abc123, https://whenly.freeappstore.online/p/abc123
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg border border-[var(--line-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={!input.trim()}
            className="rounded-lg bg-violet-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:opacity-50"
          >
            Join Poll
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Don't have a poll ID?{' '}
        <button onClick={() => navigate('/new')} className="font-semibold text-violet-500 hover:text-violet-600">
          Create a new poll
        </button>
      </p>
    </div>
  )
}
