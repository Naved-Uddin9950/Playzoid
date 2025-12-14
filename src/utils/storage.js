// Simple storage wrapper for localStorage + IndexedDB (promise-based)
const IDB_DB = 'playzoid-db'
const IDB_STORE = 'kv'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly')
    const store = tx.objectStore(IDB_STORE)
    const req = store.get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbSet(key, value) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)
    const req = store.put(value, key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbDel(key) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    const store = tx.objectStore(IDB_STORE)
    const req = store.delete(key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// localStorage helpers
const ls = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key, fallback = null) {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  },
  remove(key) {
    localStorage.removeItem(key)
  },
}

export const storage = {
  // IndexedDB basic ops
  async get(key) {
    try {
      return await idbGet(key)
    } catch (e) {
      console.warn('IDB get failed', e)
      return null
    }
  },
  async set(key, value) {
    try {
      return await idbSet(key, value)
    } catch (e) {
      console.warn('IDB set failed', e)
      return null
    }
  },
  async del(key) {
    try {
      return await idbDel(key)
    } catch (e) {
      console.warn('IDB del failed', e)
      return null
    }
  },
  // localStorage fallback/simple
  lsSet(key, value) {
    ls.set(key, value)
  },
  lsGet(key, fallback = null) {
    return ls.get(key, fallback)
  },
  lsRemove(key) {
    ls.remove(key)
  },
}

export default storage
