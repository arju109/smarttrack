'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-500">Loading...</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gray-50">
      
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 mb-1">Credits Completed</h3>
            <p className="text-4xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 mb-1">Credits Remaining</h3>
            <p className="text-4xl font-bold text-orange-500">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 mb-1">Current Semester</h3>
            <p className="text-4xl font-bold text-green-600">1</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/courses" className="bg-blue-50 p-4 rounded-lg text-center hover:bg-blue-100">
              <p className="font-semibold text-blue-700">My Courses</p>
            </a>
            <a href="/baskets" className="bg-green-50 p-4 rounded-lg text-center hover:bg-green-100">
              <p className="font-semibold text-green-700">Baskets</p>
            </a>
            <a href="/planner" className="bg-orange-50 p-4 rounded-lg text-center hover:bg-orange-100">
              <p className="font-semibold text-orange-700">Planner</p>
            </a>
            <a href="/history" className="bg-purple-50 p-4 rounded-lg text-center hover:bg-purple-100">
              <p className="font-semibold text-purple-700">History</p>
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}