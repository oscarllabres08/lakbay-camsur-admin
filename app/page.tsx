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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-white/10 text-purple-100 border border-white/20 mb-4">
            Admin Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 drop-shadow-sm">
            Lakbay Cam Sur Admin
          </h1>
          <p className="text-purple-100 text-sm">
            Secure access to manage destinations and content.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_18px_45px_rgba(15,23,42,0.45)] p-8 border border-purple-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h2>
            <p className="text-gray-500 text-sm">
              Sign in to continue to the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-sm placeholder:text-gray-400"
                placeholder="Enter username"
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white text-sm placeholder:text-gray-400"
                placeholder="Enter password"
                required
              />
              <p className="text-[11px] text-gray-400 text-right">For demo use only</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-purple-50/80 border border-purple-200/80 text-purple-900 px-4 py-3 rounded-lg text-xs">
              <p className="font-semibold mb-1">Default Credentials (Temporary)</p>
              <p>
                Username: <strong>admin</strong>
              </p>
              <p>
                Password: <strong>admin123</strong>
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 text-sm tracking-wide uppercase"
            >
              Login
            </button>
          </form>

          <p className="mt-4 text-[11px] text-center text-gray-400">
            Lakbay Cam Sur Admin Panel &mdash; internal use only
          </p>
        </div>
      </div>
    </div>
  )
}
