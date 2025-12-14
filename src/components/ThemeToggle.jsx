import { useEffect, useState } from 'react'
import { getTheme, setTheme } from '../utils/theme'

export default function ThemeToggle(){
  const [theme, setT] = useState(getTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(()=>{ setT(getTheme() || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) }, [])
  function toggle(){
    const next = theme === 'dark' ? 'light' : 'dark'
    setT(next)
    setTheme(next)
  }
  return (
    <button onClick={toggle} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded">
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  )
}
