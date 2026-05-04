import { useState, useRef, useEffect } from 'react'
import { MAY_DAYS, MONTH_START_DOF, mayDateStr } from '../data.js'
import CalTooltip from './CalTooltip.jsx'

export default function MiniCalendar({ playerDays, teamColor, onEditEntry, onLogDay, showPtsLabels = true, calPadding, dayMinHeight, dayFontSize }) {
  const [tooltip, setTooltip] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const hideTimer = useRef(null)
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const today = new Date()
  const todayDay = today.getFullYear() === 2026 && today.getMonth() === 4 ? today.getDate() : null
  const maxPts = Math.max(1, ...Object.values(playerDays).map((e) => e.reduce((s, x) => s + x.totalPts, 0)))
  const padded = Array(MONTH_START_DOF).fill(null).concat(MAY_DAYS)
  const calStyle = calPadding ? { padding: calPadding } : {}
  const mh = dayMinHeight || '34px'
  const fs = dayFontSize || '11px'

  function getColor(pts) {
    const alpha = Math.min(0.9, 0.18 + 0.72 * (pts / maxPts))
    const hex = Math.round(alpha * 255).toString(16).padStart(2, '0')
    return teamColor ? `${teamColor}${hex}` : `rgba(59,111,232,${alpha})`
  }

  function scheduleHide() {
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => { setTooltip(null); setHoveredDay(null) }, 200)
  }
  function cancelHide() {
    clearTimeout(hideTimer.current)
  }

  useEffect(() => () => clearTimeout(hideTimer.current), [])

  return (
    <div className="mini-cal" style={calStyle}>
      <div className="mini-cal-header">
        {days.map((d, i) => <div key={i} className="mini-cal-dayname">{d}</div>)}
      </div>
      <div className="mini-cal-grid">
        {padded.map((day, i) => {
          if (!day) return <div key={i} className="mini-cal-day empty" style={{ minHeight: mh }}></div>
          const dateKey = mayDateStr(day)
          const entries = playerDays[dateKey] || []
          const pts = entries.reduce((s, e) => s + e.totalPts, 0)
          const isToday = day === todayDay
          const isActive = pts > 0
          const isHovered = hoveredDay === day
          return (
            <div
              key={i}
              className={`mini-cal-day ${isActive ? 'has-pts' : 'no-pts'} ${isToday ? 'today-marker' : ''}`}
              style={{
                ...(isActive ? { background: getColor(pts), color: '#fff' } : {}),
                minHeight: mh, fontSize: fs, position: 'relative',
                cursor: onLogDay ? 'pointer' : undefined,
              }}
              onClick={() => onLogDay && onLogDay(dateKey)}
              onMouseEnter={(e) => {
                if (isActive) {
                  cancelHide()
                  setHoveredDay(day)
                  const rect = e.currentTarget.getBoundingClientRect()
                  setTooltip({ day, entries, pos: { x: rect.left + rect.width / 2, y: rect.top, h: rect.height } })
                } else {
                  setHoveredDay(day)
                }
              }}
              onMouseLeave={() => { isActive ? scheduleHide() : setHoveredDay(null) }}
            >
              <span className="mini-cal-day-num">{day}</span>
              {isActive && showPtsLabels && !isHovered && <span className="mini-cal-day-pts">{pts}pt</span>}
              {isActive && isHovered && onEditEntry && (
                <span
                  className="mini-cal-day-edit-btn"
                  onMouseEnter={cancelHide}
                  onClick={(e) => { e.stopPropagation(); cancelHide(); setTooltip(null); setHoveredDay(null); onEditEntry(entries[0]) }}
                  title="Edit entries for this day"
                >✏️</span>
              )}
              {!isActive && isHovered && onLogDay && (
                <span className="mini-cal-day-add-btn" title="Log points for this day">+</span>
              )}
            </div>
          )
        })}
      </div>
      {tooltip && (
        <CalTooltip
          day={tooltip.day}
          entries={tooltip.entries}
          pos={tooltip.pos}
          onEdit={onEditEntry ? () => { cancelHide(); setTooltip(null); setHoveredDay(null); onEditEntry(tooltip.entries[0]) } : null}
          onKeepAlive={cancelHide}
          onHide={scheduleHide}
        />
      )}
    </div>
  )
}
