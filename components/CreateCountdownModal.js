import { useState } from 'react'
import { X } from 'lucide-react'
import { generateToken } from '../lib/generateToken'
import { supabase } from '../lib/supabase'

export default function CreateCountdownModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#4f46e5')
  const [targetTime, setTargetTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const token = generateToken()

    const { error } = await supabase.from('countdowns').insert([
      {
        title,
        description,
        color,
        target_time: new Date(targetTime).toISOString(),
        token,
      },
    ])

    setSubmitting(false)

    if (error) {
      console.error('Error creating countdown:', error)
    } else {
      onCreated()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg mx-4 rounded-lg shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Create Countdown</h2>

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

          <div className="flex items-center space-x-4">
            <label className="text-gray-800 dark:text-white">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 border rounded"
              title="Pick a color"
            />
          </div>

          <input
            type="datetime-local"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {submitting ? 'Creating...' : 'Create Countdown'}
          </button>
        </form>
      </div>
    </div>
  )
}
