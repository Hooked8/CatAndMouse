import { forgeChallenge, verifyAttempt } from '../src/engine/seal.ts'
import { riddleByIndex } from '../src/engine/riddles.ts'
import { pickFilament, hashSeed } from '../src/engine/filaments.ts'

const seed = 'abcdef12'
const forged = await forgeChallenge(seed)
const filament = pickFilament(seed)
const riddle = riddleByIndex(hashSeed(seed + ':riddle'))
console.log({ answer: riddle.answer, filament, seal: forged.seal })
console.log('correct', await verifyAttempt(forged, `${riddle.answer} ${filament}`))
console.log('answer only', await verifyAttempt(forged, riddle.answer))
console.log('ai near miss', await verifyAttempt(forged, `${riddle.answer}s ${filament}`))
