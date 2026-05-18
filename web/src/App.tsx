import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import type { User } from '@freeappstore/sdk'
import { fas } from './lib/fas'
import { Shell } from './components/Shell'
import Home from './pages/Home'
import Create from './pages/Create'
import Poll from './pages/Poll'
import Join from './pages/Join'
import MyPolls from './pages/MyPolls'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fas.auth.init().then(() => setReady(true))
    return fas.auth.onChange(setUser)
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-[var(--muted)]">
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Shell user={user}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/new" element={<Create user={user} />} />
          <Route path="/join" element={<Join />} />
          <Route path="/my-polls" element={<MyPolls user={user} />} />
          <Route path="/p/:pollId" element={<Poll user={user} />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}
