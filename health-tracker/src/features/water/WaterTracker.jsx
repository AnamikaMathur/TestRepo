import { useState } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import '../../App.css'
import './WaterTracker.css'

const UNIT_OPTIONS = [
  { value: 'ml', label: 'ml' },
  { value: 'oz', label: 'oz' },
  { value: 'glasses', label: 'glasses' },
]

const QUICK_ADD = [250, 350, 500]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function toMl(amount, unit) {
  if (unit === 'oz') return Math.round(amount * 29.574)
  if (unit === 'glasses') return Math.round(amount * 250)
  return amount
}

export default function WaterTracker() {
  const [allEntries, setAllEntries] = useLocalStorage('water-entries', {})
  const [goal, setGoal] = useLocalStorage('water-goal', 2000)
  const [amount, setAmount] = useState('')
  const [unit, setUnit] = useState('ml')
  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState('')

  const today = todayKey()
  const todayEntries = allEntries[today] ?? []
  const totalMl = todayEntries.reduce((sum, e) => sum + e.amountMl, 0)
  const pct = Math.min(100, Math.round((totalMl / goal) * 100))

  function addEntry(amt, u) {
    const amountMl = toMl(amt, u)
    const entry = {
      id: Date.now(),
      amount: amt,
      unit: u,
      amountMl,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setAllEntries(prev => ({
      ...prev,
      [today]: [entry, ...(prev[today] ?? [])],
    }))
  }

  function removeEntry(id) {
    setAllEntries(prev => ({
      ...prev,
      [today]: (prev[today] ?? []).filter(e => e.id !== id),
    }))
  }

  function handleAdd(e) {
    e.preventDefault()
    const n = parseFloat(amount)
    if (!n || n <= 0) return
    addEntry(n, unit)
    setAmount('')
  }

  function saveGoal(e) {
    e.preventDefault()
    const n = parseInt(goalDraft)
    if (n > 0) setGoal(n)
    setEditingGoal(false)
  }

  return (
    <div className="tracker-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Water Intake</h2>
          <p className="page-sub">Stay hydrated — track your daily water intake</p>
        </div>
        <div className="goal-badge">
          {editingGoal ? (
            <form onSubmit={saveGoal} className="goal-edit-form">
              <input
                autoFocus
                type="number"
                value={goalDraft}
                onChange={e => setGoalDraft(e.target.value)}
                placeholder={goal}
                className="goal-input"
              />
              <span className="goal-unit-label">ml goal</span>
              <button type="submit" className="btn-sm btn-primary">Save</button>
              <button type="button" className="btn-sm btn-ghost" onClick={() => setEditingGoal(false)}>Cancel</button>
            </form>
          ) : (
            <button className="goal-display" onClick={() => { setGoalDraft(String(goal)); setEditingGoal(true) }}>
              Goal: {goal} ml <span className="edit-hint">edit</span>
            </button>
          )}
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-stats">
          <span className="progress-current">{totalMl} ml</span>
          <span className="progress-of">/ {goal} ml today</span>
          <span className={`progress-pct ${pct >= 100 ? 'done' : ''}`}>{pct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        {pct >= 100 && <p className="goal-reached">Goal reached! Great job.</p>}
      </div>

      <div className="card">
        <h3 className="card-title">Add intake</h3>
        <div className="quick-add-row">
          {QUICK_ADD.map(q => (
            <button key={q} className="quick-btn" onClick={() => addEntry(q, 'ml')}>
              + {q} ml
            </button>
          ))}
        </div>
        <form onSubmit={handleAdd} className="add-form">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            className="form-input"
            min="1"
          />
          <select value={unit} onChange={e => setUnit(e.target.value)} className="form-select">
            {UNIT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Add</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Today&apos;s log</h3>
        {todayEntries.length === 0 ? (
          <p className="empty-state">No entries yet — add your first intake above.</p>
        ) : (
          <ul className="entry-list">
            {todayEntries.map(e => (
              <li key={e.id} className="entry-item">
                <span className="entry-icon">💧</span>
                <span className="entry-main">
                  <strong>{e.amount} {e.unit}</strong>
                  <span className="entry-sub">({e.amountMl} ml)</span>
                </span>
                <span className="entry-time">{e.time}</span>
                <button className="remove-btn" onClick={() => removeEntry(e.id)} title="Remove">×</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
