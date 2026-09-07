import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import '../../App.css'
import './SleepTracker.css'

const QUALITY_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent' }

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function avg(arr) {
  if (!arr.length) return null
  return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10
}

function Stars({ value, onChange }) {
  return (
    <div className="stars-row">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star-btn ${n <= value ? 'filled' : ''}`}
          onClick={() => onChange(n)}
          title={QUALITY_LABELS[n]}
        >
          ★
        </button>
      ))}
      {value > 0 && <span className="quality-label">{QUALITY_LABELS[value]}</span>}
    </div>
  )
}

export default function SleepTracker() {
  const [entries, setEntries] = useLocalStorage('sleep-entries', [])
  const [hours, setHours] = useState('')
  const [quality, setQuality] = useState(0)
  const [note, setNote] = useState('')

  const last7 = entries.slice(0, 7)
  const avgHours = avg(last7.map(e => e.hours))
  const avgQuality = avg(last7.map(e => e.quality))

  function addEntry(e) {
    e.preventDefault()
    const h = parseFloat(hours)
    if (!h || h <= 0 || h > 24) return
    if (!quality) return
    const entry = {
      id: Date.now(),
      hours: h,
      quality,
      note: note.trim(),
      date: new Date().toISOString(),
    }
    setEntries(prev => [entry, ...prev])
    setHours('')
    setQuality(0)
    setNote('')
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="tracker-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sleep Tracker</h2>
          <p className="page-sub">Log your nightly sleep and monitor rest patterns</p>
        </div>
      </div>

      <div className="sleep-stats-row">
        <div className="stat-card">
          <span className="stat-label">7-day avg sleep</span>
          <span className="stat-value">{avgHours !== null ? `${avgHours} hrs` : '—'}</span>
          {avgHours !== null && (
            <span className={`stat-sub ${avgHours >= 7 ? 'good' : 'warn'}`}>
              {avgHours >= 7 ? 'On target' : 'Below 7 hrs recommended'}
            </span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-label">7-day avg quality</span>
          <span className="stat-value">
            {avgQuality !== null ? (
              <>{avgQuality} <span className="stat-stars">{'★'.repeat(Math.round(avgQuality))}{'☆'.repeat(5 - Math.round(avgQuality))}</span></>
            ) : '—'}
          </span>
          {avgQuality !== null && <span className="stat-sub">{QUALITY_LABELS[Math.round(avgQuality)]}</span>}
        </div>
        <div className="stat-card">
          <span className="stat-label">Total entries</span>
          <span className="stat-value">{entries.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Log sleep</h3>
        <form onSubmit={addEntry} className="add-form add-form-col">
          <div className="add-form-row">
            <div className="hours-field">
              <input
                type="number"
                value={hours}
                onChange={e => setHours(e.target.value)}
                placeholder="Hours slept"
                className="form-input"
                step="0.5"
                min="0.5"
                max="24"
              />
              <span className="hours-label">hrs</span>
            </div>
          </div>
          <div className="quality-field">
            <span className="quality-prompt">Sleep quality</span>
            <Stars value={quality} onChange={setQuality} />
          </div>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note (e.g. woke up twice)"
            className="form-input form-input-full"
            maxLength={100}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={!hours || !quality}
          >
            Log sleep
          </button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">History</h3>
        {entries.length === 0 ? (
          <p className="empty-state">No entries yet — log your first night above.</p>
        ) : (
          <ul className="sleep-list">
            {entries.map(e => (
              <li key={e.id} className="sleep-item">
                <div className="sleep-item-date">{formatDate(e.date)}</div>
                <div className="sleep-item-hours">
                  <span className="moon-icon">🌙</span>
                  <strong>{e.hours} hrs</strong>
                </div>
                <div className="sleep-item-quality">
                  <span className="stars-display">
                    {'★'.repeat(e.quality)}{'☆'.repeat(5 - e.quality)}
                  </span>
                  <span className="quality-chip" data-q={e.quality}>{QUALITY_LABELS[e.quality]}</span>
                </div>
                {e.note && <div className="sleep-item-note">{e.note}</div>}
                <button className="remove-btn" onClick={() => removeEntry(e.id)} title="Remove">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
