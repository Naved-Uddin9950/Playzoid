import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function Reaction(){
  const [status, setStatus] = useState('idle') // idle | waiting | ready | done
  const [time, setTime] = useState(null)
  const [best, setBest] = useState(()=> storage.lsGet('reaction:best', null))
  const startRef = useRef(null)
  const timeoutRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('reaction:best', best) }, [best])

  function start(){
    setTime(null)
    setStatus('waiting')
    const delay = 800 + Math.random()*2200
    timeoutRef.current = setTimeout(()=>{
      setStatus('ready')
      startRef.current = performance.now()
    }, delay)
  }

  function click(){
    if(status === 'waiting'){
      // clicked too early
      clearTimeout(timeoutRef.current)
      setStatus('idle')
      setTime('Too soon')
      return
    }
    if(status === 'ready'){
      const t = Math.round(performance.now() - startRef.current)
      setTime(t)
      setStatus('done')
      if(best === null || t < best) setBest(t)
    }
  }

  function reset(){ clearTimeout(timeoutRef.current); setStatus('idle'); setTime(null) }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Reaction Time Test</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-4">
        <div className={`w-full h-40 rounded flex items-center justify-center text-xl font-semibold ${status==='ready' ? 'bg-green-300' : status==='waiting' ? 'bg-yellow-300' : 'bg-slate-100'}`} onClick={click} style={{cursor:'pointer'}}>
          {status === 'idle' && 'Click to start'}
          {status === 'waiting' && 'Wait for green... (don\'t click)'}
          {status === 'ready' && 'Click now!'}
          {status === 'done' && `Your time: ${time} ms`}
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
        <button className="px-3 py-1 bg-gray-200 dark:bg-slate-700 rounded" onClick={reset}>Reset</button>
        <div className="ml-auto">Best: <strong>{best ?? '-'}</strong> ms</div>
      </div>
    </div>
  )
}
