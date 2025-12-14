import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

// Simple maze generator (DFS)
function generateMaze(n=13){
  // n should be odd
  const w = n, h = n
  const grid = Array.from({length:h}, ()=> Array.from({length:w}, ()=> 1))
  function carve(x,y){
    grid[y][x] = 0
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]].sort(()=>Math.random()-0.5)
    for(const [dx,dy] of dirs){
      const nx = x + dx*2, ny = y + dy*2
      if(nx>0 && nx<w && ny>0 && ny<h && grid[ny][nx]===1){
        grid[y+dy][x+dx] = 0
        carve(nx, ny)
      }
    }
  }
  carve(1,1)
  return grid
}

export default function MazeEscape(){
  const [maze, setMaze] = useState(()=> generateMaze())
  const [player, setPlayer] = useState({x:1,y:1})
  const [goal, setGoal] = useState({x:11,y:11})
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState(()=> storage.lsGet('maze:best', null))
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('maze:best', best) }, [best])

  useEffect(()=>{
    function onKey(e){
      if(!running) return
      const k = e.key
      let nx = player.x, ny = player.y
      if(k === 'ArrowUp') ny -= 1
      if(k === 'ArrowDown') ny += 1
      if(k === 'ArrowLeft') nx -= 1
      if(k === 'ArrowRight') nx += 1
      if(maze[ny] && maze[ny][nx] === 0) setPlayer({x:nx,y:ny})
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [player, running, maze])

  useEffect(()=>{
    let t
    if(running) t = setInterval(()=> setTime(t=>t+1), 1000)
    else clearInterval(t)
    return ()=> clearInterval(t)
  }, [running])

  useEffect(()=>{
    if(player.x === goal.x && player.y === goal.y){
      setRunning(false)
      if(best === null || time < best) setBest(time)
    }
  }, [player])

  function reset(){ setMaze(generateMaze()); setPlayer({x:1,y:1}); setGoal({x: maze.length-2, y: maze[0].length-2}); setTime(0); setRunning(false) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Maze Escape</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mx-auto max-w-md bg-white dark:bg-slate-800 rounded shadow p-2 mb-4">
        <div style={{display:'grid', gridTemplateColumns:`repeat(${maze[0].length}, 20px)`}}>
          {maze.flatMap((v,i)=>{
            const y = Math.floor(i/maze[0].length), x = i % maze[0].length
            const isPlayer = player.x === x && player.y === y
            const isGoal = goal.x === x && goal.y === y
            return <div key={i} className={`w-5 h-5 ${v===1?'bg-slate-700':'bg-white'} ${isPlayer?'bg-blue-500':' '} ${isGoal?'bg-green-400':''}`}></div>
          })}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>{setTime(0); setRunning(true)}}>Start</button>
        <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded" onClick={reset}>New Maze</button>
        <div className="ml-auto">Time: <strong>{time}s</strong></div>
        <div className="ml-2">Best: <strong>{best ?? '-'}</strong></div>
      </div>
    </div>
  )
}
