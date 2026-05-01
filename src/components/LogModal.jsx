import { useState, useMemo, useRef } from 'react'
import { TEAMS_DATA, ACTIVITIES, BONUS_ACTIVITIES, getPlayerTeam, getWeekNum, initials, todayStr, calcTieredPts } from '../data.js'

export default function LogModal({ onClose, onSave, defaultPlayer, allEntries }) {
  const allPlayersList = useMemo(() =>
    Object.values(TEAMS_DATA).flatMap((t) => t.players.map((p) => ({ name: p, team: getPlayerTeam(p) })))
      .sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const [search, setSearch] = useState(defaultPlayer || '')
  const [selectedPlayer, setSelectedPlayer] = useState(defaultPlayer || '')
  const [date, setDate] = useState(todayStr())
  const [showSearch, setShowSearch] = useState(!defaultPlayer)
  const [activities, setActivities] = useState([])
  const [bonuses, setBonuses] = useState([])
  const [note, setNote] = useState('')
  const [attachments, setAttachments] = useState([])
  const [links, setLinks] = useState([''])
  const fileInputRef = useRef()

  const filteredPlayers = useMemo(() => {
    if (!search || search === selectedPlayer) return []
    return allPlayersList.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
  }, [search, selectedPlayer, allPlayersList])

  function isSleepBonusUsedThisWeek() {
    if (!selectedPlayer || !date) return false
    const targetWeek = getWeekNum(date)
    return allEntries.some((e) =>
      e.player === selectedPlayer &&
      e.bonuses && e.bonuses.some((b) => b.id === 'sleep7') &&
      getWeekNum(e.date) === targetWeek
    )
  }

  function addActivity(name, tier, tierPts) {
    setActivities((prev) => [...prev, { id: Date.now(), name, tier, tierPts, duration: 30, category: tier, pts: tierPts, isCustom: false }])
  }

  function addCustomActivity() {
    setActivities((prev) => [...prev, { id: Date.now(), name: '', tier: 'Custom', tierPts: 0, duration: 30, category: 'Custom', pts: 0, isCustom: true, customPts: 0 }])
  }

  function updateActivity(id, field, val) {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== id) return a
      const u = { ...a, [field]: val }
      if (field === 'duration') {
        const dur = Number(val)
        if (!a.isCustom) { u.pts = calcTieredPts(a.tierPts, dur) }
      }
      if (field === 'customPts') { u.pts = Number(val) }
      return u
    }))
  }

  function removeActivity(id) {
    setActivities((prev) => prev.filter((a) => a.id !== id))
  }

  function toggleBonus(bonus) {
    if (bonus.id === 'sleep7' && isSleepBonusUsedThisWeek()) return
    setBonuses((prev) => {
      const ex = prev.find((b) => b.id === bonus.id)
      return ex ? prev.filter((b) => b.id !== bonus.id) : [...prev, { ...bonus }]
    })
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files)
    const newFiles = files.map((f) => ({ name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }))
    setAttachments((prev) => [...prev, ...newFiles])
  }

  function removeAttachment(idx) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const actPts = activities.reduce((s, a) => s + (a.pts || 0), 0)
  const bonusPts = bonuses.reduce((s, b) => s + b.pts, 0)
  const totalPts = actPts + bonusPts

  function handleSave() {
    if (!selectedPlayer || activities.length === 0) return
    const cleanLinks = links.filter((l) => l.trim())
    onSave({
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      player: selectedPlayer,
      team: getPlayerTeam(selectedPlayer),
      date,
      activities: activities.map((a) => ({
        name: a.isCustom ? a.name || 'Custom Activity' : a.name,
        category: a.category, duration: Number(a.duration), pts: a.pts, tierPts: a.tierPts
      })),
      bonuses: bonuses.map((b) => ({ id: b.id, label: b.label, pts: b.pts })),
      totalPts, note,
      attachments: attachments.map((f) => ({ name: f.name, type: f.type })),
      links: cleanLinks,
      loggedAt: Date.now()
    })
  }

  const canSave = selectedPlayer && activities.length > 0
  const sleepUsed = isSleepBonusUsedThisWeek()

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">📝 Log Points</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* Player */}
          <div className="form-group">
            <label className="form-label">Player Name</label>
            <input className="form-input" placeholder="Search your name…" value={search} autoFocus
              onChange={(e) => { setSearch(e.target.value); setSelectedPlayer(''); setShowSearch(true) }} />
            {filteredPlayers.length > 0 && showSearch && (
              <div className="search-results">
                {filteredPlayers.map((p) => (
                  <div key={p.name} className="search-result-item" onClick={() => { setSelectedPlayer(p.name); setSearch(p.name); setShowSearch(false) }}>
                    <div style={{ width: 28, height: 28, fontSize: 11, background: TEAMS_DATA[p.team]?.color || '#888', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>{initials(p.name)}</div>
                    <span>{p.name}</span>
                    <span className="search-result-team">{p.team}</span>
                  </div>
                ))}
              </div>
            )}
            {selectedPlayer && <div style={{ fontSize: 12, color: '#2DA84A', fontWeight: 600, marginTop: 2 }}>✓ {selectedPlayer} · {getPlayerTeam(selectedPlayer)}</div>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} min="2026-05-01" max="2026-05-31" onChange={(e) => setDate(e.target.value)} />
          </div>

          {/* Activities */}
          <div>
            <div className="section-divider">Activities</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {activities.map((act, idx) => (
                <div key={act.id} className="activity-item">
                  <div className="activity-item-header">
                    <div className="activity-num">{idx + 1}</div>
                    <div className="activity-label">{act.isCustom ? 'Custom Activity' : act.name}</div>
                    {act.pts > 0 && (
                      <span className="activity-pts-badge" style={{
                        background: act.tierPts === 5 ? '#FDEAEA' : act.tierPts === 3 ? '#FEF3E6' : act.tier === 'Custom' ? '#F4ECFB' : '#EAFAF0',
                        color: act.tierPts === 5 ? '#E03535' : act.tierPts === 3 ? '#F07B00' : act.tier === 'Custom' ? '#8A35CC' : '#2DA84A'
                      }}>
                        {act.pts} pts
                      </span>
                    )}
                    <button className="activity-remove" onClick={() => removeActivity(act.id)}>✕</button>
                  </div>
                  {act.isCustom && (
                    <input className="form-input" placeholder="Activity name (e.g. Hiking)" value={act.name}
                      onChange={(e) => updateActivity(act.id, 'name', e.target.value)} />
                  )}
                  <div className="activity-row">
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: 11 }}>Duration (minutes)</label>
                      <input className="form-input" type="number" min="1" max="480" value={act.duration}
                        onChange={(e) => updateActivity(act.id, 'duration', e.target.value)} />
                    </div>
                    {act.isCustom ? (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>Points to Award</label>
                        <input className="form-input" type="number" min="0" max="50" value={act.customPts || 0}
                          onChange={(e) => updateActivity(act.id, 'customPts', e.target.value)} />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: 11 }}>
                          Points <span style={{ color: 'var(--muted)', fontSize: 10 }}>(+{act.tierPts} per 30 min)</span>
                        </label>
                        <div className="pts-calc-display">
                          {Number(act.duration) < 30
                            ? '⚠ Min. 30 min'
                            : <span>{act.pts} pts <span style={{ fontSize: 11, opacity: .7 }}>({Math.floor(Number(act.duration) / 30)} × {act.tierPts})</span></span>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Activity picker */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>Add Activity:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(ACTIVITIES).map(([tier, info]) => (
                  <div key={tier}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: info.color, letterSpacing: '.5px', marginBottom: 4, textTransform: 'uppercase' }}>{tier}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {info.items.map((item) => (
                        <button key={item} onClick={() => addActivity(item, tier, info.points)}
                          style={{ background: '#F4F6FA', border: `1.5px solid ${info.color}30`, borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--text)', transition: 'all .1s' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = info.color + '18'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#F4F6FA'}>
                          {item} <span style={{ color: info.color, fontWeight: 700 }}>+{info.points}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={addCustomActivity}>+ Add Custom Activity</button>
            </div>
          </div>

          {/* Bonus */}
          <div>
            <div className="section-divider">Bonus Points</div>
            <div className="bonus-grid" style={{ marginTop: 10 }}>
              {BONUS_ACTIVITIES.map((bonus) => {
                const isSel = bonuses.some((b) => b.id === bonus.id)
                const isDisabled = bonus.id === 'sleep7' && sleepUsed && !isSel
                return (
                  <div key={bonus.id}
                    className={`bonus-row ${isSel ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => !isDisabled && toggleBonus(bonus)}>
                    <div className="bonus-check">{isSel && '✓'}</div>
                    <div className="bonus-text">
                      <div className="bonus-title">{bonus.label}</div>
                      <div className="bonus-desc">{bonus.desc}{isDisabled && <span style={{ color: '#E03535', marginLeft: 4 }}> — already claimed this week</span>}</div>
                    </div>
                    <div className="bonus-pts">+{bonus.pts}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Proof & Notes */}
          <div>
            <div className="section-divider">Proof & Notes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Notes <span>(optional)</span></label>
                <textarea className="form-textarea" placeholder="Describe your activity, how it felt, or anything else…" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Attach Files <span>(photos, screenshots)</span></label>
                <div className="file-upload-area" onClick={() => fileInputRef.current.click()}>
                  <div className="file-upload-icon">📎</div>
                  <div className="file-upload-text"><strong>Click to attach</strong> or drag & drop photos / screenshots</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>PNG, JPG, PDF up to 10MB</div>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                {attachments.length > 0 && (
                  <div className="attached-files">
                    {attachments.map((f, i) => (
                      <div key={i} className="attached-file">
                        <span>{f.type.startsWith('image') ? '🖼️' : '📄'}</span>
                        <span className="attached-file-name">{f.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{(f.size / 1024).toFixed(0)}KB</span>
                        <button className="attached-file-remove" onClick={() => removeAttachment(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Links <span>(Strava, fitness app, etc.)</span></label>
                {links.map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginTop: i > 0 ? 6 : 0 }}>
                    <input className="form-input" placeholder="https://strava.com/activities/…" value={l}
                      onChange={(e) => { const nl = [...links]; nl[i] = e.target.value; setLinks(nl) }} />
                    {i === links.length - 1 && l.trim() && (
                      <button className="btn btn-secondary" style={{ padding: '0 14px', flexShrink: 0 }} onClick={() => setLinks([...links, ''])}>+</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Total */}
          {(actPts > 0 || bonusPts > 0) && (
            <div className="total-bar">
              <div><div className="total-bar-pts">{totalPts}</div><div className="total-bar-label">Total Points</div></div>
              <div className="total-bar-breakdown">
                <div>Activities: {actPts} pts</div>
                {bonusPts > 0 && <div>Bonuses: +{bonusPts} pts</div>}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave}>
            Save {totalPts > 0 ? `${totalPts} Points` : 'Entry'}
          </button>
        </div>
      </div>
    </div>
  )
}
