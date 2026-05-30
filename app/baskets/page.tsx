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
      .filter((c) => c.basket === basket)
      .reduce((sum, c) => sum + c.credits, 0)
  }

  const getBasketCourses = (basket: string) => {
    return courses.filter((c) => c.basket === basket)
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
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">Basket Tracking</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {baskets.map((basket) => {
            const completed = getBasketCredits(basket)
            const required = requiredCredits[basket]
            const percent = Math.min(Math.round((completed / required) * 100), 100)
            const basketCourses = getBasketCourses(basket)

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
                <p className="text-sm text-gray-600 mb-3">{percent}% complete</p>

                {basketCourses.length > 0 ? (
                  <ul className="text-sm text-gray-700 space-y-1">
                    {basketCourses.map((course) => (
                      <li key={course.id} className="flex justify-between">
                        <span>{course.course_name}</span>
                        <span className="text-blue-600">{course.credits} credits</span>
                      </li>
                    ))}
                  </ul>
                ) : (
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