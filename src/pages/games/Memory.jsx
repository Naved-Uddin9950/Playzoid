import { useEffect, useState, useRef } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function makeDeck(size){
  // size is total cells (must be even), generate size/2 pairs
  const pairs = size / 2
  const values = []
  for(let i=0;i<pairs;i++) values.push(i)
  const deck = shuffle([...values, ...values]).map((v, i) => ({id: i, value: v, matched: false}))
  return deck
}

export default function Memory(){
  const [grid, setGrid] = useState(16)
  const [deck, setDeck] = useState(()=>makeDeck(16))
  const [flipped, setFlipped] = useState([]) // ids
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [running, setRunning] = useState(false)
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)
  const [best, setBest] = useState(() => storage.lsGet('memory:best', {}))

  useEffect(()=>{
    if(running){
      timerRef.current = setInterval(()=> setTime(t => t+1), 1000)
    } else clearInterval(timerRef.current)
    return ()=> clearInterval(timerRef.current)
  }, [running])

  useEffect(()=>{
    // check for win
    if(deck.every(c => c.matched)){
      setRunning(false)
      const prev = best[grid]
      const record = {time, moves}
      if(!prev || time < prev.time || (time === prev.time && moves < prev.moves)){
        const nb = {...best, [grid]: record}
        setBest(nb)
        storage.lsSet('memory:best', nb)
      }
    }
  }, [deck])

  function start(size = grid){
    const d = makeDeck(size)
    setGrid(size)
    setDeck(d)
    setFlipped([])
    setLocked(false)
    setMoves(0)
    setTime(0)
    setRunning(true)
  }

  function flipCard(id){
    if(locked) return
    if(!running) setRunning(true)
    if(flipped.includes(id) || deck.find(c=>c.id===id).matched) return
    const next = [...flipped, id]
    setFlipped(next)
    if(next.length === 2){
      setLocked(true)
      setMoves(m => m+1)
      setTimeout(()=>{
        const [a,b] = next
        const ca = deck.find(c=>c.id===a)
        const cb = deck.find(c=>c.id===b)
        if(ca.value === cb.value){
          setDeck(d => d.map(c => c.id === a || c.id === b ? {...c, matched: true} : c))
        }
        setFlipped([])
        setLocked(false)
      }, 700)
    }
  }

  function formatTime(s){
    const mm = String(Math.floor(s/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${mm}:${ss}`
  }

  const bestFor = best[grid]
  const containerRef = useRef(null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Memory Card Match</h2>

      <div className="flex gap-2 items-center mb-4" ref={containerRef}>
        <label className="text-sm">Grid:</label>
        <button onClick={()=>start(12)} className={`px-2 py-1 rounded ${grid===12?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>3x4</button>
        <button onClick={()=>start(16)} className={`px-2 py-1 rounded ${grid===16?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>4x4</button>
        <button onClick={()=>start(24)} className={`px-2 py-1 rounded ${grid===24?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>4x6</button>
        <div className="ml-auto flex gap-4 items-center">
          <div className="text-sm">Time: <strong>{formatTime(time)}</strong></div>
          <div className="text-sm">Moves: <strong>{moves}</strong></div>
          <div className="text-sm">Best: <strong>{bestFor ? `${formatTime(bestFor.time)} / ${bestFor.moves} moves` : '-'}</strong></div>
          <FullscreenButton targetRef={containerRef} />
        </div>
      </div>

      <div className={`grid gap-3 mx-auto`} style={{gridTemplateColumns: `repeat(${Math.sqrt(grid)}, 1fr)`, maxWidth: 520}}>
        {deck.map(c => (
          <button key={c.id} onClick={()=>flipCard(c.id)} disabled={c.matched} className={`aspect-square rounded shadow flex items-center justify-center text-xl font-bold ${c.matched ? 'bg-green-100' : flipped.includes(c.id) ? 'bg-white dark:bg-slate-800' : 'bg-slate-700 text-transparent'}`}>
            {flipped.includes(c.id) || c.matched ? c.value : '❓'}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={()=>start(grid)}>Restart</button>
        <button className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded" onClick={()=>{setRunning(r=>!r)}}>{running ? 'Pause' : 'Resume'}</button>
      </div>
    </div>
  )
}
