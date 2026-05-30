'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Planner() {
  const [user, setUser] = useState<any>(null)
  const [plannedCourses, setPlannedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    course_name: '',
    course_code: '',
    credits: '',
    basket: 'Core',
    semester: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchPlanned(session.user.id)
      }
    }
    checkUser()
  }, [])

  const fetchPlanned = async (userId: string) => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'planned')
      .order('semester', { ascending: true })
    if (data) setPlannedCourses(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('courses').insert({
      user_id: user.id,
      course_name: form.course_name,
      course_code: form.course_code,
      credits: parseInt(form.credits),
      basket: form.basket,
      semester: parseInt(form.semester),
      status: 'planned'
    })
    if (!error) {
      setShowForm(false)
      setForm({ course_name: '', course_code: '', credits: '', basket: 'Core', semester: '' })
      fetchPlanned(user.id)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id)
    fetchPlanned(user.id)
  }

  const totalPlannedCredits = plannedCourses.reduce((sum, c) => sum + c.credits, 0)

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/courses" className="text-blue-600 hover:underline">Courses</a>
          <a href="/baskets" className="text-blue-600 hover:underline">Baskets</a>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Semester Planner</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Plan Course'}
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <p className="text-lg">
            Total Planned Credits: 
            <span className="font-bold text-blue-600 ml-2">{totalPlannedCredits}</span>
            {totalPlannedCredits > 25 && (
              <span className="text-red-500 ml-2">⚠️ Exceeds recommended limit of 25!</span>
            )}
            {totalPlannedCredits <= 25 && totalPlannedCredits > 0 && (
              <span className="text-green-500 ml-2">✅ Within limit</span>
            )}
          </p>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="text-xl font-bold mb-4">Plan New Course</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Course Name"
                value={form.course_name}
                onChange={(e) => setForm({...form, course_name: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <input
                placeholder="Course Code"
                value={form.course_code}
                onChange={(e) => setForm({...form, course_code: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                placeholder="Credits"
                type="number"
                value={form.credits}
                onChange={(e) => setForm({...form, credits: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <input
                placeholder="Semester (e.g. 3)"
                type="number"
                value={form.semester}
                onChange={(e) => setForm({...form, semester: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <select
                value={form.basket}
                onChange={(e) => setForm({...form, basket: e.target.value})}
                className="border p-3 rounded-lg"
              >
                <option>Core</option>
                <option>Elective</option>
                <option>Lab</option>
                <option>Humanities</option>
                <option>Other</option>
              </select>
              <button
                type="submit"
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Add to Plan
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="p-4 text-left">Course Name</th>
                <th className="p-4 text-left">Code</th>
                <th className="p-4 text-left">Credits</th>
                <th className="p-4 text-left">Basket</th>
                <th className="p-4 text-left">Semester</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {plannedCourses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No planned courses yet. Click "+ Plan Course" to start!
                  </td>
                </tr>
              ) : (
                plannedCourses.map((course) => (
                  <tr key={course.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{course.course_name}</td>
                    <td className="p-4">{course.course_code}</td>
                    <td className="p-4">{course.credits}</td>
                    <td className="p-4">{course.basket}</td>
                    <td className="p-4">{course.semester}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}