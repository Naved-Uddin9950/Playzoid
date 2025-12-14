import { useEffect, useState, useRef } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

function checkWinner(squares){
  for(const [a,b,c] of WIN_LINES){
    if(squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a]
  }
  if(squares.every(Boolean)) return 'draw'
  return null
}

function bestMove(squares, player){
  // simple minimax for hard AI (player is 'O' for AI)
  const opponent = player === 'X' ? 'O' : 'X'

  function minimax(board, isMax){
    const w = checkWinner(board)
    if(w === player) return 1
    if(w === opponent) return -1
    if(w === 'draw') return 0

    const moves = []
    for(let i=0;i<9;i++){
      if(!board[i]){
        board[i] = isMax ? player : opponent
        const score = minimax(board, !isMax)
        moves.push(score)
        board[i] = null
      }
    }
    return isMax ? Math.max(...moves) : Math.min(...moves)
  }

  let best = -Infinity
  let idx = null
  for(let i=0;i<9;i++){
    if(!squares[i]){
      squares[i] = player
      const score = minimax(squares, false)
      squares[i] = null
      if(score > best){ best = score; idx = i }
    }
  }
  return idx
}

export default function TicTacToe(){
  const [mode, setMode] = useState('pvp') // pvp | ai-easy | ai-hard
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')
  const [status, setStatus] = useState('')
  const [streak, setStreak] = useState(storage.lsGet('tictactoe:streak', {x:0,o:0}))
  const containerRef = useRef(null)

  useEffect(()=>{
    const w = checkWinner(squares)
    if(w){
      if(w === 'draw') setStatus('Draw')
      else setStatus(`${w} wins`)
      // update streaks only for player when applicable
      if(mode !== 'pvp'){
        if(w === 'X') { setStreak(s => { const ns = {...s, x: s.x+1}; storage.lsSet('tictactoe:streak', ns); return ns }) }
        if(w === 'O') { setStreak(s => { const ns = {...s, o: s.o+1}; storage.lsSet('tictactoe:streak', ns); return ns }) }
      }
    } else {
      setStatus(`Turn: ${turn}`)
    }
  }, [squares])

  useEffect(()=>{
    // AI move when mode is ai-* and it's O's turn (AI is O)
    if(mode.startsWith('ai') && turn === 'O' && !checkWinner(squares)){
      const ai = async () => {
        await new Promise(r => setTimeout(r, 250))
        let idx
        if(mode === 'ai-easy'){
          const empties = squares.map((v,i)=>v?null:i).filter(Boolean)
          idx = empties[Math.floor(Math.random()*empties.length)]
        } else {
          idx = bestMove(squares.slice(), 'O')
        }
        if(idx !== null && !squares[idx]) handleClick(idx)
      }
      ai()
    }
  }, [turn, mode, squares])

  function handleClick(i){
    if(squares[i] || checkWinner(squares)) return
    const next = squares.slice();
    next[i] = turn
    setSquares(next)
    setTurn(t => t === 'X' ? 'O' : 'X')
  }

  function reset(){
    setSquares(Array(9).fill(null));
    setTurn('X');
    setStatus('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <h2 className="text-2xl font-bold mb-4">Tic Tac Toe</h2>
      <div className="mb-4 flex gap-2">
        <button className={`px-3 py-1 rounded ${mode==='pvp'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>{setMode('pvp'); reset()}}>Player vs Player</button>
        <button className={`px-3 py-1 rounded ${mode==='ai-easy'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>{setMode('ai-easy'); reset()}}>Player vs AI (Easy)</button>
        <button className={`px-3 py-1 rounded ${mode==='ai-hard'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>{setMode('ai-hard'); reset()}}>Player vs AI (Hard)</button>
        <div className="ml-auto">
          <FullscreenButton targetRef={containerRef} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 w-64 sm:w-80 md:w-96 mx-auto">
        {squares.map((s,i)=> (
          <button key={i} onClick={()=>handleClick(i)} className="aspect-square bg-white rounded shadow flex items-center justify-center text-2xl font-bold">{s}</button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <div className="mb-2">{status}</div>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={reset}>Reset</button>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold">Win Streaks</h3>
        <div className="flex gap-4 mt-2">
          <div>X: {streak?.x ?? 0}</div>
          <div>O: {streak?.o ?? 0}</div>
          <button className="ml-auto px-2 py-1 bg-red-100 rounded" onClick={()=>{storage.lsSet('tictactoe:streak', {x:0,o:0}); setStreak({x:0,o:0})}}>Clear</button>
        </div>
      </div>
    </div>
  )
}
