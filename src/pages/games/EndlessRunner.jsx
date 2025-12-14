import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function EndlessRunner(){
  const [playerY, setPlayerY] = useState(0)
  const [vy, setVy] = useState(0)
  const [obstacles, setObstacles] = useState([])
  const [score, setScore] = useState(0)
  const [speed, setSpeed] = useState(4)
  const [running, setRunning] = useState(false)
  const [high, setHigh] = useState(()=> storage.lsGet('runner:high', 0))
  const framesRef = useRef(0)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('runner:high', high) }, [high])

  useEffect(()=>{
    let raf
    function loop(){
      if(running) tick()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return ()=> cancelAnimationFrame(raf)
  }, [running, playerY, obstacles])

  function start(){ setRunning(true); setScore(0); setObstacles([]); setSpeed(4); setPlayerY(0); setVy(0); framesRef.current=0 }

  function tick(){
    framesRef.current++
    setVy(v => v + 0.8)
    setPlayerY(y => Math.min(0, y + vy))
    // spawn obstacles
    if(framesRef.current % Math.max(40, 120 - Math.floor(score/5)) === 0){
      setObstacles(o => [...o, {x: 400, h: 20 + Math.random()*60}])
    }
    setObstacles(o => o.map(p => ({...p, x: p.x - speed})).filter(p => p.x > -50))
    // collision: simple ground-level check
    const hit = obstacles.some(p => p.x < 60 && p.x > 30 && playerY > -p.h)
    if(hit){ setRunning(false); if(score > high) setHigh(score) }
    // increase difficulty
    if(framesRef.current % 300 === 0) setSpeed(s => s + 0.3)
    // increment score
    setScore(s => s + 1)
  }

  function jump(){ if(!running) start(); setVy(-8); setPlayerY(y => y - 20) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Endless Runner</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mx-auto w-full max-w-md bg-slate-100 rounded shadow h-40 relative overflow-hidden" onClick={jump} style={{touchAction:'manipulation'}}>
        <div style={{position:'absolute', left:50, bottom: 20 + playerY}} className="w-8 h-8 bg-indigo-600 rounded" />
        {obstacles.map((o,i)=> <div key={i} style={{position:'absolute', right:`${400-o.x}px`, bottom: 20, width: 24, height: o.h, background:'#ef4444'}} />)}
      </div>

      <div className="mt-3 flex gap-4 items-center">
        <div>Score: <strong>{score}</strong></div>
        <div className="ml-auto">High: <strong>{high}</strong></div>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Restart</button>
      </div>
    </div>
  )
}
