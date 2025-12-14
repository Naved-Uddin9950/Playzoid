import { useEffect, useState, useRef } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'
import MemoryGame from 'react-card-memory-game'


export default function Memory(){
  // gridNumber corresponds to the package's `gridNumber` prop (4..6).
  // total cards = gridNumber * 4 (e.g., 4 -> 16, 5 -> 20, 6 -> 24)
  const [gridNumber, setGridNumber] = useState(4)
  const [remountKey, setRemountKey] = useState(0)
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

  // no internal deck; gameFinished is called from the component callbacks

  function start(number = gridNumber){
    setGridNumber(number)
    setRemountKey(k=>k+1)
    setMoves(0)
    setTime(0)
    setRunning(false)
  }

  // handled by component via foundPair / notFoundPair callbacks

  function formatTime(s){
    const mm = String(Math.floor(s/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${mm}:${ss}`
  }

  const bestFor = best[gridNumber]
  const containerRef = useRef(null)

  function onFoundPair(){
    setMoves(m => m+1)
    if(!running) setRunning(true)
  }

  function onNotFoundPair(){
    setMoves(m => m+1)
    if(!running) setRunning(true)
  }

  function onGameFinished(){
    setRunning(false)
    const record = {time, moves}
    const prev = best[gridNumber]
    if(!prev || time < prev.time || (time === prev.time && moves < prev.moves)){
      const nb = {...best, [gridNumber]: record}
      setBest(nb)
      storage.lsSet('memory:best', nb)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Memory Card Match</h2>

      <div className="flex gap-2 items-center mb-4" ref={containerRef}>
        <label className="text-sm">Grid:</label>
        <button onClick={()=>start(4)} className={`px-2 py-1 rounded ${gridNumber===4?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>4x4 (16)</button>
        <button onClick={()=>start(5)} className={`px-2 py-1 rounded ${gridNumber===5?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>4x5 (20)</button>
        <button onClick={()=>start(6)} className={`px-2 py-1 rounded ${gridNumber===6?'bg-indigo-600 text-white':'bg-white dark:bg-slate-800'}`}>4x6 (24)</button>
        <div className="ml-auto flex gap-4 items-center">
          <div className="text-sm">Time: <strong>{formatTime(time)}</strong></div>
          <div className="text-sm">Moves: <strong>{moves}</strong></div>
          <div className="text-sm">Best: <strong>{bestFor ? `${formatTime(bestFor.time)} / ${bestFor.moves} moves` : '-'}</strong></div>
          <FullscreenButton targetRef={containerRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <MemoryGame key={remountKey} gridNumber={gridNumber} foundPair={onFoundPair} notFoundPair={onNotFoundPair} gameFinished={onGameFinished} holeCardsColor="#0f172a" foundCardsColor="#10b981" />
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded" onClick={()=>start(gridNumber)}>Restart</button>
        <button className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded" onClick={()=>{setRunning(r=>!r)}}>{running ? 'Pause' : 'Resume'}</button>
      </div>
    </div>
  )
}
