import { useState, useEffect } from 'react'
import { loadChallengeEntries, setChallengeValue, subscribeToChallengeEntries } from '../lib/db.js'
import { TEAMS_DATA, CHALLENGE_DEFS, initials, getPlayerTeam } from '../data.js'

export default function ManualChallengePage({ challengeId, onBack, allEntries }) {
  const def = CHALLENGE_DEFS[challengeId]
  const [data, setData] = useState({})
  const [activeTeam, setActiveTeam] = useState('all')

  useEffect(() => {
    loadChallengeEntries(challengeId).then(setData)
    const channel = subscribeToChallengeEntries(challengeId, () => {
      loadChallengeEntries(challengeId).then(setData)
    })
    return () => channel.unsubscribe()
  }, [challengeId])

  function getKey(player, date) { return `${player}||${date}` }
  function getVal(player, date) { return data[getKey(player, date)] || '' }

  async function setVal(player, date, val) {
    const key = getKey(player, date)
    setData(prev => ({ ...prev, [key]: val }))
    await setChallengeValue(challengeId, player, date, val)
  }

  function calcPts(val) { return Number(val) >= def.threshold ? def.pts : 0 }

  function getPlayerWeeklyTotal(player) {
    return def.days.reduce((s, d) => s + calcPts(getVal(player, d.date)), 0)
  }

  function getPlayerWeeklyVal(player) {
    return def.days.reduce((s, d) => s + (Number(getVal(player, d.date)) || 0), 0)
  }

  const teams = Object.keys(TEAMS_DATA)
  const visibleTeams = activeTeam === 'all' ? teams : [activeTeam]

  const leaderboard = Object.values(TEAMS_DATA).flatMap(t => t.players)
    .map(p => ({ name: p, pts: getPlayerWeeklyTotal(p), val: getPlayerWeeklyVal(p), team: getPlayerTeam(p) }))
    .sort((a, b) => challengeId === 'steps' ? b.val - a.val : b.pts - a.pts || b.val - a.val)
    .slice(0, 5)

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="highlights-header">{def.emoji} {def.title}</div>
      <div className="highlights-sub">{def.dates} · {def.desc}</div>

      {leaderboard.some(p => p.pts > 0 || (challengeId === 'steps' && p.val > 0)) && (
        <div className="card" style={{ marginBottom: 24, padding: '16px 20px' }}>
          <div className="section-title" style={{ marginBottom: 10 }}>🏆 Current Leaders</div>
          <div style={{ display: 'flex', gap: 16 }}>
            {leaderboard.filter(p => p.pts > 0 || (challengeId === 'steps' && p.val > 0)).slice(0, 3).map((p, i) => {
              const team = TEAMS_DATA[p.team]
              const medals = ['🥇','🥈','🥉','4','5']
              return (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg)', borderRadius: 10, flex: 1 }}>
                  <span style={{ fontSize: 16 }}>{medals[i]}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: team?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {challengeId === 'steps' ? `${p.val.toLocaleString()} steps` : `${p.val.toLocaleString()} ${def.unit}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: team?.color }}>
                    {challengeId === 'steps' ? `${p.val.toLocaleString()}` : `${p.pts}pts`}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Team nav buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTeam('all')}
          style={{ padding: '7px 16px', borderRadius: 99, border: `2px solid ${activeTeam === 'all' ? 'var(--accent)' : 'var(--border)'}`, background: activeTeam === 'all' ? 'var(--accent-light)' : 'var(--surface)', color: activeTeam === 'all' ? 'var(--accent)' : 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
          All Teams
        </button>
        {teams.map(t => {
          const team = TEAMS_DATA[t]
          const isActive = activeTeam === t
          return (
            <button key={t} onClick={() => setActiveTeam(t)}
              style={{ padding: '7px 16px', borderRadius: 99, border: `2px solid ${isActive ? team.color : 'var(--border)'}`, background: isActive ? team.color + '18' : 'var(--surface)', color: isActive ? team.color : 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
              {team.emoji} {t}
            </button>
          )
        })}
      </div>

      {visibleTeams.map(teamName => {
        const team = TEAMS_DATA[teamName]
        return (
          <div key={teamName} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: team.color, flexShrink: 0 }}></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: team.color }}>{team.emoji} {teamName}</div>
            </div>
            <div className="steps-grid">
              {team.players.map(player => {
                const total = getPlayerWeeklyTotal(player)
                const totalVal = getPlayerWeeklyVal(player)
                const isSteps = challengeId === 'steps'
                return (
                  <div key={player} className="steps-player-card">
                    <div className="steps-player-header">
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials(player)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{player}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                          {isSteps ? `${totalVal.toLocaleString()} steps` : `${totalVal.toLocaleString()} ${def.unit} total`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: totalVal > 0 ? team.color : 'var(--muted)' }}>
                          {isSteps ? totalVal.toLocaleString() : total + ' pts'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>{isSteps ? 'total steps' : 'this week'}</div>
                      </div>
                    </div>
                    <div className="steps-player-body">
                      {def.days.map(({ label, date }) => {
                        const val = getVal(player, date)
                        const pts = calcPts(val)
                        return (
                          <div key={date} className="steps-day-row">
                            <div className="steps-day-label" style={{ width: 80, fontSize: 11 }}>{label}</div>
                            <input className="steps-input" type="number" min="0" max="999999"
                              placeholder={`0 ${def.unit}`} value={val}
                              onChange={e => setVal(player, date, e.target.value)} />
                            <div className="steps-pts" style={{ color: pts > 0 ? team.color : 'var(--muted)', width: 44 }}>
                              {pts > 0 ? `+${pts}` : val && Number(val) > 0 ? '—' : ''}
                            </div>
                          </div>
                        )
                      })}
                      <div className="steps-total">
                        <span className="steps-total-label">{isSteps ? 'Week Total Steps' : 'Week Total'}</span>
                        <span className="steps-total-pts" style={{ color: (isSteps ? totalVal : total) > 0 ? team.color : 'var(--muted)' }}>
                          {isSteps ? totalVal.toLocaleString() : `${total} pts`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
