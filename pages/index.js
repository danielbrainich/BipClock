import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import CountdownTile from '../components/CountdownTile'
import CreateCountdownModal from '../components/CreateCountdownModal'


export default function Home() {
  const [countdowns, setCountdowns] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchCountdowns = async () => {
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching countdowns:', error)
      } else {
        setCountdowns(data)
      }

      setLoading(false)
    }

    fetchCountdowns()
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          BipClock
        </h1>
        {/* CREATE BUTTON (we'll hook this up in step 2) */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => setShowModal(true)}
        >
          + New Countdown
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      ) : countdowns.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No countdowns yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {countdowns.map((cd) => (
            <CountdownTile key={cd.id} countdown={cd} />
          ))}
        </div>
      )}
      {showModal && (
        <CreateCountdownModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            // Re-fetch countdowns after creation
            window.location.reload()
          }}
        />
      )}
    </main>
  )
}