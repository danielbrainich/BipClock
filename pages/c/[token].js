import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function CountdownPage() {
  const router = useRouter()
  const { token } = router.query
  const [countdown, setCountdown] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return

    const fetchCountdown = async () => {
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .eq('token', token)
        .single()

      if (error || !data) {
        console.error('Countdown not found:', error)
        setNotFound(true)
      } else {
        setCountdown(data)
        updateTimeLeft(data.target_time)
      }
    }

    fetchCountdown()
  }, [token])

  useEffect(() => {
    if (!countdown) return

    const interval = setInterval(() => {
      updateTimeLeft(countdown.target_time)
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown])

  const updateTimeLeft = (target) => {
    const now = new Date()
    const targetTime = new Date(target)
    const diff = targetTime - now

    if (diff <= 0) {
      setTimeLeft('🎉 It’s time!')
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    setTimeLeft(
      `${days}d ${hours}h ${minutes}m ${seconds}s`
    )
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Countdown not found</h1>
          <p className="mt-2 text-gray-500">Make sure the link or passphrase is correct.</p>
        </div>
      </main>
    )
  }

  if (!countdown || timeLeft === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-white">
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4 py-12">
      <div className="max-w-lg w-full text-center bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {countdown.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {countdown.description}
        </p>

        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          {timeLeft}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Target: {new Date(countdown.target_time).toLocaleString()}
        </p>

        {countdown.repeat !== 'none' && (
          <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">
            Repeats: {countdown.repeat}
          </p>
        )}

        {countdown.remind_at !== 'none' && (
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
            Reminder: {countdown.remind_at.replaceAll('_', ' ')}
          </p>
        )}
      </div>
    </main>
  )
}
