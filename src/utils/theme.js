// Simple theme helper: persisted in localStorage under 'theme' ('dark'|'light')
export function getTheme(){
  try{ return localStorage.getItem('theme') }catch(e){return null}
}

export function setTheme(t){
  try{ localStorage.setItem('theme', t) }catch(e){}
  applyTheme(t)
}

export function applyTheme(t){
  const el = document.documentElement
  if(t === 'dark') el.classList.add('dark')
  else el.classList.remove('dark')
}

export function initTheme(){
  const saved = getTheme()
  if(saved === 'dark' || saved === 'light') applyTheme(saved)
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark')
  else applyTheme('light')
}
