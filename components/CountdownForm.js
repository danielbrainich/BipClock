import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateToken } from '../lib/generateToken'

export default function CountdownForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('bg-blue-500')
  const [targetTime, setTargetTime] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

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

    if (error) {
      alert('Error: ' + error.message)
    } else {
      onCreate(token)
      setTitle('')
      setDescription('')
      setTargetTime('')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border p-2 rounded"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded"
        type="datetime-local"
        value={targetTime}
        onChange={e => setTargetTime(e.target.value)}
        required
      />
      <select
        className="w-full border p-2 rounded"
        value={color}
        onChange={e => setColor(e.target.value)}
      >
        <option value="bg-blue-500">Blue</option>
        <option value="bg-red-500">Red</option>
        <option value="bg-green-500">Green</option>
        <option value="bg-yellow-400">Yellow</option>
        <option value="bg-purple-600">Purple</option>
      </select>
      <button
        type="submit"
        className="bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Creating...' : 'Create Countdown'}
      </button>
    </form>
  )
}