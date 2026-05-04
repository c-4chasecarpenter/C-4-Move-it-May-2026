import { useEffect, useRef } from 'react'
import { TEAMS_DATA, initials } from '../data.js'
import MiniCalendar from './MiniCalendar.jsx'

export default function TeamPage({ teamName, stats, onBack, highlightPlayer, onEditEntry, onDeleteEntry, tweaks = {}, onLogDay }) {
  const team = TEAMS_DATA[teamName]
  const teamStat = stats.teamStats[teamName]
  const rank = stats.sortedTeams.findIndex(([n]) => n === teamName) + 1
  const cardRefs = useRef({})

  const tw = { calSize: 'normal', showDayPts: true, heatmap: true, cardsPerRow: 'auto', showStreak: true, ...tweaks }

  const players = team.players.map((p) => ({
    name: p, pts: stats.playerStats[p]?.total || 0,
    days: stats.playerStats[p]?.days || {}, streak: stats.playerStats[p]?.streak || 0
  })).sort((a, b) => b.pts - a.pts)

  useEffect(() => {
    if (highlightPlayer && cardRefs.current[highlightPlayer]) {
      const el = cardRefs.current[highlightPlayer]
      const top = el.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top, behavior: 'smooth' })
      el.classList.add('scroll-highlight')
      setTimeout(() => el.classList.remove('scroll-highlight'), 2000)
    }
  }, [highlightPlayer])

  const gridCols = tw.cardsPerRow === 'auto'
    ? 'repeat(auto-fill, minmax(340px, 1fr))'
    : `repeat(${tw.cardsPerRow}, 1fr)`

  const calPadding = tw.calSize === 'compact' ? '10px 12px' : tw.calSize === 'large' ? '18px 20px' : '14px 16px'
  const dayMinHeight = tw.calSize === 'compact' ? '26px' : tw.calSize === 'large' ? '46px' : '34px'
  const dayFontSize = tw.calSize === 'compact' ? '9px' : tw.calSize === 'large' ? '13px' : '11px'

  return (
    <div className="page">
      <button className="btn-back" onClick={onBack}>← Back to Dashboard</button>
      <div className="team-header" style={{ background: `linear-gradient(135deg,${team.color} 0%,${team.color}CC 100%)` }}>
        <div className="team-header-emoji">{team.emoji}</div>
        <div className="team-header-info">
          <div className="team-header-name">{teamName}</div>
          <div className="team-header-stats">
            <div><div className="team-stat-val">{teamStat.total}</div><div className="team-stat-label">Team Points</div></div>
            <div><div className="team-stat-val">{teamStat.avg}</div><div className="team-stat-label">Avg/Person</div></div>
            <div><div className="team-stat-val">{team.players.length}</div><div className="team-stat-label">Members</div></div>
          </div>
        </div>
        <div className="team-header-rank">#{rank}</div>
      </div>

      <div className="section-title">Team Roster & Activity Calendar</div>
      <div className="players-grid" style={{ gridTemplateColumns: gridCols }}>
        {players.map((p, idx) => (
          <div key={p.name} className="player-card" ref={(el) => cardRefs.current[p.name] = el}>
            <div className="player-card-header">
              <div className="player-card-avatar" style={{ background: team.color }}>{initials(p.name)}</div>
              <div>
                <div className="player-card-name">{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`} on team
                  {tw.showStreak && p.streak > 0 && (
                    <span style={{ marginLeft: 8, color: '#F07B00', fontWeight: 600 }}>🔥 {p.streak}d streak</span>
                  )}
                </div>
              </div>
              <div className="player-card-pts">
                <div className="player-card-pts-val" style={{ color: team.color }}>{p.pts}</div>
                <div className="player-card-pts-label">pts</div>
              </div>
            </div>
            <MiniCalendar
              playerDays={p.days}
              teamColor={tw.heatmap ? team.color : '#888'}
              showPtsLabels={tw.showDayPts}
              calPadding={calPadding}
              dayMinHeight={dayMinHeight}
              dayFontSize={dayFontSize}
              onEditEntry={onEditEntry}
              onLogDay={onLogDay ? (dateStr) => onLogDay(p.name, dateStr) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
