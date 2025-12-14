import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'

const PASSAGES = [
  'The quick brown fox jumps over the lazy dog',
  'Coding challenges sharpen problem solving and typing speed',
  'Practice makes perfect; keep improving your accuracy each day',
]

export default function Typing(){
  const [mode, setMode] = useState(30)
  const [text, setText] = useState(PASSAGES[0])
  const [pos, setPos] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [started, setStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(mode)
  const containerRef = useRef(null)

  useEffect(()=>{ setText(PASSAGES[Math.floor(Math.random()*PASSAGES.length)]) }, [mode])

  useEffect(()=>{
    let t
    if(started && timeLeft > 0){
      t = setTimeout(()=> setTimeLeft(t => t-1), 1000)
    }
    if(timeLeft === 0) setStarted(false)
    return ()=> clearTimeout(t)
  }, [started, timeLeft])

  function handleKey(e){
    if(timeLeft === 0) return
    if(!started) setStarted(true)
    const ch = e.key
    if(ch.length === 1){
      const expected = text[pos]
      if(ch === expected) setCorrect(c => c+1)
      setPos(p => p+1)
    } else if(ch === 'Backspace') setPos(p => Math.max(0, p-1))
  }

  const wpm = Math.round((correct / 5) / ((mode - timeLeft) / 60 || 1))
  const accuracy = Math.round((correct / Math.max(1, pos)) * 100)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef} onKeyDown={handleKey} tabIndex={0}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Typing Speed Test</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-3 flex gap-2">
        <button className={`px-3 py-1 rounded ${mode===30?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`} onClick={()=>{setMode(30); setTimeLeft(30)}}>30s</button>
        <button className={`px-3 py-1 rounded ${mode===60?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`} onClick={()=>{setMode(60); setTimeLeft(60)}}>60s</button>
      </div>

      <div className="mb-3 p-4 bg-white dark:bg-slate-800 rounded shadow">
        <div className="text-sm text-gray-500 mb-2">Time left: <strong>{timeLeft}s</strong></div>
        <div className="p-2 border rounded min-h-20">{text.split('').map((ch,i)=> (
          <span key={i} className={i<pos ? ( (text[i]===text[i] && i<pos && i<pos) ? 'text-green-600' : '' ) : ''}>{ch}</span>
        ))}</div>
      </div>

      <div className="flex gap-4 items-center">
        <div>WPM: <strong>{wpm}</strong></div>
        <div>Accuracy: <strong>{isNaN(accuracy)?0:accuracy}%</strong></div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">Focus this panel and start typing to begin.</p>
      </div>
    </div>
  )
}
