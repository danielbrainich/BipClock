import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function CountdownTile({ countdown }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const target = new Date(countdown.target_time)
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
  }, [countdown.target_time])

  return (
    <Link
      href={`/c/${countdown.token}`}
      className="block p-4 rounded-xl shadow-md hover:shadow-lg transition-all text-white"
      style={{ backgroundColor: countdown.color || '#4f46e5' }} // default indigo
    >
      <h2 className="text-xl font-bold mb-2">{countdown.title}</h2>
      <p className="text-sm opacity-90 mb-2">{countdown.description}</p>
      <div className="text-lg font-mono">{remaining}</div>
    </Link>
  )
}
