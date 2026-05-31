'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Calendar() {
  const [user, setUser] = useState<any>(null)
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    date: '',
    type: 'Exam',
    description: ''
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        fetchReminders(session.user.id)
      }
    }
    checkUser()
  }, [])

  const fetchReminders = async (userId: string) => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
    if (data) setReminders(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('reminders').insert({
      user_id: user.id,
      title: form.title,
      date: form.date,
      type: form.type,
      description: form.description
    })
    if (!error) {
      setShowForm(false)
      setForm({ title: '', date: '', type: 'Exam', description: '' })
      fetchReminders(user.id)
    }
  }

  const handleDelete = async (id: string) => {
    await supabase.from('reminders').delete().eq('id', id)
    fetchReminders(user.id)
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Exam': return 'bg-red-100 text-red-700'
      case 'Assignment': return 'bg-orange-100 text-orange-700'
      case 'Quiz': return 'bg-yellow-100 text-yellow-700'
      case 'Holiday': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  const isUpcoming = (date: string) => {
    return new Date(date) >= new Date()
  }

  if (loading) return <p className="p-8">Loading...</p>

  const upcomingReminders = reminders.filter((r) => isUpcoming(r.date))
  const pastReminders = reminders.filter((r) => !isUpcoming(r.date))

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">SmartTrack</h1>
        <div className="flex gap-4">
          <a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a>
          <a href="/courses" className="text-blue-600 hover:underline">Courses</a>
          <a href="/baskets" className="text-blue-600 hover:underline">Baskets</a>
          <a href="/planner" className="text-blue-600 hover:underline">Planner</a>
          <a href="/history" className="text-blue-600 hover:underline">History</a>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Academic Calendar</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Add Reminder'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <h3 className="text-xl font-bold mb-4">Add New Reminder</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                placeholder="Title (e.g. Math Exam)"
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({...form, date: e.target.value})}
                className="border p-3 rounded-lg"
                required
              />
              <select
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
                className="border p-3 rounded-lg"
              >
                <option>Exam</option>
                <option>Assignment</option>
                <option>Quiz</option>
                <option>Holiday</option>
                <option>Other</option>
              </select>
              <input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                className="border p-3 rounded-lg"
              />
              <button
                type="submit"
                className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Save Reminder
              </button>
            </form>
          </div>
        )}

        <h3 className="text-xl font-bold mb-4 text-green-700">
          Upcoming ({upcomingReminders.length})
        </h3>

        {upcomingReminders.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow mb-6 text-center text-gray-500">
            No upcoming reminders. Add one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {upcomingReminders.map((reminder) => (
              <div key={reminder.id} className="bg-white p-5 rounded-xl shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{reminder.title}</h4>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(reminder.type)}`}>
                  {reminder.type}
                </span>
                <p className="text-gray-600 mt-2 text-sm">
                  📅 {new Date(reminder.date).toDateString()}
                </p>
                {reminder.description && (
                  <p className="text-gray-500 text-sm mt-1">{reminder.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {pastReminders.length > 0 && (
          <>
            <h3 className="text-xl font-bold mb-4 text-gray-500">
              Past ({pastReminders.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
              {pastReminders.map((reminder) => (
                <div key={reminder.id} className="bg-white p-5 rounded-xl shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{reminder.title}</h4>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(reminder.type)}`}>
                    {reminder.type}
                  </span>
                  <p className="text-gray-600 mt-2 text-sm">
                    📅 {new Date(reminder.date).toDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}