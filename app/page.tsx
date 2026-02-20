'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Default credentials (temporary)
  const DEFAULT_USERNAME = 'admin'
  const DEFAULT_PASSWORD = 'admin123'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      // Store login state in localStorage (temporary, no backend)
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('adminUser', username)
      router.push('/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  useEffect(() => {
    // Check if already logged in
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (isAuthenticated === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700 mb-2">Lakbay CamSur</h1>
          <p className="text-gray-600">Admin Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">Default Credentials (Temporary):</p>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>admin123</strong></p>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}
