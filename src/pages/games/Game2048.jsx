import { useEffect, useState, useRef } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'

const SIZE = 4

function emptyGrid(){
  return Array.from({length: SIZE}, ()=> Array.from({length: SIZE}, ()=>0))
}

function addRandom(grid){
  const empties = []
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]===0) empties.push([r,c])
  if(empties.length === 0) return grid
  const [r,c] = empties[Math.floor(Math.random()*empties.length)]
  const val = Math.random() < 0.9 ? 2 : 4
  const g = grid.map(row => row.slice())
  g[r][c] = val
  return g
}

function rotate(grid){
  // rotate clockwise
  const g = emptyGrid()
  for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) g[c][SIZE-1-r] = grid[r][c]
  return g
}

function swipeLeft(grid){
  // returns [newGrid, moved, scoreGain]
  let moved = false
  let gain = 0
  const g = grid.map(row => {
    const arr = row.filter(v=>v!==0)
    for(let i=0;i<arr.length-1;i++){
      if(arr[i] === arr[i+1]){ arr[i] *= 2; gain += arr[i]; arr.splice(i+1,1) }
    }
    const newRow = [...arr, ...Array(SIZE-arr.length).fill(0)]
    if(newRow.some((v,i)=>v!==row[i])) moved = true
    return newRow
  })
  return [g, moved, gain]
}

export default function Game2048(){
  const [grid, setGrid] = useState(()=> addRandom(addRandom(emptyGrid())))
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(()=> storage.lsGet('2048:high', 0))
  const [undoStack, setUndoStack] = useState([])
  const touchStartRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{
    storage.lsSet('2048:high', high)
  }, [high])

  useEffect(()=>{
    function onKey(e){
      if(e.key === 'ArrowLeft') move('left')
      if(e.key === 'ArrowRight') move('right')
      if(e.key === 'ArrowUp') move('up')
      if(e.key === 'ArrowDown') move('down')
      if(e.key === 'u') undo()
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [grid, score, undoStack])

  function move(dir){
    let g = grid.map(r=>r.slice())
    let totalGain = 0
    let moved = false
    // normalize to left
    if(dir === 'up') { g = rotate(g); }
    if(dir === 'right') { g = rotate(rotate(g)); }
    if(dir === 'down') { g = rotate(rotate(rotate(g))); }
    const [after, didMove, gain] = swipeLeft(g)
    moved = didMove
    totalGain += gain
    // rotate back
    let out = after
    if(dir === 'up') out = rotate(rotate(rotate(out)))
    if(dir === 'right') out = rotate(rotate(out))
    if(dir === 'down') out = rotate(out)

    if(moved){
      setUndoStack(s => [...s.slice(-9), {grid: grid.map(r=>r.slice()), score}])
      const withTile = addRandom(out)
      setGrid(withTile)
      setScore(s => {
        const ns = s + totalGain
        if(ns > high) setHigh(ns)
        return ns
      })
    }
  }

  function undo(){
    const last = undoStack[undoStack.length-1]
    if(!last) return
    setGrid(last.grid)
    setScore(last.score)
    setUndoStack(s => s.slice(0, s.length-1))
  }

  function onTouchStart(e){
    const t = e.touches[0]
    touchStartRef.current = {x: t.clientX, y: t.clientY}
  }
  function onTouchEnd(e){
    const t = e.changedTouches[0]
    const s = touchStartRef.current
    if(!s) return
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if(Math.abs(dx) > Math.abs(dy)){
      if(dx > 20) move('right')
      else if(dx < -20) move('left')
    } else {
      if(dy > 20) move('down')
      else if(dy < -20) move('up')
    }
    touchStartRef.current = null
  }

  function reset(){
    setGrid(addRandom(addRandom(emptyGrid())))
    setScore(0)
    setUndoStack([])
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">2048</h2>
      <div className="flex items-center gap-4 mb-4" ref={containerRef}>
        <div>Score: <strong>{score}</strong></div>
        <div>High: <strong>{high}</strong></div>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded" onClick={undo}>Undo</button>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={reset}>New Game</button>
          <FullscreenButton targetRef={containerRef} />
        </div>
      </div>

      <div className="w-full max-w-xs mx-auto touch-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div className="grid grid-cols-4 gap-2 bg-slate-700 p-2 rounded">
          {grid.flat().map((v, i) => (
            <div key={i} className={`aspect-square rounded flex items-center justify-center font-bold text-lg ${v===0?'bg-slate-200 text-transparent':'bg-yellow-300'}`}>
              {v===0 ? '' : v}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500">Use arrow keys or swipe to move. Press 'u' to undo.</p>
    </div>
  )
}
