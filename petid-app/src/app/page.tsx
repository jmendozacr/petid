import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">PetID</h1>
        <p className="text-gray-600 mb-8">
          Digital identity and health record for your pets
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-2 border border-black rounded-md hover:bg-gray-100"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
