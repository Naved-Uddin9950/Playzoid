import { useEffect, useRef, useState } from 'react'
import { storage } from '../../utils/storage'
import FullscreenButton from '../../components/FullscreenButton'

const CHOICES = ['rock','paper','scissors']

function resultFor(a,b){
  if(a===b) return 'draw'
  if((a==='rock'&&b==='scissors')||(a==='scissors'&&b==='paper')||(a==='paper'&&b==='rock')) return 'win'
  return 'lose'
}

export default function RockPaperScissors(){
  const [player, setPlayer] = useState(null)
  const [computer, setComputer] = useState(null)
  const [res, setRes] = useState(null)
  const [flash, setFlash] = useState(null)
  const [streak, setStreak] = useState(storage.lsGet('rps:streak', 0))
  const [sound, setSound] = useState(storage.lsGet('rps:sound', true))
  const [history, setHistory] = useState(() => storage.lsGet('rps:history', []))
  const containerRef = useRef(null)

  useEffect(()=>{
    storage.lsSet('rps:streak', streak)
  }, [streak])

  useEffect(()=>{
    storage.lsSet('rps:sound', sound)
  }, [sound])

  useEffect(()=>{
    storage.lsSet('rps:history', history)
  }, [history])

  function play(choice){
    const c = CHOICES[Math.floor(Math.random()*CHOICES.length)]
    setPlayer(choice); setComputer(c)
    const r = resultFor(choice, c)
    setRes(r)
    setFlash(r)
    setTimeout(()=>setFlash(null), 600)
    const entry = {player: choice, computer: c, res: r, date: Date.now()}
    setHistory(h => [entry, ...h].slice(0,20))
    if(r === 'win') setStreak(s => s+1)
    if(r === 'lose') setStreak(0)
    if(sound){
      // very small audio feedback (be sure browser allows)
      try{
        const a = new Audio(r === 'win' ? '/success.mp3' : r === 'lose' ? '/fail.mp3' : '/tick.mp3')
        a.play().catch(()=>{ throw new Error('audio fail') })
      }catch(e){
        // fallback beep
        try{
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const o = ctx.createOscillator()
          o.frequency.value = r === 'win' ? 880 : r === 'lose' ? 220 : 440
          o.connect(ctx.destination)
          o.start()
          setTimeout(()=>{ o.stop(); ctx.close() }, 120)
        }catch(_){}
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Rock Paper Scissors</h2>
      <div className="mb-4 flex gap-2" ref={containerRef}>
        {CHOICES.map(c => (
          <button key={c} onClick={()=>play(c)} className={`px-4 py-2 bg-white dark:bg-slate-800 rounded shadow transform transition ${flash === 'win' && player===c ? 'scale-105' : ''}`}>{c}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <FullscreenButton targetRef={containerRef} />
          <button className="px-3 py-1 bg-red-100 rounded" onClick={()=>{setHistory([])}}>Clear History</button>
        </div>
      </div>

      <div className="mt-6">{res ? (
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <div>Player: {player}</div>
          <div>Computer: {computer}</div>
          <div className="mt-2 font-semibold">Result: {res}</div>
        </div>
      ) : <div className="text-gray-500">Make a move</div>}</div>

      <div className="mt-6 bg-white dark:bg-slate-800 p-4 rounded shadow">
        <div className="flex items-center justify-between">
          <div>Streak: {streak}</div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Sound</label>
            <input type="checkbox" checked={sound} onChange={e=>setSound(e.target.checked)} />
          </div>
        </div>
        <div className="mt-3">
          <h4 className="font-semibold">Recent</h4>
          {history.length === 0 ? <div className="text-sm text-gray-500 mt-2">No recent games</div> : (
            <ul className="mt-2 text-sm space-y-1">
              {history.map((h,i) => (
                <li key={i} className="flex justify-between"><span>{new Date(h.date).toLocaleString()}</span><span>{h.res}</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
