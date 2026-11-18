/** Poetic filament words — short, memorable, unlikely to be guessed from the riddle alone */
export const FILAMENT_WORDS = [
  'ember',
  'amber',
  'cinder',
  'thistle',
  'meridian',
  'vellum',
  'lodestone',
  'cipher',
  'umbrage',
  'spindle',
  'halyard',
  'quartz',
  'nimbus',
  'silt',
  'braid',
  'keystone',
  'lantern',
  'obsidian',
  'petal',
  'rift',
  'solstice',
  'tallow',
  'wisp',
  'yarrow',
  'zephyr',
  'coral',
  'drift',
  'flint',
  'grove',
  'haven',
] as const

export type FilamentWord = (typeof FILAMENT_WORDS)[number]

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

export type LatticeCell = {
  row: number
  col: number
  letter: string
  onPath: boolean
  pathIndex: number | null
}

export type Lattice = {
  size: number
  cells: LatticeCell[]
  /** Ordered path through the grid spelling the filament */
  path: { row: number; col: number }[]
  filament: string
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function pickFilament(seed: string): string {
  const rng = mulberry32(hashSeed(seed + ':filament'))
  const idx = Math.floor(rng() * FILAMENT_WORDS.length)
  return FILAMENT_WORDS[idx]!
}

/**
 * Build a letter lattice where an invisible-looking path spells the filament.
 * Decoy letters fill the rest so reading the DOM as a bag of letters is useless.
 */
export function buildLattice(seed: string, filament: string): Lattice {
  const rng = mulberry32(hashSeed(seed + ':lattice:' + filament))
  const size = 6
  const word = filament.toLowerCase()

  // Snake a path of length = word.length across the grid
  const path: { row: number; col: number }[] = []
  let row = Math.floor(rng() * size)
  let col = Math.floor(rng() * size)
  path.push({ row, col })

  const occupied = new Set<string>([`${row},${col}`])
  const dirs = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]

  for (let i = 1; i < word.length; i++) {
    const shuffled = [...dirs].sort(() => rng() - 0.5)
    let placed = false
    for (const [dr, dc] of shuffled) {
      const nr = row + dr!
      const nc = col + dc!
      const key = `${nr},${nc}`
      if (nr >= 0 && nr < size && nc >= 0 && nc < size && !occupied.has(key)) {
        row = nr
        col = nc
        path.push({ row, col })
        occupied.add(key)
        placed = true
        break
      }
    }
    if (!placed) {
      // Restart path if stuck
      return buildLattice(seed + ':retry' + i, filament)
    }
  }

  const pathIndex = new Map<string, number>()
  path.forEach((p, i) => pathIndex.set(`${p.row},${p.col}`, i))

  const cells: LatticeCell[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r},${c}`
      const onPath = pathIndex.has(key)
      const pi = pathIndex.get(key) ?? null
      const letter = onPath
        ? word[pi!]!
        : ALPHABET[Math.floor(rng() * 26)]!
      cells.push({
        row: r,
        col: c,
        letter,
        onPath,
        pathIndex: pi,
      })
    }
  }

  return { size, cells, path, filament: word }
}
