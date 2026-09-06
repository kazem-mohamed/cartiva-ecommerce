const STORAGE_KEY = 'souqly:compare'
export const MAX_COMPARE_ITEMS = 4

export function notifyCompareUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('compareUpdated'))
  }
}

export function getCompareIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const ids = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function setCompareIds(ids: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  notifyCompareUpdate()
}

export function isInCompare(productId: string): boolean {
  return getCompareIds().includes(productId)
}

export type CompareToggleResult = 'added' | 'removed' | 'max-reached'

export function toggleCompare(productId: string): CompareToggleResult {
  const ids = getCompareIds()
  if (ids.includes(productId)) {
    setCompareIds(ids.filter((id) => id !== productId))
    return 'removed'
  }
  if (ids.length >= MAX_COMPARE_ITEMS) {
    return 'max-reached'
  }
  setCompareIds([...ids, productId])
  return 'added'
}

export function removeFromCompare(productId: string) {
  setCompareIds(getCompareIds().filter((id) => id !== productId))
}

export function clearCompare() {
  setCompareIds([])
}
