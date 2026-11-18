import { forgeChallenge, verifyAttempt } from '../src/engine/seal.ts'
import { riddleByIndex } from '../src/engine/riddles.ts'
import { hashSeed } from '../src/engine/filaments.ts'

const seed = 'abcdef12'
const forged = await forgeChallenge(seed)
const riddle = riddleByIndex(hashSeed(seed + ':riddle'))
console.log({
  answer: riddle.answer,
  edition: forged.editionMark,
  seal: forged.seal,
})
console.log('answer only', await verifyAttempt(forged, riddle.answer))
console.log(
  'full entry',
  await verifyAttempt(forged, `${riddle.answer} ${forged.editionMark}`),
)
