import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

const COLORS = ['red','green','blue','orange','purple']

export default function ColorMatch(){
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(30)
  const [running, setRunning] = useState(false)
  const [display, setDisplay] = useState({word:'RED', color:'red'})
  const [best, setBest] = useState(()=> storage.lsGet('colormatch:best', 0))
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('colormatch:best', best) }, [best])

  useEffect(()=>{
    let t
    if(running && time > 0) t = setTimeout(()=> setTime(t => t-1), 1000)
    if(time === 0 && running) setRunning(false)
    return ()=> clearTimeout(t)
  }, [running, time])

  useEffect(()=>{
    if(running) next()
  }, [running])

  function next(){
    const word = COLORS[Math.floor(Math.random()*COLORS.length)]
    const color = COLORS[Math.floor(Math.random()*COLORS.length)]
    setDisplay({word: word.toUpperCase(), color})
  }

  function answer(isMatch){
    const ok = display.word.toLowerCase() === display.color
    if((ok && isMatch) || (!ok && !isMatch)) setScore(s => s+1)
    else setScore(s => Math.max(0, s-1))
    next()
  }

  function start(){ setScore(0); setTime(30); setRunning(true) }

  useEffect(()=>{ if(score > best) setBest(score) }, [score])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Color Match (Stroop Test)</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-4">
        <div className="text-center text-3xl font-bold p-6 rounded bg-white"> <span style={{color: display.color}}>{display.word}</span></div>
      </div>

      <div className="flex gap-2 items-center">
        <button className="px-3 py-1 bg-green-500 text-white rounded" onClick={()=>answer(true)}>Match</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={()=>answer(false)}>Not Match</button>
        <div className="ml-auto">Time: <strong>{time}s</strong></div>
        <div className="ml-2">Score: <strong>{score}</strong></div>
        <div className="ml-2">Best: <strong>{best}</strong></div>
      </div>

      <div className="mt-4">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
        <button className="px-3 py-1 bg-gray-200 rounded ml-2" onClick={()=>setRunning(r=>!r)}>{running? 'Pause' : 'Resume'}</button>
      </div>
    </div>
  )
}
