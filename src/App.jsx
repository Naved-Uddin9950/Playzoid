import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import TicTacToe from './pages/games/TicTacToe'
import RockPaperScissors from './pages/games/RockPaperScissors'
import GameLoader from './pages/GameLoader'
import Snake from './pages/games/Snake'
import Memory from './pages/games/Memory'
import Game2048 from './pages/games/Game2048'
import './App.css'

function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games/tictactoe" element={<TicTacToe />} />
        <Route path="/games/rps" element={<RockPaperScissors />} />
        <Route path="/games/snake" element={<Snake />} />
        <Route path="/games/memory" element={<Memory />} />
        <Route path="/games/2048" element={<Game2048 />} />
        <Route path="/games/:id" element={<GameLoader />} />
        <Route path="/about" element={<div className="max-w-4xl mx-auto px-4 py-8">About the gaming hub</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
