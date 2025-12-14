import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function WhackAMole(){
  const [holes] = useState(9)
  const [moleIndex, setMoleIndex] = useState(null)
  const [intervalMs, setIntervalMs] = useState(1000)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [best, setBest] = useState(()=> storage.lsGet('whack:best', 0))
  const timerRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{
    start()
    return stop
  }, [])

  useEffect(()=>{
    storage.lsSet('whack:best', best)
  }, [best])

  function start(){
    stop()
    setScore(0); setCombo(0); setIntervalMs(1000)
    timerRef.current = setInterval(()=>{
      setMoleIndex(i => {
        const next = Math.floor(Math.random()*holes)
        return next
      })
      // increase difficulty
      setIntervalMs(ms => Math.max(300, Math.floor(ms * 0.98)))
    }, intervalMs)
  }

  function stop(){
    clearInterval(timerRef.current)
    timerRef.current = null
    setMoleIndex(null)
    if(score > best) setBest(score)
  }

  function whack(i){
    if(i === moleIndex){
      setScore(s => s+1+Math.floor(combo/5))
      setCombo(c => c+1)
      setMoleIndex(null)
    } else {
      setCombo(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Whack-a-Mole</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
        {Array.from({length: holes}).map((_,i)=> (
          <button key={i} onClick={()=>whack(i)} className={`aspect-square rounded ${moleIndex===i ? 'bg-amber-400' : 'bg-slate-200'}`}>
            {moleIndex===i ? '🐹' : ''}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div>Score: <strong>{score}</strong></div>
        <div>Combo: <strong>{combo}</strong></div>
        <div className="ml-auto">Best: <strong>{best}</strong></div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
        <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded" onClick={stop}>Stop</button>
      </div>
    </div>
  )
}
