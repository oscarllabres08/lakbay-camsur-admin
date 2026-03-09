'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Handle login using Supabase `admin_users` table
  // Table structure (example):
  // - id (uuid)
  // - username (text)
  // - password (text)  // for school/demo only – in real apps use hashed passwords
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { data, error: queryError } = await supabase
        .from('admin_users')
        .select('id, username')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle()

      if (queryError) {
        console.error('Supabase admin login error:', queryError)
        setError('Unable to contact server. Please try again.')
        return
      }

      if (!data) {
        setError('Invalid username or password')
        return
      }

      // Successful login – store in sessionStorage (clears when tab closes)
      sessionStorage.setItem('isAuthenticated', 'true')
      sessionStorage.setItem('adminUser', username)
      router.push('/dashboard')
    } catch (err) {
      console.error('Unexpected login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Check if already logged in (using sessionStorage)
    const isAuthenticated = sessionStorage.getItem('isAuthenticated')
    if (isAuthenticated === 'true') {
      router.push('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
          {/* Left: Intro / Project Overview */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0A313D] via-[#0F4C5C] to-[#2EC4B6] text-white px-8 py-10 sm:px-12 sm:py-14 flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none">
              {/* Soft blobs */}
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/12 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/3 -right-24 w-80 h-80 bg-[#06B6D4]/20 rounded-full blur-3xl"></div>
              {/* Decorative streaks */}
              <div className="absolute bottom-16 left-10 h-24 w-72 rotate-[-18deg] rounded-[32px] bg-gradient-to-r from-[#FF7F50]/55 to-[#06B6D4]/55 blur-[1px] opacity-70"></div>
              <div className="absolute bottom-28 left-24 h-20 w-44 rotate-[-18deg] rounded-[28px] bg-gradient-to-r from-white/35 to-[#2EC4B6]/35 blur-[1px] opacity-60"></div>
              <div className="absolute bottom-12 left-44 h-2 w-28 rotate-[-18deg] rounded-full bg-white/45 opacity-50"></div>
            </div>

            <div className="relative w-full max-w-xl">
              <div className="flex items-center gap-6 mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-3xl shadow-xl ring-1 ring-white/20 backdrop-blur-md">
                  <span className="text-white font-extrabold text-2xl font-poppins">LC</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black tracking-widest uppercase text-white/100">Lakbay CamSur</p>
                  <p className="text-base font-semibold text-white/80">Admin Portal</p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-white font-poppins">
                Manage destinations with confidence.
              </h1>
              <p className="text-white/85 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
                This dashboard helps you maintain Lakbay CamSur content in one place—destinations, categories, and basic analytics—so the mobile app stays accurate and up to date.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-black text-white mb-2 font-poppins">Content management</p>
                  <p className="text-sm text-white/80 font-medium leading-relaxed">
                    Add, edit, and organize destination details and media for consistent public listings.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                  <p className="text-sm font-black text-white mb-2 font-poppins">Insights</p>
                  <p className="text-sm text-white/80 font-medium leading-relaxed">
                    Track views, visit intents, and confirmed visits to understand what travelers explore most.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-wider bg-white/15 text-white border border-white/20 uppercase shadow-sm backdrop-blur-md">
                  Secure access
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-bold tracking-wider bg-white/10 text-white border border-white/20 uppercase shadow-sm backdrop-blur-md">
                  Admin only
                </span>
              </div>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="relative flex items-center justify-center bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#ECFDF5] px-6 py-10 sm:px-10">
            {/* Subtle background shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2EC4B6]/18 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0F4C5C]/16 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#06B6D4]/12 rounded-full blur-3xl"></div>
            </div>

            <div className="w-full max-w-md relative">
              {/* Header Section */}
              <div className="text-center mb-10">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4] rounded-2xl shadow-xl transform hover:scale-105 transition-transform">
                    <span className="text-white font-bold text-2xl font-poppins">LC</span>
                  </div>
                  <span className="inline-flex items-center px-5 py-2 rounded-full text-xs font-bold tracking-wider bg-gradient-to-r from-[#0F4C5C]/10 to-[#2EC4B6]/10 text-[#0F4C5C] border-2 border-[#2EC4B6]/30 uppercase shadow-sm">
                    Admin Login
                  </span>
                </div>
                <h2 className="text-4xl font-black tracking-tight mb-3 text-[#0F172A] font-poppins">
                  Welcome back
                </h2>
                <p className="text-[#94A3B8] text-sm max-w-xs mx-auto">
                  Sign in to continue to the admin dashboard.
                </p>
              </div>

              {/* Login Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_-15px_rgba(15,76,92,0.4)] p-10 border-2 border-[#2EC4B6]/20 relative overflow-hidden">
                {/* Subtle gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4]"></div>

                <form onSubmit={handleLogin} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 mb-2"
              >
                <svg className="w-4 h-4 text-[#0F4C5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#2EC4B6]/50 focus:border-[#2EC4B6] outline-none transition-all duration-200 bg-white text-base placeholder:text-[#94A3B8] hover:border-[#CBD5E1] font-medium"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-2 mb-2"
              >
                <svg className="w-4 h-4 text-[#0F4C5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-[#E2E8F0] rounded-xl focus:ring-2 focus:ring-[#2EC4B6]/50 focus:border-[#2EC4B6] outline-none transition-all duration-200 bg-white text-base placeholder:text-[#94A3B8] hover:border-[#CBD5E1] font-medium"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 text-right flex items-center justify-end gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                For demo use only
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-5 py-4 rounded-xl text-sm flex items-center gap-3 fade-in shadow-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Default Credentials Box */}
            <div className="bg-gradient-to-br from-[#0F4C5C]/10 via-[#2EC4B6]/10 to-[#06B6D4]/10 border-2 border-[#2EC4B6]/30 text-[#0F4C5C] px-6 py-5 rounded-xl text-sm shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-6 h-6 text-[#0F4C5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-black mb-3 text-[#0F172A] text-base">Default Credentials (Temporary)</p>
                  <div className="space-y-2">
                    <p className="flex items-center gap-3">
                      <span className="font-bold text-[#0F4C5C]">Username:</span>
                      <code className="bg-white/90 px-3 py-1.5 rounded-lg font-mono text-[#0F172A] font-bold text-sm shadow-sm">admin</code>
                    </p>
                    <p className="flex items-center gap-3">
                      <span className="font-bold text-[#0F4C5C]">Password:</span>
                      <code className="bg-white/90 px-3 py-1.5 rounded-lg font-mono text-[#0F172A] font-bold text-sm shadow-sm">admin123</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#0F4C5C] via-[#2EC4B6] to-[#06B6D4] hover:from-[#0D3F4D] hover:via-[#25A396] hover:to-[#0891B2] disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-5 px-6 rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 text-base tracking-wide uppercase flex items-center justify-center gap-2 group font-poppins"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
                </form>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                  <p className="text-xs text-center text-[#94A3B8] flex items-center justify-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lakbay CamSur Admin Panel &mdash; internal use only
                  </p>
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}
