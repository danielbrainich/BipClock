import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function CountdownViewer() {
  const router = useRouter()
  const { token } = router.query

  const [countdown, setCountdown] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) return

    async function fetchCountdown() {
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .eq('token', token)
        .single()

      if (error || !data) {
        setError('Countdown not found.')
      } else {
        setCountdown(data)
      }
    }

    fetchCountdown()
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!countdown) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading countdown...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center text-white ${countdown.color || 'bg-black'} p-6`}>
      <h1 className="text-4xl font-bold mb-4 text-center">{countdown.title}</h1>
      {countdown.description && (
        <p className="text-lg mb-6 text-center opacity-90">{countdown.description}</p>
      )}
      <CountdownTimer targetTime={countdown.target_time} />
    </div>
  )
}

function CountdownTimer({ targetTime }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    function update() {
      const now = new Date()
      const target = new Date(targetTime)
      const diff = target - now

      if (diff <= 0) {
        setRemaining('Time’s up!')
        return
      }

      const seconds = Math.floor((diff / 1000) % 60)
      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      setRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  return (
    <div className="text-3xl font-mono bg-white/20 px-6 py-3 rounded shadow">
      {remaining}
    </div>
  )
}
