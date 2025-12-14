import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur sticky top-0 z-20 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">Playzoid</Link>
        <nav className="space-x-3">
          <Link to="/" className="text-sm text-gray-700 hover:underline">Games</Link>
          <Link to="/about" className="text-sm text-gray-700 hover:underline">About</Link>
        </nav>
      </div>
    </header>
  )
}
