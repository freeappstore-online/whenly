import { useNavigate } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from '../lib/fas'

export default function Home({ user }: { user: User | null }) {
  const navigate = useNavigate()

  return (
    <div className="py-8 text-center md:py-16">
      <h1 className="display-font text-3xl font-bold text-[var(--ink)] md:text-4xl">
        Anonymous Weekly Time-Slot Voting
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-[var(--muted)] md:text-lg">
        Create polls for recurring weekly time slots and let people vote.
        Perfect for organizing regular meetings, events, or finding the best time for everyone.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate('/new')}
              className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl"
            >
              Create a Poll
            </button>
            <button
              onClick={() => navigate('/join')}
              className="rounded-xl border border-violet-300 px-6 py-3 font-semibold text-violet-600 transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Join a Poll
            </button>
          </>
        ) : (
          <button
            onClick={() => fas.auth.signIn()}
            className="rounded-xl bg-violet-500 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:bg-violet-600 hover:shadow-xl"
          >
            Sign in with GitHub to start
          </button>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-6 text-left shadow-[var(--shadow-card)] transition hover:border-violet-200 hover:shadow-lg md:mt-16 md:p-8">
        <h2 className="mb-4 text-lg font-bold text-[var(--ink)] md:text-xl">How it works</h2>
        <ul className="space-y-3 text-[var(--muted)]">
          {[
            ['Create', 'Set up a poll with weekly time slots (e.g., Mon-Sun 8-9pm)'],
            ['Share', 'Send the poll link to participants'],
            ['Vote', 'Participants vote for their preferred slots'],
            ['Results', 'See which time slots are most popular'],
            ['Schedule', 'Schedule meetings based on results'],
          ].map(([title, desc]) => (
            <li key={title}>
              <strong className="text-violet-500">{title}:</strong> {desc}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
