import { useEffect, useRef, useState } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'
import SnakeGame from 'snake-game-react'

// Using external snake component; internal grid/speed handled by package

export default function Snake(){
  
  const [score, setScore] = useState(0)
  const [remountKey, setRemountKey] = useState(0)
  const [history, setHistory] = useState(() => storage.lsGet('snake:scores', []))
  const containerRef = useRef(null)

  const obsRef = useRef(null)

  // observe the third-party component's DOM to pick up score and game-over
  useEffect(()=>{
    const container = containerRef.current
    if(!container) return

    let lastScore = null
    let sawSplash = false

    const mo = new MutationObserver(()=>{
      const scoreNode = container.querySelector('.point-bar')
      if(scoreNode){
        const text = scoreNode.textContent || ''
        const m = text.match(/Score:\s*(\d+)/i)
        if(m){
          const val = parseInt(m[1], 10)
          if(val !== lastScore){
            lastScore = val
            setScore(val)
          }
        }
      }

      const splash = !!container.querySelector('.game-splash')
      if(splash && !sawSplash){
        // Game over detected
        sawSplash = true
        const entry = {score: lastScore || 0, date: Date.now(), speed: 'default'}
        const next = [entry, ...history].slice(0, 20)
        setHistory(next)
        storage.lsSet('snake:scores', next)
        setScore(0)
      }
      if(!splash) sawSplash = false
    })

    mo.observe(container, {subtree:true, childList:true, characterData:true})
    obsRef.current = mo
    return ()=>{
      mo.disconnect()
      obsRef.current = null
    }
  }, [containerRef, history])

  function reset(){
    // remount the third-party component to reset.
    setRemountKey(k=>k+1)
    setScore(0)
  }

  // The snake component handles input; we only provide a reset/remount option and fullscreen.

  const high = history.length ? Math.max(...history.map(h=>h.score)) : 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Snake</h2>

      <div className="flex gap-4 items-center mb-4">
        <div className="text-sm">Score: <strong>{score}</strong></div>
        <div className="text-sm">High: <strong>{high}</strong></div>
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-2 bg-gray-200 dark:bg-slate-700 rounded" onClick={reset}>Reset</button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md" ref={containerRef}>
        <div className="relative">
          <div key={remountKey}>
            <SnakeGame color1="#10b981" color2="#ef4444" backgroundColor="#0f172a" />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Score History</h3>
            <div className="flex gap-2 items-center">
              <FullscreenButton targetRef={containerRef} />
            </div>
        </div>
          {history.length === 0 ? <div className="text-sm text-gray-500 mt-2">No scores yet — play and they'll appear here.</div> : (
            <ul className="mt-2 text-sm space-y-1">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between">
                  <span>{new Date(h.date).toLocaleString()} ({h.speed})</span>
                  <strong>{h.score}</strong>
                </li>
              ))}
            </ul>
          )}

        <div className="mt-3 text-right">
          <button className="px-3 py-1 bg-red-100 dark:text-black rounded" onClick={()=>{storage.lsSet('snake:scores', []); setHistory([])}}>Clear</button>
        </div>
      </div>
    </div>
  )
}
