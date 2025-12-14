import { useState, useEffect } from 'react'

export default function FullscreenButton({ targetRef }){
  const [isFs, setIsFs] = useState(false)

  useEffect(()=>{
    function onChange(){
      setIsFs(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return ()=> document.removeEventListener('fullscreenchange', onChange)
  }, [])

  async function toggle(){
    try{
      if(!document.fullscreenElement){
        const el = targetRef?.current || document.documentElement
        await el.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    }catch(e){
      console.warn('Fullscreen failed', e)
    }
  }

  return (
    <button onClick={toggle} className="px-3 py-1 bg-slate-100 dark:text-black rounded">
      {isFs ? 'Exit Fullscreen' : 'Fullscreen'}
    </button>
  )
}
