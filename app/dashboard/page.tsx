'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [completedCredits, setCompletedCredits] = useState(0)
  const [currentSemester, setCurrentSemester] = useState(1)
  const [basketData, setBasketData] = useState<any[]>([])
  const [semesterData, setSemesterData] = useState<any[]>([])
  const router = useRouter()

  const TOTAL_CREDITS_REQUIRED = 160

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchStats(session.user.id)
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  const fetchStats = async (userId: string) => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)

    if (data) {
      const completed = data.reduce((sum, c) => sum + c.credits, 0)
      const maxSemester = data.length > 0 ? Math.max(...data.map((c) => c.semester)) : 1
      setCompletedCredits(completed)
      setCurrentSemester(maxSemester)

      const baskets = ['Core', 'Elective', 'Lab', 'Humanities', 'Other']
      const bData = baskets.map((basket) => ({
        name: basket,
        credits: data.filter((c) => c.basket === basket).reduce((sum, c) => sum + c.credits, 0)
      })).filter((b) => b.credits > 0)
      setBasketData(bData)

      const semesters = [...new Set(data.map((c) => c.semester))].sort()
      const sData = semesters.map((sem) => ({
        name: `Sem ${sem}`,
        credits: data.filter((c) => c.semester === sem).reduce((sum, c) => sum + c.credits, 0)
      }))
      setSemesterData(sData)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="p-8">Loading...</p>

  const remainingCredits = TOTAL_CREDITS_REQUIRED - completedCredits
  const progressPercent = Math.round((completedCredits / TOTAL_CREDITS_REQUIRED) * 100)

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex items-center gap-4">
          <a href="/courses" className="text-blue-600 hover:underline">Courses</a>
          <a href="/baskets" className="text-blue-600 hover:underline">Baskets</a>
          <a href="/planner" className="text-blue-600 hover:underline">Planner</a>
          <a href="/history" className="text-blue-600 hover:underline">History</a>
          <a href="/calendar" className="text-blue-600 hover:underline">Calendar</a>
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
            <p className="text-4xl font-bold text-blue-600">{completedCredits}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 mb-1">Credits Remaining</h3>
            <p className="text-4xl font-bold text-orange-500">{remainingCredits}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-gray-500 mb-1">Current Semester</h3>
            <p className="text-4xl font-bold text-green-600">{currentSemester}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-8">
          <h3 className="text-xl font-bold mb-4">Graduation Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-blue-600 h-6 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="mt-2 text-gray-600">
            {progressPercent}% complete — {completedCredits} of {TOTAL_CREDITS_REQUIRED} credits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-4">Credits by Basket</h3>
            {basketData.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No courses added yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={basketData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="credits"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {basketData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-bold mb-4">Credits per Semester</h3>
            {semesterData.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No courses added yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={semesterData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="credits" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <a href="/calendar" className="bg-red-50 p-4 rounded-lg text-center hover:bg-red-100">
              <p className="font-semibold text-red-700">Calendar</p>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}