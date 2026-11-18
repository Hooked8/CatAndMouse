import { forgeChallenge, verifyAttempt } from '../src/engine/seal.ts'

const forged = await forgeChallenge('abcdef12')
const wrong = await verifyAttempt(forged, 'totally wrong')
if (wrong.ok) throw new Error('false positive')
console.log('seed', forged.seed)
console.log('seal', forged.seal)
console.log('smoke ok')
