import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function Flappy(){
  const canvasRef = useRef(null)
  const [running, setRunning] = useState(true)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(()=> storage.lsGet('flappy:high', 0))
  const [bird, setBird] = useState({y:150, vy:0})
  const pipesRef = useRef([])
  const framesRef = useRef(0)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('flappy:high', high)}, [high])

  useEffect(()=>{
    let raf
    function loop(){
      step()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return ()=> cancelAnimationFrame(raf)
  }, [running, bird])

  function step(){
    framesRef.current++
    // gravity
    setBird(b => {
      const vy = b.vy + 0.6
      const ny = b.y + vy
      if(ny > 360 || ny < 0){ end() }
      return {y: ny, vy}
    })

    // spawn pipes
    if(framesRef.current % 90 === 0){
      const gap = 100
      const top = 50 + Math.random()*120
      pipesRef.current.push({x: 420, top, gap})
    }

    // move pipes and check collision
    pipesRef.current = pipesRef.current.map(p => ({...p, x: p.x - 3 - Math.floor(framesRef.current/1000)})).filter(p => p.x > -50)
    const b = bird
    // scoring
    pipesRef.current.forEach(p => { if(!p.passed && p.x < 80){ p.passed = true; setScore(s=>s+1); if(score+1 > high) setHigh(score+1) } })
    draw()
  }

  function flap(){ setBird(b => ({...b, vy: -8})) }

  function end(){ setRunning(false) }

  function draw(){
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 420; canvas.height = 420
    ctx.fillStyle = '#7dd3fc'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    // bird
    ctx.fillStyle = '#f97316'
    ctx.beginPath(); ctx.arc(80, bird.y, 12, 0, Math.PI*2); ctx.fill()
    // pipes
    ctx.fillStyle = '#16a34a'
    pipesRef.current.forEach(p => {
      ctx.fillRect(p.x, 0, 50, p.top)
      ctx.fillRect(p.x, p.top + p.gap, 50, canvas.height)
    })
    ctx.fillStyle = '#000'
    ctx.fillText(`Score: ${score}`, 10, 20)
  }

  useEffect(()=>{
    function onKey(e){ if(e.key === ' ' || e.key === 'ArrowUp') flap() }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Flappy Clone</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>
      <div className="mx-auto max-w-md bg-white rounded shadow p-2">
        <canvas ref={canvasRef} className="w-full" onClick={flap} style={{touchAction:'manipulation'}} />
      </div>
      <div className="mt-3 flex gap-4 items-center">
        <div>Score: <strong>{score}</strong></div>
        <div className="ml-auto">High: <strong>{high}</strong></div>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>{ setScore(0); pipesRef.current=[]; setBird({y:150, vy:0}); setRunning(true); framesRef.current=0 }}>Restart</button>
      </div>
    </div>
  )
}
