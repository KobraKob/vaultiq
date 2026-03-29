import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { supabase } from './lib/supabase'
import ChatInterface from './components/chat/ChatInterface'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './pages/Auth'
import { LogOut, Shield, MessageSquare, Lock } from 'lucide-react'
import './App.css'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase())

function NavBar({ session, isDemoMode, onLogout }: { session: any; isDemoMode: boolean; onLogout: () => void }) {
  const userEmail = session?.user?.email || (isDemoMode ? 'demo@nexora.com' : '')
  const isAdmin = isDemoMode || ADMIN_EMAILS.includes(userEmail.toLowerCase())

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">VAULTIQ</span>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <MessageSquare className="w-4 h-4" />
                Chat
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Lock className="w-4 h-4" />
                  Admin
                </NavLink>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-500 font-medium">
              {userEmail}
            </span>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function ProtectedAdmin({ session, isDemoMode, children }: { session: any; isDemoMode: boolean; children: React.ReactNode }) {
  const userEmail = session?.user?.email || (isDemoMode ? 'demo@nexora.com' : '')
  const isAdmin = isDemoMode || ADMIN_EMAILS.includes(userEmail.toLowerCase())

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-slate-400 text-sm">
            You don't have admin privileges. Contact your administrator to get access.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  if (loading && !isDemoMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
          <span className="text-slate-400 text-sm font-medium">Loading VAULTIQ...</span>
        </div>
      </div>
    )
  }

  if (!session && !isDemoMode) {
    return <Auth onLogin={() => setSession({ user: { email: 'demo@nexora.com' } })} />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <NavBar session={session} isDemoMode={isDemoMode} onLogout={handleLogout} />
        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<ChatInterface />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdmin session={session} isDemoMode={isDemoMode}>
                  <AdminDashboard />
                </ProtectedAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
