import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateToken } from '../lib/generateToken'

export default function CreateCountdownModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [repeat, setRepeat] = useState('none')
  const [remindAt, setRemindAt] = useState('none')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = generateToken(3)
      const dateTime = allDay
        ? new Date(`${date}T00:00:00Z`)
        : new Date(`${date}T${time}:00Z`)

      const { error } = await supabase.from('countdowns').insert([
        {
          title,
          description,
          target_time: dateTime.toISOString(),
          all_day: allDay,
          repeat,
          remind_at: remindAt,
          token,
        },
      ])

      if (error) throw error
      onCreated(token)
    } catch (err) {
      alert('Failed to create countdown')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md relative shadow-lg">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-black dark:hover:text-white"
          onClick={onClose}
        >
          <X />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          New Countdown
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              All Day
            </label>
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
                className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required={!allDay}
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Repeat
            </label>
            <select
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
              value={repeat}
              onChange={(e) => setRepeat(e.target.value)}
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
              className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white"
              value={remindAt}
              onChange={(e) => setRemindAt(e.target.value)}
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
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Countdown'}
          </button>
        </form>
      </div>
    </div>
  )
}
