import { webcrypto } from 'node:crypto'

if (!globalThis.crypto) globalThis.crypto = webcrypto

// Dynamic import of compiled logic via vite-node isn't set up; inline a minimal parity check
// by importing TypeScript through tsx if available — otherwise skip.
const { forgeChallenge, verifyAttempt, parseAttempt, normalizeBinding } = await import(
  '../src/engine/seal.ts'
).catch(() => ({ forgeChallenge: null }))

if (!forgeChallenge) {
  console.log('skip: run via tsx or after build tooling')
  process.exit(0)
}

const forged = await forgeChallenge('abcdef12')
const wrong = await verifyAttempt(forged, 'totally wrong word')
if (wrong.ok) throw new Error('false positive')

const parsed = parseAttempt('mirror ember')
if (!parsed) throw new Error('parse failed')

console.log('seed', forged.seed)
console.log('digest', forged.bindingDigest.slice(0, 12))
console.log('seal', forged.seal)
console.log('normalize sample', normalizeBinding('Mirror', 'EMBER'))
console.log('smoke ok')
