import { useState } from 'react'
import { TEAMS_DATA, getPlayerTeam, initials } from '../data.js'

function getHabitStreakLeaderboard(entries) {
  const HABIT_DAYS = ['2026-05-17','2026-05-18','2026-05-19','2026-05-20','2026-05-21','2026-05-22','2026-05-23']
  const allPlayers = Object.values(TEAMS_DATA).flatMap(t => t.players)
  return allPlayers.map(player => {
    const activeDays = HABIT_DAYS.filter(d => entries.some(e => e.player === player && e.date === d))
    return { name: player, activeDays: activeDays.length, qualified: activeDays.length === 7, team: getPlayerTeam(player) }
  }).sort((a, b) => b.activeDays - a.activeDays).slice(0, 3)
}

function getMostPtsLeaderboard(entries) {
  const allPlayers = Object.values(TEAMS_DATA).flatMap(t => t.players)
  return allPlayers.map(player => {
    const pts = entries.filter(e => e.player === player && e.date >= '2026-05-24' && e.date <= '2026-05-30')
      .reduce((s, e) => s + e.totalPts, 0)
    return { name: player, pts, team: getPlayerTeam(player) }
  }).sort((a, b) => b.pts - a.pts).slice(0, 3)
}

function getChallengeLeaderboardFromData(challengeId, data, threshold, pts) {
  const totals = {}
  Object.entries(data).forEach(([key, val]) => {
    const [player] = key.split('||')
    if (!totals[player]) totals[player] = { totalVal: 0, pts: 0 }
    totals[player].totalVal += Number(val) || 0
    if (Number(val) >= threshold) totals[player].pts += pts
  })
  return Object.entries(totals)
    .map(([name, d]) => ({ name, totalVal: d.totalVal, pts: d.pts, team: getPlayerTeam(name) }))
    .sort((a, b) => b.pts - a.pts || b.totalVal - a.totalVal)
    .slice(0, 3)
}

export default function Dashboard({ stats, onTeamClick, onChallengeClick, onPlayerNameClick, allEntries, stepsData, waterData }) {
  const { sortedTeams, sortedPlayers } = stats
  const maxTeamPts = sortedTeams[0]?.[1].total || 1

  const [playerSearch, setPlayerSearch] = useState('')
  const [showPlayerResults, setShowPlayerResults] = useState(false)
  const allPlayersList = Object.values(TEAMS_DATA).flatMap(t => t.players.map(p => ({ name: p, team: getPlayerTeam(p) }))).sort((a, b) => a.name.localeCompare(b.name))
  const playerResults = playerSearch.trim().length > 0
    ? allPlayersList.filter(p => p.name.toLowerCase().includes(playerSearch.toLowerCase())).slice(0, 8)
    : []

  const challenges = [
    { week: 'Week 1', title: 'Steps Challenge',            dates: 'May 3–9',   emoji: '👟', id: 'steps', active: true,  manual: true  },
    { week: 'Week 2', title: 'Water Challenge (80oz/day)', dates: 'May 10–16', emoji: '💧', id: 'water', active: false, manual: true  },
    { week: 'Week 3', title: 'Healthy Habit Streak',       dates: 'May 17–23', emoji: '🔥', id: 'habit', active: false, manual: false },
    { week: 'Week 4', title: 'Most Points',                dates: 'May 24–30', emoji: '⚡', id: 'pts',   active: false, manual: false },
  ]

  function getChallengeTop3(id) {
    if (id === 'steps') return getChallengeLeaderboardFromData('steps', stepsData || {}, 10000, 3)
    if (id === 'water') return getChallengeLeaderboardFromData('water', waterData || {}, 80, 2)
    if (id === 'habit') return getHabitStreakLeaderboard(allEntries)
    if (id === 'pts')   return getMostPtsLeaderboard(allEntries)
    return []
  }


  return (
    <div className="page">
      {/* C-4 Highlights header */}
      <div className="highlights-header">C-4 Company Highlights</div>
      <div className="highlights-sub">Move it May 2026 — Live Leaderboard</div>

      {/* Player search */}
      <div style={{ position: 'relative', maxWidth: 420, margin: '14px auto 4px' }}>
        <input
          className="form-input"
          placeholder="🔍  Search for a player…"
          value={playerSearch}
          onChange={e => { setPlayerSearch(e.target.value); setShowPlayerResults(true) }}
          onFocus={() => setShowPlayerResults(true)}
          onBlur={() => setTimeout(() => setShowPlayerResults(false), 150)}
          style={{ fontSize: 14 }}
        />
        {showPlayerResults && playerResults.length > 0 && (
          <div className="search-results" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200 }}>
            {playerResults.map(p => {
              const team = TEAMS_DATA[p.team]
              return (
                <div key={p.name} className="search-result-item" onMouseDown={() => {
                  onPlayerNameClick(p.name, p.team)
                  setPlayerSearch('')
                  setShowPlayerResults(false)
                }}>
                  <div style={{ width: 28, height: 28, fontSize: 11, background: team?.color || '#888', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
                  <span>{p.name}</span>
                  <span className="search-result-team">{p.team}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Team Podium */}
      <div className="section-title" style={{ fontSize: '16px' }}>Team Standings</div>
      <div className="podium-row">
        {sortedTeams.slice(0, 3).map(([name, ts], i) => {
          const team = TEAMS_DATA[name]
          const crowns = ['👑', '🥈', '🥉']
          return (
            <div key={name} className="podium-card"
              style={{ background: `linear-gradient(145deg,${team.color}18 0%,${team.color}08 100%)`, borderColor: i === 0 ? team.color : 'transparent' }}
              onClick={() => onTeamClick(name)}>
              <div className="podium-crown">{crowns[i]}</div>
              <div className="podium-rank">{['1st Place', '2nd Place', '3rd Place'][i]}</div>
              <div className="podium-emoji">{team.emoji}</div>
              <div className="podium-name" style={{ color: team.color }}>{name}</div>
              <div className="podium-pts" style={{ color: team.color }}>{ts.total}</div>
              <div className="podium-pts-label">points</div>
              <div className="podium-avg">avg {ts.avg}/person</div>
            </div>
          )
        })}
      </div>

      <div className="dashboard-grid">
        {/* Team Rankings */}
        <div className="card">
          <div className="section-title" style={{ fontSize: '16px' }}>All Team Rankings</div>
          <table className="rank-table">
            <thead><tr>
              <th style={{ width: 30 }}>#</th><th>Team</th>
              <th style={{ width: 120 }} className="rank-bar-cell">Progress</th>
              <th>Pts</th><th>Avg</th>
            </tr></thead>
            <tbody>
              {sortedTeams.map(([name, ts], i) => {
                const team = TEAMS_DATA[name]
                return (
                  <tr key={name} onClick={() => onTeamClick(name)}>
                    <td className="rank-num">{i + 1}</td>
                    <td><div className="rank-badge"><span className="rank-dot" style={{ background: team.color }}></span><span>{team.emoji} {name}</span></div></td>
                    <td className="rank-bar-cell"><div className="rank-bar-bg"><div className="rank-bar-fill" style={{ width: `${ts.total / maxTeamPts * 100}%`, background: team.color }}></div></div></td>
                    <td className="rank-pts" style={{ color: team.color }}>{ts.total}</td>
                    <td className="rank-avg">{ts.avg}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Weekly Challenges */}
        <div className="card">
          <div className="section-title" style={{ fontSize: '16px' }}>Weekly Challenges</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {challenges.map((c, i) => {
              const top3 = getChallengeTop3(c.id)
              const medals = ['🥇','🥈','🥉']
              return (
                <div key={i} className={`challenge-card ${c.active ? 'challenge-active' : ''}`}
                  onClick={() => onChallengeClick(c.id)}
                  style={{ cursor: 'pointer', margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{c.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div className="challenge-week" style={{ marginBottom: 1 }}>{c.active && <span className="live-dot"></span>}{c.week}</div>
                      <div className="challenge-title" style={{ fontSize: 13 }}>{c.title}</div>
                    </div>
                    <div className="challenge-dates" style={{ whiteSpace: 'nowrap' }}>{c.dates}</div>
                  </div>
                  {top3.length > 0 && (
                    <div style={{ marginTop: 8, borderTop: '1px solid var(--border)', paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {top3.map((p, ri) => {
                        const team = TEAMS_DATA[p.team]
                        const val = c.id === 'steps' ? `${(p.totalVal||0).toLocaleString()} steps` :
                                    c.id === 'water' ? `${(p.totalVal||0)} oz` :
                                    c.id === 'habit' ? `${p.activeDays}/7 days` :
                                    `${p.pts} pts`
                        return (
                          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                            <span>{medals[ri]}</span>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: team?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
                            <span style={{ flex: 1, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name.split(' ')[0]}</span>
                            <span style={{ color: team?.color, fontWeight: 700 }}>{val}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="challenge-click-hint" style={{ marginTop: top3.length > 0 ? 6 : 4 }}>
                    {c.manual ? 'Click to enter →' : 'Click to view →'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Individual Rankings */}
        <div className="card">
          <div className="section-title" style={{ fontSize: '16px' }}>Individual Rankings — Top 15</div>
          <div className="player-list">
            {sortedPlayers.slice(0, 15).map(([name, ps], i) => {
              const team = TEAMS_DATA[ps.team]
              const medals = ['🥇', '🥈', '🥉']
              return (
                <div key={name} className="player-row" onClick={() => onPlayerNameClick(name, ps.team)}>
                  <div className="player-rank-num">{i < 3 ? medals[i] : i + 1}</div>
                  <div className="player-avatar" style={{ background: team?.color || '#888' }}>{initials(name)}</div>
                  <div className="player-name">{name}</div>
                  <span className="player-team-tag" style={{ background: team?.bg || '#eee', color: team?.color || '#888' }}>
                    {ps.team}
                  </span>
                  <div className="player-pts" style={{ color: team?.color }}>{ps.total}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="card">
          <div className="section-title" style={{ fontSize: '16px' }}>Recently Logged Activity</div>
          {stats.recentFeed.length === 0
            ? <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No activity logged yet — be the first!</div></div>
            : (
              <div className="feed-list">
                {stats.recentFeed.map((entry, i) => {
                  const team = TEAMS_DATA[entry.team]
                  const actNames = entry.activities.map((a) => a.name).join(', ')
                  const elapsed = entry.loggedAt ? Math.floor((Date.now() - entry.loggedAt) / 60000) : null
                  const timeLabel = elapsed === null ? 'Earlier' : elapsed < 1 ? 'Just now' : elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.floor(elapsed / 60)}h ago` : `${Math.floor(elapsed / 1440)}d ago`
                  return (
                    <div key={entry.id || i} className="feed-item">
                      <div className="feed-avatar" style={{ background: team?.color || '#888' }}>{initials(entry.player)}</div>
                      <div className="feed-body">
                        <div className="feed-name">{entry.player}</div>
                        <div className="feed-detail">{actNames || 'Activity logged'}{entry.bonuses?.length > 0 ? ` + ${entry.bonuses.length} bonus` : ''}</div>
                        <div className="feed-time">{timeLabel} · {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                      <div>
                        <div className="feed-pts" style={{ color: team?.color || 'var(--accent)' }}>+{entry.totalPts}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
