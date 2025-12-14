import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

function randomQuestion(level){
  const a = Math.ceil(Math.random()* (level=== 'easy' ? 10 : level==='medium' ? 20 : 50))
  const b = Math.ceil(Math.random()* (level=== 'easy' ? 10 : level==='medium' ? 20 : 50))
  return {q: `${a} + ${b}`, ans: a+b}
}

export default function MathSprint(){
  const [level, setLevel] = useState('easy')
  const [time, setTime] = useState(30)
  const [running, setRunning] = useState(false)
  const [question, setQuestion] = useState(() => randomQuestion('easy'))
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [leaderboard, setLeaderboard] = useState(()=> storage.lsGet('math:leaderboard', []))
  const containerRef = useRef(null)

  useEffect(()=>{
    let t
    if(running && time>0){
      t = setTimeout(()=> setTime(t=>t-1), 1000)
    }
    if(time === 0 && running){
      setRunning(false)
      const entry = {score, level, date: Date.now()}
      const nb = [entry, ...leaderboard].slice(0,20)
      setLeaderboard(nb)
      storage.lsSet('math:leaderboard', nb)
    }
    return ()=> clearTimeout(t)
  }, [running, time, score])

  function start(){
    setScore(0); setTime(30); setRunning(true); setQuestion(randomQuestion(level)); setInput('')
  }

  function submit(){
    if(Number(input) === question.ans){
      setScore(s => s+1)
      setQuestion(randomQuestion(level))
      setInput('')
    } else setInput('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Math Sprint</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-3 flex gap-2">
        <button className={`px-3 py-1 rounded ${level==='easy'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('easy')}>Easy</button>
        <button className={`px-3 py-1 rounded ${level==='medium'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('medium')}>Medium</button>
        <button className={`px-3 py-1 rounded ${level==='hard'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setLevel('hard')}>Hard</button>
      </div>

      <div className="mb-4 bg-white p-4 rounded shadow">
        <div className="text-sm text-gray-500 mb-2">Time: <strong>{time}s</strong></div>
        <div className="text-xl font-bold mb-2">{question.q}</div>
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} className="p-2 border rounded" />
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={submit}>Submit</button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div>Score: <strong>{score}</strong></div>
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
      </div>

      <div className="bg-white p-3 rounded shadow">
        <h4 className="font-semibold">Leaderboard</h4>
        {leaderboard.length === 0 ? <div className="text-sm text-gray-500 mt-2">No scores yet</div> : (
          <ul className="mt-2 text-sm">
            {leaderboard.map((l,i)=> <li key={i}>{new Date(l.date).toLocaleString()} — {l.level} — {l.score}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
