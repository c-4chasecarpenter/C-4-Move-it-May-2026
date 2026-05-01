import { useState } from 'react'
import { TEAMS_DATA, getPlayerTeam, initials } from '../data.js'

const WEEK4_DAYS = [
  { label: 'Sat, May 24', date: '2026-05-24' },
  { label: 'Sun, May 25', date: '2026-05-25' },
  { label: 'Mon, May 26', date: '2026-05-26' },
  { label: 'Tue, May 27', date: '2026-05-27' },
  { label: 'Wed, May 28', date: '2026-05-28' },
  { label: 'Thu, May 29', date: '2026-05-29' },
  { label: 'Fri, May 30', date: '2026-05-30' },
]

export default function MostPtsPage({ onBack, allEntries }) {
  const [activeTeam, setActiveTeam] = useState('all')

  const allPlayers = Object.values(TEAMS_DATA).flatMap(t => t.players)
  const playerData = allPlayers.map(player => {
    const dayPts = {}
    WEEK4_DAYS.forEach(({ date }) => {
      dayPts[date] = allEntries.filter(e => e.player === player && e.date === date).reduce((s, e) => s + e.totalPts, 0)
    })
    const totalPts = Object.values(dayPts).reduce((s, p) => s + p, 0)
    return { name: player, dayPts, totalPts, team: getPlayerTeam(player) }
  }).sort((a, b) => b.totalPts - a.totalPts)

  const leaders = playerData.filter(p => p.totalPts > 0).slice(0, 3)
  const teams = Object.keys(TEAMS_DATA)
  const visibleTeams = activeTeam === 'all' ? teams : [activeTeam]

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="highlights-header">⚡ Week 4: Most Points</div>
      <div className="highlights-sub">May 24–30 · Most total points logged this week wins. Pulls automatically from all logged activity.</div>

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
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: team?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{initials(p.name)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{team?.emoji} {p.team}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: team?.color }}>{p.totalPts} pts</div>
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
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: p.totalPts > 0 ? team.color : 'var(--muted)' }}>{p.totalPts} pts</div>
                  </div>
                  <div className="steps-player-body">
                    {WEEK4_DAYS.map(({ label, date }) => {
                      const pts = p.dayPts[date] || 0
                      return (
                        <div key={date} className="steps-day-row">
                          <div className="steps-day-label" style={{ width: 90, fontSize: 11 }}>{label}</div>
                          <div style={{ flex: 1 }}></div>
                          <div style={{ fontSize: 13, fontWeight: pts > 0 ? 700 : 400, color: pts > 0 ? team.color : 'var(--muted)' }}>
                            {pts > 0 ? `+${pts} pts` : '—'}
                          </div>
                        </div>
                      )
                    })}
                    <div className="steps-total">
                      <span className="steps-total-label">Week Total</span>
                      <span className="steps-total-pts" style={{ color: p.totalPts > 0 ? team.color : 'var(--muted)' }}>{p.totalPts} pts</span>
                    </div>
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
