import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateToken } from '../lib/generateToken'

export default function CreateCountdownModal({ onClose, onCreated, walletRow }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [repeat, setRepeat] = useState('none')
  const [remindAt, setRemindAt] = useState('none')
  const [color, setColor] = useState('#4f46e5')
  const [submitting, setSubmitting] = useState(false)

  // resolve wallet if not provided
  const [resolvedWallet, setResolvedWallet] = useState(walletRow || null)
  const [resolving, setResolving] = useState(!walletRow)

  useEffect(() => {
    if (walletRow) return
    const id = typeof window !== 'undefined' ? localStorage.getItem('wallet_id') : null
    if (!id) {
      setResolving(false)
      return
    }
    ;(async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, wallet_id')
        .eq('wallet_id', id)
        .single()
      if (!error && data) setResolvedWallet(data)
      setResolving(false)
    })()
  }, [walletRow])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!resolvedWallet) {
      alert('No wallet found. Open your wallet first or create/import one.')
      return
    }

    setSubmitting(true)
    try {
      const token = generateToken(3)
      const dateTime = allDay
        ? new Date(`${date}T00:00:00Z`)
        : new Date(`${date}T${time}:00Z`)

      const { error } = await supabase.from('countdowns').insert([{
        wallet_id: resolvedWallet.id,   // ✅ use resolved wallet
        title,
        description,
        color,
        target_time: dateTime.toISOString(),
        all_day: allDay,
        repeat,
        remind_at: remindAt,
        token,
      }])

      if (error) throw error
      onCreated?.(token)
      onClose?.()
    } catch (err) {
      console.error(err)
      alert('Failed to create countdown')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg mx-4 rounded-lg shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Create Countdown
        </h2>

        {resolving ? (
          <p className="text-gray-500">Resolving wallet…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
              required
            />

            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />

            <div className="flex items-center gap-4">
              <label className="text-gray-800 dark:text-white">Color</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700 dark:text-gray-300">All Day</label>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
            </div>

            {!allDay && (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  required={!allDay}
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Repeat
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                Remind Me
              </label>
              <select
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                <option value="none">None</option>
                <option value="at_time">At time</option>
                <option value="1_hour_before">1 hour before</option>
                <option value="1_day_before">1 day before</option>
                <option value="1_week_before">1 week before</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {submitting ? 'Creating...' : 'Create Countdown'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
