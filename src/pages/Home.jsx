import { useState } from 'react'
import { Link } from 'react-router-dom'
import games from '../games'

function GameCard({ g }) {
  return (
    <Link to={g.route} className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition">
      <div className="font-semibold">{g.name}</div>
      <div className="text-xs text-gray-500 mt-1">{g.tier}</div>
    </Link>
  )
}

export default function Home() {
  const [q, setQ] = useState('')
  const filtered = games.filter(g => g.name.toLowerCase().includes(q.toLowerCase()))

  const groups = filtered.reduce((acc, g) => {
    acc[g.tier] = acc[g.tier] || []
    acc[g.tier].push(g)
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-4">Free Online Games Hub</h2>
      <p className="text-gray-600 mb-6">Select a game to play — everything runs in your browser. Progress and scores are saved locally.</p>

      <div className="mb-6">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search games..." className="w-full p-2 border rounded" />
      </div>

      {Object.keys(groups).map(tier => (
        <section key={tier} className="mb-8">
          <h3 className="text-xl font-semibold mb-3">{tier}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {groups[tier].map(g => <GameCard key={g.id} g={g} />)}
          </div>
        </section>
      ))}
    </div>
  )
}
