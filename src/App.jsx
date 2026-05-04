import { useState, useEffect, useMemo } from 'react'
import { loadEntries, addEntry, updateEntry, deleteEntry, subscribeToEntries, loadChallengeEntries, subscribeToChallengeEntries } from './lib/db.js'
import { TEAMS_DATA, getPlayerTeam, todayStr, getWeekNum } from './data.js'
import Dashboard from './components/Dashboard.jsx'
import TeamPage from './components/TeamPage.jsx'
import LogModal from './components/LogModal.jsx'
import EditEntryModal from './components/EditEntryModal.jsx'
import ManualChallengePage from './components/ManualChallengePage.jsx'
import HabitStreakPage from './components/HabitStreakPage.jsx'
import MostPtsPage from './components/MostPtsPage.jsx'
import TweaksPanel from './components/TweaksPanel.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

function computeStats(entries) {
  const playerStats = {}
  const teamStats = {}
  const catStats = {}
  const allPlayers = Object.values(TEAMS_DATA).flatMap((t) => t.players)
  allPlayers.forEach((p) => { playerStats[p] = { total: 0, days: {}, streak: 0, team: getPlayerTeam(p) } })
  Object.keys(TEAMS_DATA).forEach((t) => { teamStats[t] = { total: 0, count: TEAMS_DATA[t].players.length } })

  entries.forEach((entry) => {
    if (!playerStats[entry.player]) return
    playerStats[entry.player].total += entry.totalPts
    if (!playerStats[entry.player].days[entry.date]) playerStats[entry.player].days[entry.date] = []
    playerStats[entry.player].days[entry.date].push(entry)
    const team = getPlayerTeam(entry.player)
    if (team) teamStats[team].total += entry.totalPts
    entry.activities && entry.activities.forEach((a) => {
      if (!catStats[a.category]) catStats[a.category] = { pts: 0, sessions: 0 }
      catStats[a.category].pts += a.pts
      catStats[a.category].sessions += 1
    })
  })

  // Streaks
  Object.entries(playerStats).forEach(([, ps]) => {
    const activeDays = Object.keys(ps.days).sort()
    let streak = 0
    let cur = todayStr()
    while (activeDays.includes(cur)) {
      streak++
      const d = new Date(cur)
      d.setDate(d.getDate() - 1)
      cur = d.toISOString().slice(0, 10)
    }
    ps.streak = streak
  })

  Object.entries(teamStats).forEach(([, ts]) => {
    ts.avg = ts.count > 0 ? (ts.total / ts.count).toFixed(1) : '0.0'
  })

  const sortedTeams = Object.entries(teamStats).sort((a, b) => b[1].total - a[1].total)
  const sortedPlayers = Object.entries(playerStats).sort((a, b) => b[1].total - a[1].total)
  const recentFeed = [...entries].sort((a, b) => (b.loggedAt || 0) - (a.loggedAt || 0)).slice(0, 15)

  return { playerStats, teamStats, sortedTeams, sortedPlayers, catStats, recentFeed }
}

export default function App() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stepsData, setStepsData] = useState({})
  const [waterData, setWaterData] = useState({})
  const [view, setView] = useState({ page: 'dashboard', teamName: null, highlightPlayer: null })
  const [showLog, setShowLog] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [toast, setToast] = useState(null)
  const [showTweaks, setShowTweaks] = useState(false)
  const [tweaks, setTweaksState] = useState(() => {
    try { const s = localStorage.getItem('moveit_tweaks'); if (s) return JSON.parse(s) } catch(e) {}
    return { calSize: 'normal', showDayPts: true, heatmap: true, cardsPerRow: 'auto', showStreak: true }
  })

  useEffect(() => {
    loadEntries()
      .then(data => { setEntries(data); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })

    const channel = subscribeToEntries(
      (newEntry) => setEntries(prev => prev.some(e => e.id === newEntry.id) ? prev : [newEntry, ...prev]),
      (updatedEntry) => setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e)),
      (deletedId) => setEntries(prev => prev.filter(e => e.id !== deletedId))
    )

    // Load challenge data for dashboard leaderboards
    loadChallengeEntries('steps').then(setStepsData)
    loadChallengeEntries('water').then(setWaterData)

    const stepsChannel = subscribeToChallengeEntries('steps', () => {
      loadChallengeEntries('steps').then(setStepsData)
    })
    const waterChannel = subscribeToChallengeEntries('water', () => {
      loadChallengeEntries('water').then(setWaterData)
    })

    // Message listener for tweaks panel toggle
    const handleMessage = (e) => {
      if (e.data?.type === '__activate_edit_mode') setShowTweaks(true)
      if (e.data?.type === '__deactivate_edit_mode') setShowTweaks(false)
    }
    window.addEventListener('message', handleMessage)
    window.parent.postMessage({ type: '__edit_mode_available' }, '*')

    return () => {
      channel.unsubscribe()
      stepsChannel.unsubscribe()
      waterChannel.unsubscribe()
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  function setTweak(key, val) {
    setTweaksState(prev => {
      const next = { ...prev, [key]: val }
      localStorage.setItem('moveit_tweaks', JSON.stringify(next))
      return next
    })
  }

  useEffect(() => { window.scrollTo(0, 0) }, [view.page])

  const stats = useMemo(() => computeStats(entries), [entries])
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  function showToast(msg, icon = '🎉') {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleSaveEntry(entry) {
    try {
      const saved = await addEntry(entry)
      setEntries(prev => [saved, ...prev])
      setShowLog(false)
      showToast(`${entry.totalPts} pts logged for ${entry.player}!`)
    } catch(err) {
      showToast('Failed to save — try again', '❌')
    }
  }

  async function handleEditEntry(updatedEntry) {
    try {
      await updateEntry(updatedEntry)
      setEntries(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e))
      setEditEntry(null)
      showToast('Entry updated!', '✅')
    } catch(err) {
      showToast('Failed to update — try again', '❌')
    }
  }

  async function handleDeleteEntry(entryId) {
    try {
      await deleteEntry(entryId)
      setEntries(prev => prev.filter(e => e.id !== entryId))
      setEditEntry(null)
      showToast('Entry deleted', '🗑️')
    } catch(err) {
      showToast('Failed to delete — try again', '❌')
    }
  }

  function handlePlayerNameClick(playerName, teamName) {
    setView({ page: 'team', teamName, highlightPlayer: playerName })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>🏃</div>
      <div style={{ fontSize: 16, color: 'var(--muted)', fontFamily: 'var(--font)' }}>Loading Move it May…</div>
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16, padding: 32 }}>
      <div style={{ fontSize: 40 }}>⚠️</div>
      <div style={{ fontSize: 16, fontFamily: 'var(--font)', textAlign: 'center' }}>
        Failed to connect to database.<br/>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>{error}</span>
      </div>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Retry</button>
    </div>
  )

  return (
    <div className="app-shell">
      <nav className="nav">
        <div className="nav-brand" onClick={() => setView({ page: 'dashboard', teamName: null, highlightPlayer: null })}>
          <div className="nav-brand-badge">🏃</div>
          <div>
            <div>Move it May 2026</div>
            <div className="nav-sub">C-4 Analytics Fitness Challenge</div>
          </div>
        </div>
        <div className="nav-date">{today}</div>
        <button className="btn-log" onClick={() => setShowLog(true)}>
          <span>+</span> Log Points
        </button>
      </nav>

      {view.page === 'dashboard' && (
        <Dashboard
          stats={stats}
          allEntries={entries}
          stepsData={stepsData}
          waterData={waterData}
          onTeamClick={(name) => setView({ page: 'team', teamName: name, highlightPlayer: null })}
          onChallengeClick={(id) => setView({ page: id, teamName: null, highlightPlayer: null })}
          onPlayerNameClick={handlePlayerNameClick}
        />
      )}
      {view.page === 'team' && view.teamName && (
        <TeamPage
          teamName={view.teamName}
          stats={stats}
          highlightPlayer={view.highlightPlayer}
          tweaks={tweaks}
          onBack={() => setView({ page: 'dashboard', teamName: null, highlightPlayer: null })}
          onEditEntry={setEditEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
      {view.page === 'steps' && (
        <ErrorBoundary key="steps">
          <ManualChallengePage
            challengeId="steps"
            onBack={() => setView({ page: 'dashboard' })}
            allEntries={entries}
          />
        </ErrorBoundary>
      )}
      {view.page === 'water' && (
        <ErrorBoundary key="water">
          <ManualChallengePage
            challengeId="water"
            onBack={() => setView({ page: 'dashboard' })}
            allEntries={entries}
          />
        </ErrorBoundary>
      )}
      {view.page === 'habit' && (
        <ErrorBoundary key="habit">
          <HabitStreakPage
            onBack={() => setView({ page: 'dashboard' })}
            allEntries={entries}
          />
        </ErrorBoundary>
      )}
      {view.page === 'pts' && (
        <ErrorBoundary key="pts">
          <MostPtsPage
            onBack={() => setView({ page: 'dashboard' })}
            allEntries={entries}
          />
        </ErrorBoundary>
      )}

      {showLog && (
        <LogModal
          onClose={() => setShowLog(false)}
          onSave={handleSaveEntry}
          allEntries={entries}
        />
      )}

      {editEntry && (
        <EditEntryModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onSave={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )}

      {toast && (
        <div className="toast">
          <span className="toast-icon">{toast.icon}</span>
          <span>{toast.msg}</span>
        </div>
      )}

      {showTweaks && (
        <TweaksPanel
          tweaks={tweaks}
          setTweak={setTweak}
          onClose={() => { setShowTweaks(false); window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*') }}
        />
      )}
    </div>
  )
}
