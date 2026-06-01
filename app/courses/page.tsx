'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBasket, setFilterBasket] = useState('All')
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const [form, setForm] = useState({
    course_name: '',
    course_code: '',
    credits: '',
    grade: '',
    semester: '',
    basket: 'Core'
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
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
      .order('semester', { ascending: true })
    if (data) setCourses(data)
    setLoading(false)
  }

  const filteredCourses = courses.filter((c) => {
    const matchSearch = c.course_name.toLowerCase().includes(search.toLowerCase()) ||
      c.course_code?.toLowerCase().includes(search.toLowerCase())
    const matchBasket = filterBasket === 'All' || c.basket === filterBasket
    return matchSearch && matchBasket
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingCourse) {
      const { error } = await supabase
        .from('courses')
        .update({
          course_name: form.course_name,
          course_code: form.course_code,
          credits: parseInt(form.credits),
          grade: form.grade,
          semester: parseInt(form.semester),
          basket: form.basket
        })
        .eq('id', editingCourse.id)

      if (!error) {
        setEditingCourse(null)
        setShowForm(false)
        setForm({ course_name: '', course_code: '', credits: '', grade: '', semester: '', basket: 'Core' })
        fetchCourses(user.id)
      }
    } else {
      const { error } = await supabase.from('courses').insert({
        user_id: user.id,
        course_name: form.course_name,
        course_code: form.course_code,
        credits: parseInt(form.credits),
        grade: form.grade,
        semester: parseInt(form.semester),
        basket: form.basket,
        status: 'completed'
      })
      if (!error) {
        setShowForm(false)
        setForm({ course_name: '', course_code: '', credits: '', grade: '', semester: '', basket: 'Core' })
        fetchCourses(user.id)
      }
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setForm({
      course_name: course.course_name,
      course_code: course.course_code,
      credits: course.credits.toString(),
      grade: course.grade,
      semester: course.semester.toString(),
      basket: course.basket
    })
    setShowForm(true)
  }

  const exportCSV = () => {
    const headers = ['Course Name', 'Course Code', 'Credits', 'Grade', 'Semester', 'Basket']
    const rows = courses.map((c) => [
      c.course_name,
      c.course_code,
      c.credits,
      c.grade,
      c.semester,
      c.basket
    ])
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my_courses.csv'
    a.click()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id)
    fetchCourses(user.id)
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/baskets" className="text-blue-600 hover:underline">Baskets</a>
          <a href="/planner" className="text-blue-600 hover:underline">Planner</a>
          <a href="/history" className="text-blue-600 hover:underline">History</a>
          <a href="/calendar" className="text-blue-600 hover:underline">Calendar</a>
          <a href="/mandatory" className="text-blue-600 hover:underline">Mandatory</a>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">My Courses</h2>
          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                setEditingCourse(null)
                setForm({ course_name: '', course_code: '', credits: '', grade: '', semester: '', basket: 'Core' })
                setShowForm(!showForm)
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Add Course'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="text-xl font-bold mb-4">
              {editingCourse ? 'Edit Course' : 'Add New Course'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Course Name"
                value={form.course_name}
                onChange={(e) => setForm({...form, course_name: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <input
                placeholder="Course Code (e.g. CS101)"
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
                placeholder="Grade (e.g. A, B+)"
                value={form.grade}
                onChange={(e) => setForm({...form, grade: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <input
                placeholder="Semester (e.g. 1)"
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
                className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                {editingCourse ? 'Update Course' : 'Save Course'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-4">
          <input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-3 rounded-lg flex-1"
          />
          <select
            value={filterBasket}
            onChange={(e) => setFilterBasket(e.target.value)}
            className="border p-3 rounded-lg"
          >
            <option>All</option>
            <option>Core</option>
            <option>Elective</option>
            <option>Lab</option>
            <option>Humanities</option>
            <option>Other</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="p-4 text-left">Course Name</th>
                <th className="p-4 text-left">Code</th>
                <th className="p-4 text-left">Credits</th>
                <th className="p-4 text-left">Grade</th>
                <th className="p-4 text-left">Semester</th>
                <th className="p-4 text-left">Basket</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {courses.length === 0 ? 'No courses added yet. Click "+ Add Course" to start!' : 'No courses match your search.'}
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{course.course_name}</td>
                    <td className="p-4">{course.course_code}</td>
                    <td className="p-4">{course.credits}</td>
                    <td className="p-4">{course.grade}</td>
                    <td className="p-4">{course.semester}</td>
                    <td className="p-4">{course.basket}</td>
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
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