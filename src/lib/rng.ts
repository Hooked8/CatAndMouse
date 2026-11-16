/** Mulberry32 seeded PRNG for reproducible regenerations */
export function createRng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!
}

export function range(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min)
}

export function chance(rng: () => number, p: number) {
  return rng() < p
}
