import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-4xl w-full p-8 text-center">
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1 className="text-4xl font-bold my-6">Vite + React</h1>
        <div className="card bg-white rounded-lg shadow p-6">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p className="mt-4">
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs mt-6 text-gray-500">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </main>
  )
}

export default App
