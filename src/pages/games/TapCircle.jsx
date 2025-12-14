import { useEffect, useRef, useState } from 'react'
import FullscreenButton from '../../components/FullscreenButton'
import { storage } from '../../utils/storage'

export default function TapCircle(){
  const [best, setBest] = useState(()=> storage.lsGet('tap:best', null))
  const [status, setStatus] = useState('ready') // ready | waiting | show
  const [targetPos, setTargetPos] = useState({x:50,y:50})
  const [reactTime, setReactTime] = useState(null)
  const startRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(()=>{ storage.lsSet('tap:best', best) }, [best])

  function start(){
    setStatus('waiting')
    setReactTime(null)
    const delay = 600 + Math.random()*1200
    setTimeout(()=>{
      setStatus('show')
      const x = 10 + Math.random()*80
      const y = 10 + Math.random()*80
      setTargetPos({x,y})
      startRef.current = performance.now()
    }, delay)
  }

  function tap(){
    if(status !== 'show') return
    const t = performance.now()
    const rt = Math.round(t - startRef.current)
    setReactTime(rt)
    setStatus('ready')
    if(best === null || rt < best) setBest(rt)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" ref={containerRef}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Tap The Circle</h2>
        <FullscreenButton targetRef={containerRef} />
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">Tap when the circle appears. Best reaction time is saved locally.</p>
      </div>

      <div className="relative mx-auto w-full max-w-md h-64 bg-slate-100 rounded shadow" onClick={tap} style={{touchAction:'manipulation'}}>
        {status === 'show' && (
          <div style={{position:'absolute', left:`${targetPos.x}%`, top:`${targetPos.y}%`, transform:'translate(-50%,-50%)'}}>
            <div className="w-16 h-16 rounded-full bg-rose-400 flex items-center justify-center text-white text-lg">Tap</div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={start}>Start</button>
        <div>Last: <strong>{reactTime ?? '-'}</strong> ms</div>
        <div className="ml-auto">Best: <strong>{best ?? '-'}</strong> ms</div>
      </div>
    </div>
  )
}
