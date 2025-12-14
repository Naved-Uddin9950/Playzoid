import { useEffect, useRef, useState } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'

const SPEEDS = {
  easy: 160,
  medium: 100,
  hard: 60,
}

const GRID_SIZE = 20 // cells per row and column

function randomCell(exclude = []){
  const x = Math.floor(Math.random()*GRID_SIZE)
  const y = Math.floor(Math.random()*GRID_SIZE)
  for(const e of exclude) if(e.x === x && e.y === y) return randomCell(exclude)
  return {x,y}
}

export default function Snake(){
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(false)
  const [direction, setDirection] = useState({x:1,y:0})
  const [snake, setSnake] = useState([{x:8,y:10},{x:7,y:10},{x:6,y:10}])
  const [food, setFood] = useState(randomCell())
  const [score, setScore] = useState(0)
  const [speedLevel, setSpeedLevel] = useState('medium')
  const [history, setHistory] = useState(() => storage.lsGet('snake:scores', []))
  const containerRef = useRef(null)

  const touchStartRef = useRef(null)
  const tickRef = useRef(null)

  useEffect(()=>{
    draw()
  }, [snake, food])

  useEffect(()=>{
    function handleKey(e){
      const key = e.key
      if(key === 'ArrowUp' || key === 'w') changeDir({x:0,y:-1})
      if(key === 'ArrowDown' || key === 's') changeDir({x:0,y:1})
      if(key === 'ArrowLeft' || key === 'a') changeDir({x:-1,y:0})
      if(key === 'ArrowRight' || key === 'd') changeDir({x:1,y:0})
      if(key === ' ') setRunning(r => !r)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(()=>{
    // start / stop tick
    if(running){
      tickRef.current = setInterval(tick, SPEEDS[speedLevel])
    } else {
      clearInterval(tickRef.current)
    }
    return ()=> clearInterval(tickRef.current)
  }, [running, speedLevel, snake, direction])

  function changeDir(dir){
    // prevent reversing
    if(dir.x === -direction.x && dir.y === -direction.y) return
    setDirection(dir)
  }

  function tick(){
    setSnake(prev => {
      const head = prev[0]
      const newHead = {x: head.x + direction.x, y: head.y + direction.y}
      // wall collision
      if(newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE){
        gameOver()
        return prev
      }
      // self collision
      if(prev.some(p=>p.x===newHead.x && p.y===newHead.y)){
        gameOver()
        return prev
      }
      const ate = newHead.x === food.x && newHead.y === food.y
      const next = [newHead, ...prev]
      if(!ate) next.pop()
      else {
        setScore(s => s+1)
        setFood(randomCell(next))
      }
      return next
    })
  }

  function gameOver(){
    setRunning(false)
    const entry = {score, date: Date.now(), speed: speedLevel}
    const next = [entry, ...history].slice(0, 20)
    setHistory(next)
    storage.lsSet('snake:scores', next)
    setScore(0)
  }

  function reset(){
    setSnake([{x:8,y:10},{x:7,y:10},{x:6,y:10}])
    setDirection({x:1,y:0})
    setFood(randomCell())
    setScore(0)
    setRunning(false)
  }

  function draw(){
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.clientWidth || 360
    canvas.width = size
    canvas.height = size
    const cell = size / GRID_SIZE
    // background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0,0,size,size)
    // snake
    ctx.fillStyle = '#10b981'
    snake.forEach((s, i)=>{
      ctx.fillRect(s.x*cell, s.y*cell, cell-1, cell-1)
    })
    // food
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(food.x*cell, food.y*cell, cell-1, cell-1)
  }

  // touch handlers for swipe
  function onTouchStart(e){
    const t = e.touches[0]
    touchStartRef.current = {x: t.clientX, y: t.clientY}
  }
  function onTouchEnd(e){
    const t = e.changedTouches[0]
    const start = touchStartRef.current
    if(!start) return
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const threshold = 20
    if(absX > absY && absX > threshold){
      if(dx > 0) changeDir({x:1,y:0})
      else changeDir({x:-1,y:0})
    } else if(absY > threshold){
      if(dy > 0) changeDir({x:0,y:1})
      else changeDir({x:0,y:-1})
    }
    touchStartRef.current = null
  }

  const high = history.length ? Math.max(...history.map(h=>h.score)) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Snake</h2>

      <div className="flex gap-4 items-center mb-4">
        <div className="text-sm">Score: <strong>{score}</strong></div>
        <div className="text-sm">High: <strong>{high}</strong></div>
        <div className="ml-auto flex gap-2">
          <button className={`px-3 py-1 rounded ${speedLevel==='easy'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setSpeedLevel('easy')}>Easy</button>
          <button className={`px-3 py-1 rounded ${speedLevel==='medium'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setSpeedLevel('medium')}>Medium</button>
          <button className={`px-3 py-1 rounded ${speedLevel==='hard'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setSpeedLevel('hard')}>Hard</button>
        </div>
      </div>

          <div className="mx-auto w-full max-w-md touch-none" ref={containerRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <div className="relative">
              <canvas ref={canvasRef} className="w-full rounded shadow" style={{background:'#0f172a', minHeight: 320}} />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="grid grid-rows-3 grid-cols-3 gap-2 w-48 pointer-events-auto">
                  <button onClick={()=>changeDir({x:0,y:-1})} className="col-start-2 row-start-1 px-2 py-1 bg-white/80 rounded">↑</button>
                  <button onClick={()=>changeDir({x:-1,y:0})} className="col-start-1 row-start-2 px-2 py-1 bg-white/80 rounded">←</button>
                  <button onClick={()=>changeDir({x:1,y:0})} className="col-start-3 row-start-2 px-2 py-1 bg-white/80 rounded">→</button>
                  <button onClick={()=>changeDir({x:0,y:1})} className="col-start-2 row-start-3 px-2 py-1 bg-white/80 rounded">↓</button>
                </div>
              </div>
            </div>
          </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={()=>setRunning(r=>!r)}>{running ? 'Pause' : 'Start'}</button>
        <button className="px-4 py-2 bg-gray-200 rounded" onClick={reset}>Reset</button>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Score History</h3>
            <div className="flex gap-2 items-center">
              <FullscreenButton targetRef={containerRef} />
            </div>
        </div>
          {history.length === 0 ? <div className="text-sm text-gray-500 mt-2">No scores yet — play and they'll appear here.</div> : (
            <ul className="mt-2 text-sm space-y-1">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{new Date(h.date).toLocaleString()} ({h.speed})</span>
                  <strong>{h.score}</strong>
                </li>
              ))}
            </ul>
          )}

        <div className="mt-3 text-right">
          <button className="px-3 py-1 bg-red-100 rounded" onClick={()=>{storage.lsSet('snake:scores', []); setHistory([])}}>Clear</button>
        </div>
      </div>
    </div>
  )
}
