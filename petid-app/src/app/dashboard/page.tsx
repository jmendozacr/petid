import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Pets</h1>
      <Link
        href="/dashboard/pets/new"
        className="inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
      >
        Add New Pet
      </Link>
    </div>
  )
}
