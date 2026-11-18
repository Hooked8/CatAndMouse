import { applyLock, pickLock, type PrecisionLock } from './locks'
import { RIDDLE_BANK, type HardRiddle } from './riddles'

export type GeneratedPuzzle = {
  seed: string
  riddle: HardRiddle
  lock: PrecisionLock
  /** Conceptual solve */
  coreAnswer: string
  /** What a winner must produce after the precision lock */
  finalAnswer: string
}

const HISTORY_KEY = 'loom.hard.history.v1'

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') as string[]
  } catch {
    return []
  }
}

function saveHistory(ids: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(ids.slice(0, 24)))
}

function encodeSeed(): string {
  const arr = new Uint8Array(5)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function generatePuzzle(avoidId?: string): GeneratedPuzzle {
  const history = typeof localStorage !== 'undefined' ? loadHistory() : []
  const blocked = new Set(history)
  if (avoidId) blocked.add(avoidId)

  let pool = RIDDLE_BANK.filter((r) => !blocked.has(r.id))
  if (pool.length === 0) {
    pool = RIDDLE_BANK.filter((r) => r.id !== avoidId)
    if (typeof localStorage !== 'undefined') saveHistory([])
  }

  const seed = encodeSeed()
  const riddle = pool[Math.floor(Math.random() * pool.length)]!
  const lock = pickLock(seed + riddle.id)
  const finalAnswer = applyLock(riddle.coreAnswer, lock)

  if (typeof localStorage !== 'undefined') {
    saveHistory([riddle.id, ...history.filter((id) => id !== riddle.id)])
  }

  return {
    seed,
    riddle,
    lock,
    coreAnswer: riddle.coreAnswer,
    finalAnswer,
  }
}

export function shareableRiddleText(puzzle: GeneratedPuzzle): string {
  return `${puzzle.riddle.title}\n\n${puzzle.riddle.prompt}`
}

export function fullChallengeText(puzzle: GeneratedPuzzle): string {
  return `${shareableRiddleText(puzzle)}\n\n---\n${puzzle.lock.instruction}`
}
