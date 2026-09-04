import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import '../../App.css'
import './WeightTracker.css'

const UNIT_OPTIONS = [
  { value: 'kg', label: 'kg' },
  { value: 'lbs', label: 'lbs' },
]

function toKg(value, unit) {
  return unit === 'lbs' ? Math.round(value * 0.453592 * 10) / 10 : value
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function WeightTracker() {
  const [entries, setEntries] = useLocalStorage('weight-entries', [])
  const [goal, setGoal] = useLocalStorage('weight-goal', null)
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState('kg')
  const [note, setNote] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState('')
  const [goalUnit, setGoalUnit] = useState('kg')

  const latest = entries[0] ?? null
  const prev = entries[1] ?? null
  const diff = latest && prev ? Math.round((latest.weightKg - prev.weightKg) * 10) / 10 : null

  function addEntry(e) {
    e.preventDefault()
    const n = parseFloat(weight)
    if (!n || n <= 0) return
    const entry = {
      id: Date.now(),
      weight: n,
      unit,
      weightKg: toKg(n, unit),
      note: note.trim(),
      date: new Date().toISOString(),
    }
    setEntries(prev => [entry, ...prev])
    setWeight('')
    setNote('')
  }

  function removeEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function saveGoal(e) {
    e.preventDefault()
    const n = parseFloat(goalDraft)
    if (n > 0) setGoal({ value: n, unit: goalUnit, valueKg: toKg(n, goalUnit) })
    setEditingGoal(false)
  }

  const goalDiff = goal && latest ? Math.round((latest.weightKg - goal.valueKg) * 10) / 10 : null

  return (
    <div className="tracker-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Weight Tracker</h2>
          <p className="page-sub">Log your weight and monitor your progress over time</p>
        </div>
        <div className="goal-badge">
          {editingGoal ? (
            <form onSubmit={saveGoal} className="goal-edit-form">
              <input
                autoFocus
                type="number"
                value={goalDraft}
                onChange={e => setGoalDraft(e.target.value)}
                placeholder="Goal weight"
                className="goal-input"
              />
              <select value={goalUnit} onChange={e => setGoalUnit(e.target.value)} className="form-select-sm">
                {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button type="submit" className="btn-sm btn-primary">Save</button>
              <button type="button" className="btn-sm btn-ghost" onClick={() => setEditingGoal(false)}>Cancel</button>
            </form>
          ) : (
            <button className="goal-display" onClick={() => { setGoalDraft(goal ? String(goal.value) : ''); setGoalUnit(goal?.unit ?? 'kg'); setEditingGoal(true) }}>
              {goal ? `Goal: ${goal.value} ${goal.unit}` : 'Set goal'} <span className="edit-hint">{goal ? 'edit' : '+'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="weight-stats-row">
        <div className="stat-card">
          <span className="stat-label">Current weight</span>
          <span className="stat-value">
            {latest ? `${latest.weight} ${latest.unit}` : '—'}
          </span>
          {diff !== null && (
            <span className={`stat-delta ${diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'}`}>
              {diff > 0 ? `+${diff}` : diff} kg vs last
            </span>
          )}
        </div>
        <div className="stat-card">
          <span className="stat-label">Goal progress</span>
          <span className="stat-value">
            {goalDiff !== null ? (
              goalDiff === 0 ? 'At goal!' : `${goalDiff > 0 ? '+' : ''}${goalDiff} kg to go`
            ) : '—'}
          </span>
          {goal && <span className="stat-sub">Target: {goal.value} {goal.unit}</span>}
        </div>
        <div className="stat-card">
          <span className="stat-label">Total entries</span>
          <span className="stat-value">{entries.length}</span>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">Log weight</h3>
        <form onSubmit={addEntry} className="add-form add-form-col">
          <div className="add-form-row">
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="Weight"
              className="form-input"
              step="0.1"
              min="1"
            />
            <select value={unit} onChange={e => setUnit(e.target.value)} className="form-select">
              {UNIT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note (e.g. after workout)"
            className="form-input form-input-full"
            maxLength={100}
          />
          <button type="submit" className="btn-primary">Log weight</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">History</h3>
        {entries.length === 0 ? (
          <p className="empty-state">No entries yet — log your first weight above.</p>
        ) : (
          <table className="weight-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Change</th>
                <th>Note</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => {
                const prevEntry = entries[i + 1]
                const change = prevEntry ? Math.round((e.weightKg - prevEntry.weightKg) * 10) / 10 : null
                return (
                  <tr key={e.id}>
                    <td className="table-date">{formatDate(e.date)}</td>
                    <td className="table-weight"><strong>{e.weight} {e.unit}</strong></td>
                    <td>
                      {change !== null ? (
                        <span className={`delta-chip ${change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}`}>
                          {change > 0 ? `+${change}` : change} kg
                        </span>
                      ) : <span className="text-muted">—</span>}
                    </td>
                    <td className="table-note">{e.note || <span className="text-muted">—</span>}</td>
                    <td>
                      <button className="remove-btn" onClick={() => removeEntry(e.id)} title="Remove">×</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
