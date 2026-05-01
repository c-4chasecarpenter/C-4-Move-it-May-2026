import ReactDOM from 'react-dom'

export default function CalTooltip({ day, entries, pos, onEdit, onKeepAlive, onHide }) {
  if (!pos) return null
  const total = entries.reduce((s, e) => s + e.totalPts, 0)
  const allActs = entries.flatMap((e) => e.activities || [])
  const allBonuses = entries.flatMap((e) => e.bonuses || [])
  const d = new Date(2026, 4, day)
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  const flipY = pos.y < 240
  const top = flipY ? pos.y + (pos.h || 34) + 8 : pos.y - 8
  const transform = flipY ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'

  const el = (
    <div
      className="cal-tooltip"
      style={{ left: pos.x, top, transform, pointerEvents: 'auto' }}
      onMouseEnter={onKeepAlive}
      onMouseLeave={onHide}
    >
      <div className="cal-tooltip-date">{label}</div>
      <div className="cal-tooltip-pts">
        {total}
        <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(127,200,255,.7)', marginLeft: 4 }}>pts</span>
      </div>
      <div className="cal-tooltip-acts">
        {allActs.map((a, i) => (
          <div key={i} className="cal-tooltip-act-row">
            <div className="cal-tooltip-act-name">{a.name}</div>
            <div className="cal-tooltip-act-meta">
              {a.duration > 0 && <span className="cal-tooltip-act-dur">⏱ {a.duration} min</span>}
              <span className="cal-tooltip-act-pts">+{a.pts} pts</span>
            </div>
          </div>
        ))}
        {allBonuses.map((b, i) => (
          <div key={i} className="cal-tooltip-bonus-row">★ {b.label} — +{b.pts} pts</div>
        ))}
      </div>
      {onEdit && (
        <div className="cal-tooltip-edit" onClick={(e) => { e.stopPropagation(); onEdit() }}>
          ✏️ Edit this day's entries →
        </div>
      )}
    </div>
  )
  return ReactDOM.createPortal(el, document.body)
}
