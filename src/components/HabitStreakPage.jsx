import { useState } from 'react'
import { TEAMS_DATA, getPlayerTeam, initials } from '../data.js'

const HABIT_DAYS = [
  { label: 'Sat, May 17', date: '2026-05-17' },
  { label: 'Sun, May 18', date: '2026-05-18' },
  { label: 'Mon, May 19', date: '2026-05-19' },
  { label: 'Tue, May 20', date: '2026-05-20' },
  { label: 'Wed, May 21', date: '2026-05-21' },
  { label: 'Thu, May 22', date: '2026-05-22' },
  { label: 'Fri, May 23', date: '2026-05-23' },
]

export default function HabitStreakPage({ onBack, allEntries }) {
  const [activeTeam, setActiveTeam] = useState('all')

  const allPlayers = Object.values(TEAMS_DATA).flatMap(t => t.players)
  const playerData = allPlayers.map(player => {
    const activeDays = HABIT_DAYS.filter(d => allEntries.some(e => e.player === player && e.date === d.date))
    return { name: player, activeDays, count: activeDays.length, qualified: activeDays.length === 7, team: getPlayerTeam(player) }
  }).sort((a, b) => b.count - a.count)

  const leaders = playerData.filter(p => p.count > 0).slice(0, 3)
  const teams = Object.keys(TEAMS_DATA)
  const visibleTeams = activeTeam === 'all' ? teams : [activeTeam]

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="highlights-header">🔥 Week 3: Healthy Habit Streak</div>
      <div className="highlights-sub">May 17–23 · Log activity every single day this week to qualify. Tracks automatically from your logged points.</div>

      {leaders.length > 0 && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div className="section-title" style={{ marginBottom: 10 }}>🏆 Current Leaders</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {leaders.map((p, i) => {
              const team = TEAMS_DATA[p.team]
              const medals = ['🥇','🥈','🥉']
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg)', borderRadius: 10, flex: 1 }}>
                  <span style={{ fontSize: 16 }}>{medals[i]}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: team?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.count}/7 days</div>
                  </div>
                  {p.qualified && <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '2px 8px', borderRadius: 99 }}>✓ Qualified</span>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Team nav */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        <button onClick={() => setActiveTeam('all')}
          style={{ padding: '7px 16px', borderRadius: 99, border: `2px solid ${activeTeam === 'all' ? 'var(--accent)' : 'var(--border)'}`, background: activeTeam === 'all' ? 'var(--accent-light)' : 'var(--surface)', color: activeTeam === 'all' ? 'var(--accent)' : 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          All Teams
        </button>
        {teams.map(t => {
          const team = TEAMS_DATA[t]
          const isActive = activeTeam === t
          return (
            <button key={t} onClick={() => setActiveTeam(t)}
              style={{ padding: '7px 16px', borderRadius: 99, border: `2px solid ${isActive ? team.color : 'var(--border)'}`, background: isActive ? team.color + '18' : 'var(--surface)', color: isActive ? team.color : 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {team.emoji} {t}
            </button>
          )
        })}
      </div>

      {visibleTeams.map(teamName => {
        const team = TEAMS_DATA[teamName]
        const players = playerData.filter(p => p.team === teamName)
        return (
          <div key={teamName} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: team.color }}></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: team.color }}>{team.emoji} {teamName}</div>
            </div>
            <div className="steps-grid">
              {players.map(p => (
                <div key={p.name} className="steps-player-card">
                  <div className="steps-player-header">
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials(p.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.count}/7 days logged</div>
                    </div>
                    {p.qualified
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: '#22C55E', background: '#DCFCE7', padding: '3px 10px', borderRadius: 99 }}>✓ Qualified</span>
                      : <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--bg)', padding: '3px 10px', borderRadius: 99 }}>{p.count}/7</span>
                    }
                  </div>
                  <div className="steps-player-body">
                    {HABIT_DAYS.map(({ label, date }) => {
                      const logged = allEntries.some(e => e.player === p.name && e.date === date)
                      return (
                        <div key={date} className="steps-day-row">
                          <div className="steps-day-label" style={{ width: 90, fontSize: 11 }}>{label}</div>
                          <div style={{ flex: 1, fontSize: 12, color: logged ? '#22C55E' : 'var(--muted)', fontWeight: logged ? 700 : 400 }}>
                            {logged ? '✓ Activity logged' : 'No activity'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
