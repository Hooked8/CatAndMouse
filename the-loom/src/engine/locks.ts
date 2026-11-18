/** Seeded precision locks — final answers require a second mental step. */

export type LockKind = 'reverse' | 'lettercount' | 'nofillers' | 'shadow' | 'pluscode'

export type PrecisionLock = {
  kind: LockKind
  /** Shown on the solver sheet (human-readable) */
  instruction: string
  /** Short code word mixed into the instruction instance */
  code: string
}

const CODES = [
  'onyx',
  'quartz',
  'mercury',
  'velvet',
  'brass',
  'nimbus',
  'cinder',
  'harbor',
  'flint',
  'myrrh',
] as const

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function normalizeFinal(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s,]/g, '')
    .replace(/\s+/g, ' ')
}

export function pickLock(seed: string): PrecisionLock {
  const kinds: LockKind[] = ['reverse', 'lettercount', 'nofillers', 'shadow', 'pluscode']
  const kind = kinds[hashSeed(seed + ':lock') % kinds.length]!
  const code = CODES[hashSeed(seed + ':code') % CODES.length]!

  switch (kind) {
    case 'reverse':
      return {
        kind,
        code,
        instruction: `PRECISION LOCK (${code.toUpperCase()}): After you solve the puzzle, reverse the letters of your answer (ignore spaces and punctuation while reversing, then write it as one word). That reversed form is the only accepted final answer.`,
      }
    case 'lettercount':
      return {
        kind,
        code,
        instruction: `PRECISION LOCK (${code.toUpperCase()}): After you solve the puzzle, count the letters in your answer (A–Z only). Your final answer must be that count written as an English word (e.g. 7 → seven), then a hyphen, then the code word ${code}.`,
      }
    case 'nofillers':
      return {
        kind,
        code,
        instruction: `PRECISION LOCK (${code.toUpperCase()}): After you solve the puzzle, strip the words a, an, and the from your answer if present, then append a slash and the code word ${code}. Example shape: answer/${code}`,
      }
    case 'shadow':
      return {
        kind,
        code,
        instruction: `PRECISION LOCK (${code.toUpperCase()}): After you solve the puzzle, keep only the consonants in your answer (drop A E I O U and spaces), lowercase, and join them into one string. That consonant skeleton is the final answer.`,
      }
    case 'pluscode':
      return {
        kind,
        code,
        instruction: `PRECISION LOCK (${code.toUpperCase()}): After you solve the puzzle, write the answer in lowercase, then a space, then the code word ${code}. Both halves are required.`,
      }
  }
}

export function applyLock(coreAnswer: string, lock: PrecisionLock): string {
  const core = normalizeFinal(coreAnswer)

  switch (lock.kind) {
    case 'reverse': {
      const compact = core.replace(/[\s,]/g, '')
      return compact.split('').reverse().join('')
    }
    case 'lettercount': {
      const letters = core.replace(/[^a-z]/g, '').length
      const words = [
        'zero',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
        'twenty',
      ]
      const word = words[letters] ?? String(letters)
      return `${word}-${lock.code}`
    }
    case 'nofillers': {
      const stripped = core
        .split(' ')
        .filter((w) => w !== 'a' && w !== 'an' && w !== 'the')
        .join(' ')
      return `${stripped}/${lock.code}`
    }
    case 'shadow': {
      return core.replace(/[aeiou\s,]/g, '')
    }
    case 'pluscode':
      return `${core} ${lock.code}`
  }
}
