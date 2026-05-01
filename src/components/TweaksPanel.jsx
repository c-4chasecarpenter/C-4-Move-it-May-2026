export default function TweaksPanel({ tweaks, setTweak, onClose }) {
  return (
    <div className="tweaks-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div className="tweaks-title">⚙️ Tweaks</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, padding: '2px 4px', borderRadius: 6 }}>✕</button>
      </div>

      <div className="tweaks-row">
        <div className="tweaks-label">Calendar Size</div>
        <select className="tweaks-select" value={tweaks.calSize} onChange={e => setTweak('calSize', e.target.value)}>
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="tweaks-row">
        <div className="tweaks-toggle-row">
          <div className="tweaks-label" style={{ marginBottom: 0 }}>Show Pts on Days</div>
          <label className="tweaks-toggle">
            <input type="checkbox" checked={tweaks.showDayPts} onChange={e => setTweak('showDayPts', e.target.checked)} />
            <span className="tweaks-slider"></span>
          </label>
        </div>
      </div>

      <div className="tweaks-row">
        <div className="tweaks-toggle-row">
          <div className="tweaks-label" style={{ marginBottom: 0 }}>Heatmap Colors</div>
          <label className="tweaks-toggle">
            <input type="checkbox" checked={tweaks.heatmap} onChange={e => setTweak('heatmap', e.target.checked)} />
            <span className="tweaks-slider"></span>
          </label>
        </div>
      </div>

      <div className="tweaks-row">
        <div className="tweaks-label">Cards per Row</div>
        <select className="tweaks-select" value={tweaks.cardsPerRow} onChange={e => setTweak('cardsPerRow', e.target.value)}>
          <option value="auto">Auto</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <div className="tweaks-row">
        <div className="tweaks-toggle-row">
          <div className="tweaks-label" style={{ marginBottom: 0 }}>Show Streak Badge</div>
          <label className="tweaks-toggle">
            <input type="checkbox" checked={tweaks.showStreak} onChange={e => setTweak('showStreak', e.target.checked)} />
            <span className="tweaks-slider"></span>
          </label>
        </div>
      </div>
    </div>
  )
}
