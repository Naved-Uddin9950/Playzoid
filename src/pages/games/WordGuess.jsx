import { useEffect, useState, useRef } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

const WORDS = ['apple','board','crate','demon','eagle','faint','glory','heart','index','jolly','karma','label','magic']

function chooseDaily(){
  const day = new Date().toISOString().slice(0,10)
  const idx = Math.abs(Array.from(day).reduce((s,c)=>s*31 + c.charCodeAt(0), 7)) % WORDS.length
  return WORDS[idx]
}

export default function WordGuess(){
  const [mode, setMode] = useState('daily') // daily | unlimited
  const [solution, setSolution] = useState(chooseDaily())
  const [guesses, setGuesses] = useState([])
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState(()=> storage.lsGet('word:history', []))
  const containerRef = useRef(null)

  useEffect(()=>{
    if(mode === 'daily') setSolution(chooseDaily())
    else setSolution(WORDS[Math.floor(Math.random()*WORDS.length)])
  }, [mode])

  function submit(){
    const guess = input.trim().toLowerCase()
    if(guess.length !== solution.length){ setMessage('Invalid length'); return }
    setGuesses(g => [...g, guess])
    setInput('')
    setMessage('')
    if(guess === solution){
      const entry = {mode, date: Date.now(), word: solution}
      setHistory(h => { const nh = [entry, ...h].slice(0,20); storage.lsSet('word:history', nh); return nh })
    }
  }

  function feedback(guess){
    return guess.split('').map((ch,i)=>({ch, status: ch === solution[i] ? 'correct' : solution.includes(ch) ? 'present' : 'absent'}))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Word Guess</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-3 flex gap-2">
        <button className={`px-3 py-1 rounded ${mode==='daily'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setMode('daily')}>Daily</button>
        <button className={`px-3 py-1 rounded ${mode==='unlimited'?'bg-indigo-600 text-white':'bg-white'}`} onClick={()=>setMode('unlimited')}>Unlimited</button>
      </div>

      <div className="mb-3">
        <input value={input} onChange={e=>setInput(e.target.value)} className="p-2 border rounded w-full max-w-sm" placeholder={`Enter ${solution.length}-letter word`} />
        <div className="mt-2 flex gap-2">
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={submit}>Guess</button>
        </div>
      </div>

      <div className="mb-4">{message}</div>

      <div>
        {guesses.map((g,i)=> (
          <div key={i} className="flex gap-2 mb-1">
            {feedback(g).map((f,ii)=>(
              <div key={ii} className={`px-2 py-1 rounded ${f.status==='correct'?'bg-green-300':f.status==='present'?'bg-yellow-200':'bg-slate-200'}`}>{f.ch}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-white p-3 rounded shadow">
        <h4 className="font-semibold">Recent</h4>
        {history.length === 0 ? <div className="text-sm text-gray-500 mt-2">No history</div> : (
          <ul className="mt-2 text-sm space-y-1">
            {history.map((h,i)=> <li key={i}>{new Date(h.date).toLocaleString()} — {h.word} ({h.mode})</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
