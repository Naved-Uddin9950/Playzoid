import { useParams } from 'react-router-dom'
import TicTacToe from './games/TicTacToe'
import RockPaperScissors from './games/RockPaperScissors'
import games from '../games'

export default function GameLoader(){
  const { id } = useParams()
  const game = games.find(g => g.id === id)
  if(!game) return <div className="max-w-4xl mx-auto px-4 py-8">Unknown game</div>

  if(id === 'tictactoe') return <TicTacToe />
  if(id === 'rps') return <RockPaperScissors />

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">{game.name}</h2>
      <p className="mb-4">This game is scaffolded and will be implemented soon. Score history and basic settings will be available here.</p>
      <div className="bg-white p-4 rounded shadow">Coming soon — placeholder page for {game.name}</div>
    </div>
  )
}
