'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Baskets() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const baskets = ['Core', 'Elective', 'Lab', 'Humanities', 'Other']
  const requiredCredits: { [key: string]: number } = {
    Core: 80,
    Elective: 30,
    Lab: 20,
    Humanities: 15,
    Other: 15
  }

  const pendingCourses: { [key: string]: string[] } = {
    Core: ['Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks'],
    Elective: ['Machine Learning', 'Computer Vision', 'Blockchain'],
    Lab: ['Physics Lab', 'Chemistry Lab', 'Electronics Lab'],
    Humanities: ['Economics', 'Philosophy', 'Sociology'],
    Other: ['Sports', 'NSS', 'Cultural Activities']
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        fetchCourses(session.user.id)
      }
    }
    checkUser()
  }, [])

  const fetchCourses = async (userId: string) => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
    if (data) setCourses(data)
    setLoading(false)
  }

  const getBasketCredits = (basket: string) => {
    return courses
      .filter((c) => c.basket === basket && c.status === 'completed')
      .reduce((sum, c) => sum + c.credits, 0)
  }

  const getCompletedCourses = (basket: string) => {
    return courses.filter((c) => c.basket === basket && c.status === 'completed')
  }

  const getPendingCourses = (basket: string) => {
    const completed = getCompletedCourses(basket).map((c) => c.course_name.toLowerCase())
    return pendingCourses[basket]?.filter(
      (p) => !completed.some((c) => c.includes(p.toLowerCase()))
    ) || []
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/courses" className="text-blue-600 hover:underline">Courses</a>
          <a href="/planner" className="text-blue-600 hover:underline">Planner</a>
          <a href="/history" className="text-blue-600 hover:underline">History</a>
          <a href="/calendar" className="text-blue-600 hover:underline">Calendar</a>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">Basket Tracking</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {baskets.map((basket) => {
            const completed = getBasketCredits(basket)
            const required = requiredCredits[basket]
            const percent = Math.min(Math.round((completed / required) * 100), 100)
            const completedCoursesList = getCompletedCourses(basket)
            const pendingList = getPendingCourses(basket)

            return (
              <div key={basket} className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{basket}</h3>
                  <span className="text-gray-500 text-sm">{completed}/{required} credits</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{percent}% complete</p>

                {completedCoursesList.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      ✅ Completed Courses:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {completedCoursesList.map((course) => (
                        <li key={course.id} className="flex justify-between">
                          <span>{course.course_name}</span>
                          <span className="text-blue-600">{course.credits} credits</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pendingList.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-orange-600 mb-2">
                      ⏳ Suggested Pending:
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {pendingList.map((course, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                          {course}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {completedCoursesList.length === 0 && pendingList.length === 0 && (
                  <p className="text-sm text-gray-400">No courses added yet</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}