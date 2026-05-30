import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-8">
      
      <h1 className="text-5xl font-bold text-blue-700 mb-4">
        SmartTrack
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 text-center max-w-lg">
        Track your academic progress, credits, and plan your semesters efficiently.
      </p>

      <div className="flex gap-4">
        <Link href="/login">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700">
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg hover:bg-blue-50">
            Sign Up
          </button>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-bold text-lg mb-2">Track Credits</h3>
          <p className="text-gray-500">Monitor completed and remaining credits</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-bold text-lg mb-2">Basket Analysis</h3>
          <p className="text-gray-500">See progress across all course baskets</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-bold text-lg mb-2">Plan Semesters</h3>
          <p className="text-gray-500">Organize your upcoming courses</p>
        </div>
      </div>

    </main>
  )
}