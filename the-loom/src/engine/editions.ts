import { hashSeed } from './filaments'

/** Short edition marks printed on the contest page — never inside the riddle text. */
export const EDITION_MARKS = [
  'haven',
  'ember',
  'flint',
  'grove',
  'quill',
  'ridge',
  'slate',
  'amber',
  'cedar',
  'drift',
  'frost',
  'grain',
  'harbor',
  'ivory',
  'jasper',
  'kettle', // decoy-friendly; may collide with answers — filter below
  'linen',
  'maple',
  'north',
  'opal',
  'pearl',
  'quartz',
  'raven',
  'spruce',
  'tide',
  'umbra',
  'violet',
  'wheat',
  'yarn',
  'zinc',
] as const

export function pickEditionMark(seed: string, forbidden: string[] = []): string {
  const banned = new Set(forbidden.map((w) => w.toLowerCase()))
  const pool = EDITION_MARKS.filter((w) => !banned.has(w))
  const list = pool.length > 0 ? pool : [...EDITION_MARKS]
  const idx = hashSeed(seed + ':edition') % list.length
  return list[idx]!
}
