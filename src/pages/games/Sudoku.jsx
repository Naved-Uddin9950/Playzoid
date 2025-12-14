import { useEffect, useState, useRef } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

// A tiny set of sample puzzles and solutions for demo purposes
const PUZZLES = {
  easy: {
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]
    ]
  },
  medium: {
    puzzle: [
      [0,0,0,0,6,0,0,0,0],[0,0,0,1,0,4,0,0,0],[0,0,0,0,0,0,7,0,9],
      [0,0,0,0,0,0,0,4,0],[0,0,0,0,0,0,0,0,0],[0,2,0,0,0,0,0,0,0],
      [3,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]
    ],
    solution: null
  },
  hard: {
    puzzle: [
      [0,0,0,0,0,0,0,1,2],[0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],[0,0,0,5,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],[0,0,0,0,7,0,0,0,0],[0,0,0,0,0,0,0,0,0]
    ],
    solution: null
  }
}

function cloneGrid(g){ return g.map(r=>r.slice()) }

export default function Sudoku(){
  const [level, setLevel] = useState('easy')
  const [grid, setGrid] = useState(()=> cloneGrid(PUZZLES.easy.puzzle))
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [selected, setSelected] = useState([0,0])
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{
    if(running) timerRef.current = setInterval(()=>setTime(t=>t+1), 1000)
    else clearInterval(timerRef.current)
    return ()=> clearInterval(timerRef.current)
  }, [running])

  useEffect(()=>{
    setGrid(cloneGrid(PUZZLES[level].puzzle))
    setTime(0)
    setSelected([0,0])
    setRunning(false)
  }, [level])

  function setCell(r,c,val){
    const base = PUZZLES[level].puzzle
    if(base[r][c] !== 0) return
    setGrid(g => {
      const ng = cloneGrid(g)
      ng[r][c] = val
      return ng
    })
  }

  function hint(){
    const sol = PUZZLES[level].solution
    if(!sol) return
    for(let r=0;r<9;r++) for(let c=0;c<9;c++){
      if(PUZZLES[level].puzzle[r][c] === 0 && grid[r][c] !== sol[r][c]){
        setCell(r,c,sol[r][c])
        return
      }
    }
  }

  function formatTime(s){ const mm = Math.floor(s/60); const ss = String(s%60).padStart(2,'0'); return `${mm}:${ss}` }

  function saveProgress(){ storage.lsSet(`sudoku:progress:${level}`, {grid, time}) }

  function checkComplete(){
    const sol = PUZZLES[level].solution
    if(!sol) return false
    for(let r=0;r<9;r++) for(let c=0;c<9;c++) if(grid[r][c] !== sol[r][c]) return false
    return true
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Sudoku</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-3 flex gap-2 items-center">
        <button className={`px-3 py-1 rounded ${level==='easy'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('easy')}>Easy</button>
        <button className={`px-3 py-1 rounded ${level==='medium'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('medium')}>Medium</button>
        <button className={`px-3 py-1 rounded ${level==='hard'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('hard')}>Hard</button>
        <div className="ml-auto">Time: <strong>{formatTime(time)}</strong></div>
      </div>

      <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
        {grid.map((row,r)=>row.map((cell,c)=> (
          <input key={`${r}-${c}`} className={`w-full aspect-square text-center py-2 border ${PUZZLES[level].puzzle[r][c] ? 'bg-gray-100' : 'bg-white' }`} value={cell||''} onChange={e=>setCell(r,c, Number(e.target.value)||0)} />
        )))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>setRunning(r=>!r)}>{running ? 'Pause' : 'Start'}</button>
        <button className="px-3 py-1 bg-gray-200 rounded" onClick={hint}>Hint</button>
        <button className="px-3 py-1 bg-gray-200 rounded" onClick={saveProgress}>Save</button>
      </div>

      <div className="mt-4">
        {checkComplete() ? <div className="text-green-600 font-semibold">Puzzle completed! Time: {formatTime(time)}</div> : null}
      </div>
    </div>
  )
}
