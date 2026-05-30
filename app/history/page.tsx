'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function History() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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
      .eq('status', 'completed')
      .order('semester', { ascending: true })
    if (data) setCourses(data)
    setLoading(false)
  }

  const semesters = [...new Set(courses.map((c) => c.semester))].sort()

  const getSemesterCourses = (semester: number) => {
    return courses.filter((c) => c.semester === semester)
  }

  const getSemesterCredits = (semester: number) => {
    return courses
      .filter((c) => c.semester === semester)
      .reduce((sum, c) => sum + c.credits, 0)
  }

  const gradePoints: { [key: string]: number } = {
    'A+': 10, 'A': 10, 'A-': 9, 'B+': 8, 'B': 8,
    'B-': 7, 'C+': 7, 'C': 6, 'C-': 5, 'D': 4, 'F': 0
  }

  const getSemesterGPA = (semester: number) => {
    const semCourses = getSemesterCourses(semester)
    if (semCourses.length === 0) return 'N/A'
    const totalCredits = getSemesterCredits(semester)
    const weightedSum = semCourses.reduce((sum, c) => {
      const gp = gradePoints[c.grade] ?? 0
      return sum + gp * c.credits
    }, 0)
    return totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : 'N/A'
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/courses" className="text-blue-600 hover:underline">Courses</a>
          <a href="/baskets" className="text-blue-600 hover:underline">Baskets</a>
          <a href="/planner" className="text-blue-600 hover:underline">Planner</a>
        </div>
      </nav>

      <div className="p-8">
        <h2 className="text-3xl font-bold mb-6">Course History</h2>

        {semesters.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center text-gray-500">
            No completed courses yet. Add courses from the Courses page!
          </div>
        ) : (
          semesters.map((semester) => (
            <div key={semester} className="bg-white rounded-xl shadow mb-6 overflow-hidden">
              <div className="bg-purple-50 p-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-purple-700">
                  Semester {semester}
                </h3>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>Credits: <strong>{getSemesterCredits(semester)}</strong></span>
                  <span>GPA: <strong>{getSemesterGPA(semester)}</strong></span>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4 text-left">Course Name</th>
                    <th className="p-4 text-left">Code</th>
                    <th className="p-4 text-left">Credits</th>
                    <th className="p-4 text-left">Grade</th>
                    <th className="p-4 text-left">Basket</th>
                  </tr>
                </thead>
                <tbody>
                  {getSemesterCourses(semester).map((course) => (
                    <tr key={course.id} className="border-t hover:bg-gray-50">
                      <td className="p-4">{course.course_name}</td>
                      <td className="p-4">{course.course_code}</td>
                      <td className="p-4">{course.credits}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {course.grade}
                        </span>
                      </td>
                      <td className="p-4">{course.basket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </main>
  )
}