import { useEffect, useState } from 'react'
import Link from 'next/link'
import CreateWalletModal from '../components/CreateWalletModal'
import ImportWalletModal from '../components/ImportWalletModal'

export default function Home() {
  const [walletId, setWalletId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    const id = typeof window !== 'undefined' ? localStorage.getItem('wallet_id') : null
    if (id) setWalletId(id)
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-6">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BipClock</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Accounts without accounts. Create a wallet for your countdowns and share individual links.
        </p>

        {walletId ? (
          <div className="mt-8 space-y-3">
            <Link
              href={`/w/${walletId}`}
              className="block w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Open My Wallet ({walletId})
            </Link>

            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Create New Wallet
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Import Wallet
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            <button
              onClick={() => setShowCreate(true)}
              className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
              Create Wallet
            </button>

            <button
              onClick={() => setShowImport(true)}
              className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Import Wallet
            </button>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Tip: bookmark your wallet URL for quick access.
        </p>
      </div>

      {showCreate && <CreateWalletModal onClose={() => setShowCreate(false)} />}
      {showImport && <ImportWalletModal onClose={() => setShowImport(false)} />}
    </main>
  )
}
