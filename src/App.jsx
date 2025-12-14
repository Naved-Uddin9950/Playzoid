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
import Sudoku from './pages/games/Sudoku'
import WordGuess from './pages/games/WordGuess'
import Typing from './pages/games/Typing'
import MathSprint from './pages/games/MathSprint'
import WhackAMole from './pages/games/WhackAMole'
import TapCircle from './pages/games/TapCircle'
import Flappy from './pages/games/Flappy'
import EndlessRunner from './pages/games/EndlessRunner'
import Reaction from './pages/games/Reaction'
import ColorMatch from './pages/games/ColorMatch'
import MazeEscape from './pages/games/MazeEscape'
import AimTrainer from './pages/games/AimTrainer'
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
        <Route path="/games/sudoku" element={<Sudoku />} />
        <Route path="/games/word-guess" element={<WordGuess />} />
        <Route path="/games/typing" element={<Typing />} />
        <Route path="/games/math-sprint" element={<MathSprint />} />
        <Route path="/games/whack-a-mole" element={<WhackAMole />} />
        <Route path="/games/tap-circle" element={<TapCircle />} />
        <Route path="/games/flappy" element={<Flappy />} />
        <Route path="/games/endless-runner" element={<EndlessRunner />} />
        <Route path="/games/reaction" element={<Reaction />} />
        <Route path="/games/color-match" element={<ColorMatch />} />
        <Route path="/games/maze-escape" element={<MazeEscape />} />
        <Route path="/games/aim-trainer" element={<AimTrainer />} />
        <Route path="/games/:id" element={<GameLoader />} />
        <Route path="/about" element={<div className="max-w-4xl mx-auto px-4 py-8">About the gaming hub</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
