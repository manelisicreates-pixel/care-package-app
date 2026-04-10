import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
        Build Your Own Care Package
      </h1>
      <p className="text-lg text-center text-gray-600 max-w-2xl mb-8">
        Create a thoughtful gift box by choosing items from different categories
        like journals, bible study guides, makeup kits, alcohol, snacks, and more.
      </p>

      <Link
        to="/build-box"
        className="bg-black text-white px-6 py-3 rounded-xl text-lg hover:opacity-90"
      >
        Start Building
      </Link>
    </div>
  )
}

export default Home