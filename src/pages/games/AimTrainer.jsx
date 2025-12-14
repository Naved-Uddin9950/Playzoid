import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function AimTrainer(){
  const [targets, setTargets] = useState([])
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState(()=> storage.lsGet('aim:best', 0))
  const intervalRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('aim:best', best) }, [best])

  function spawn(){
    setTargets(t => [...t, {id:Date.now(), x: 10 + Math.random()*80, y: 10 + Math.random()*80}])
  }

  function start(){ setScore(0); setShots(0); setTargets([]); setRunning(true); intervalRef.current = setInterval(spawn, 900) }
  function stop(){ setRunning(false); clearInterval(intervalRef.current); setTargets([]); const acc = shots ? Math.round((score/shots)*100) : 0; if(acc > best) setBest(acc) }

  function shot(id){ setTargets(t => t.filter(x=>x.id!==id)); setScore(s=>s+1); setShots(s=>s+1) }
  function miss(){ setShots(s=>s+1) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Aim Trainer</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="relative mx-auto max-w-md h-64 bg-slate-100 dark:bg-slate-800 rounded shadow mb-4" onClick={miss} style={{touchAction:'manipulation'}}>
        {targets.map(t => (
          <button key={t.id} onClick={(e)=>{ e.stopPropagation(); shot(t.id) }} style={{position:'absolute', left:`${t.x}%`, top:`${t.y}%`, transform:'translate(-50%,-50%)'}} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center">+</button>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div>Score: <strong>{score}</strong></div>
        <div>Shots: <strong>{shots}</strong></div>
        <div>Accuracy: <strong>{shots? Math.round((score/shots)*100) : 0}%</strong></div>
        <div className="ml-auto">Best Acc: <strong>{best}%</strong></div>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
        <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded" onClick={stop}>Stop</button>
      </div>
    </div>
  )
}
