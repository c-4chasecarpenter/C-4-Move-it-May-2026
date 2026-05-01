import { useState } from 'react'
import { BONUS_ACTIVITIES, calcTieredPts } from '../data.js'

export default function EditEntryModal({ entry, onClose, onSave, onDelete }) {
  const [activities, setActivities] = useState(entry.activities.map((a) => ({ ...a, id: Math.random() })))
  const [bonuses, setBonuses] = useState(entry.bonuses || [])
  const [note, setNote] = useState(entry.note || '')

  function updateActivity(id, field, val) {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== id) return a
      const u = { ...a, [field]: val }
      if (field === 'duration') {
        const dur = Number(val)
        if (!a.isCustom) { u.pts = calcTieredPts(a.tierPts || a.pts, dur) }
      }
      return u
    }))
  }

  function removeActivity(id) {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  function toggleBonus(bonus) {
    setBonuses((prev) => {
      const ex = prev.find((b) => b.id === bonus.id)
      return ex ? prev.filter((b) => b.id !== bonus.id) : [...prev, { ...bonus }]
    })
  }

  const actPts = activities.reduce((s, a) => s + (a.pts || 0), 0)
  const bonusPts = bonuses.reduce((s, b) => s + b.pts, 0)
  const totalPts = actPts + bonusPts

  function handleSave() {
    onSave({
      ...entry,
      activities: activities.map((a) => ({ name: a.name, category: a.category, duration: Number(a.duration), pts: a.pts, tierPts: a.tierPts })),
      bonuses,
      totalPts,
      note
    })
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">✏️ Edit Entry — {entry.player}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--bg)', padding: '8px 12px', borderRadius: 8 }}>
            📅 {new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div>
            <div className="section-divider">Activities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {activities.map((act, idx) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-item-header">
                    <div className="activity-num">{idx + 1}</div>
                    <div className="activity-label">{act.name}</div>
                    <span className="activity-pts-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{act.pts} pts</span>
                    <button className="activity-remove" onClick={() => removeActivity(act.id)}>✕</button>
                  </div>
                  <div className="activity-row">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Duration (min)</label>
                      <input className="form-input" type="number" min="1" max="480" value={act.duration}
                        onChange={(e) => updateActivity(act.id, 'duration', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Points</label>
                      <div className="pts-calc-display">
                        {act.duration < 30 ? '⚠ Min 30 min' : `${act.pts} pts`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="section-divider">Bonus Points</div>
            <div className="bonus-grid" style={{ marginTop: 8 }}>
              {BONUS_ACTIVITIES.map((bonus) => {
                const isSel = bonuses.some((b) => b.id === bonus.id)
                return (
                  <div key={bonus.id} className={`bonus-row ${isSel ? 'selected' : ''}`} onClick={() => toggleBonus(bonus)}>
                    <div className="bonus-check">{isSel && '✓'}</div>
                    <div className="bonus-text"><div className="bonus-title">{bonus.label}</div></div>
                    <div className="bonus-pts">+{bonus.pts}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" />
          </div>
          {(actPts > 0 || bonusPts > 0) && (
            <div className="total-bar">
              <div><div className="total-bar-pts">{totalPts}</div><div className="total-bar-label">Total Points</div></div>
              <div className="total-bar-breakdown">
                <div>Activities: {actPts}</div>
                {bonusPts > 0 && <div>Bonuses: +{bonusPts}</div>}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" style={{ color: '#E03535', borderColor: '#E03535' }} onClick={() => onDelete(entry.id)}>Delete Entry</button>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 'none' }} onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
