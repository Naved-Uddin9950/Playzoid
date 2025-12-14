import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-6">We couldn't find that page. Try going back to the games list.</p>
      <Link to="/" className="px-4 py-2 bg-indigo-600 text-white rounded">Back to Games</Link>
    </div>
  )
}
