import { useState } from 'react'
import CountdownForm from '../components/CountdownForm'

export default function Home() {
  const [token, setToken] = useState(null)

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create a Countdown</h1>
      <CountdownForm onCreate={setToken} />

      {token && (
        <div className="mt-6 p-4 border rounded bg-green-100">
          <p className="font-semibold">Share this link:</p>
          <code className="block break-words text-blue-700">
            {`${typeof window !== 'undefined' ? window.location.origin : ''}/c/${token}`}
          </code>
        </div>
      )}
    </div>
  )
}