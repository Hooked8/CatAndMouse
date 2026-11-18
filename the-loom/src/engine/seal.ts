import { riddleByIndex } from './riddles'
import { buildLattice, hashSeed, pickFilament } from './filaments'

export type PublicChallenge = {
  seed: string
  riddleId: string
  prompt: string
  nudge: string
  difficulty: string
  lattice: {
    size: number
    cells: { row: number; col: number; letter: string }[]
    path: { row: number; col: number }[]
  }
  /** SHA-256 of the canonical riddle answer alone */
  answerDigest: string
  /** SHA-256 of normalizeBinding(answer, filament) */
  bindingDigest: string
}

export type ForgedChallenge = PublicChallenge & {
  /** Host-only proof token — never embed in share links */
  seal: string
}

export function normalizeBinding(answer: string, filament: string): string {
  const a = answer
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
  const f = filament.trim().toLowerCase().replace(/[^a-z]/g, '')
  return `${a}·${f}`
}

export function parseAttempt(raw: string): { answer: string; filament: string } | null {
  const cleaned = raw.trim().toLowerCase()
  const delim = cleaned.split(/\s*[·:|]\s*|\s+with\s+|\s+then\s+/)
  if (delim.length >= 2) {
    const filament = delim[delim.length - 1]!.trim()
    const answer = delim.slice(0, -1).join(' ').trim()
    if (answer && filament) return { answer, filament }
  }
  const space = cleaned.split(/\s+/)
  if (space.length === 2) return { answer: space[0]!, filament: space[1]! }
  if (space.length > 2) {
    return {
      answer: space.slice(0, -1).join(' '),
      filament: space[space.length - 1]!,
    }
  }
  return null
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function mintSeal(binding: string, seed: string): Promise<string> {
  const digest = await sha256Hex(`${seed}::${binding}::loom-v1`)
  const a = digest.slice(0, 4).toUpperCase()
  const b = digest.slice(4, 8).toUpperCase()
  const c = digest.slice(8, 12).toUpperCase()
  return `LOOM-${a}-${b}-${c}`
}

export function encodeSeed(bytes?: number): string {
  const arr = new Uint8Array(bytes ?? 6)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function publicLattice(full: ReturnType<typeof buildLattice>): PublicChallenge['lattice'] {
  return {
    size: full.size,
    cells: full.cells.map(({ row, col, letter }) => ({ row, col, letter })),
    path: full.path,
  }
}

export async function forgeChallenge(seedInput?: string): Promise<ForgedChallenge> {
  const seed = (seedInput?.trim() || encodeSeed()).toLowerCase()
  const riddle = riddleByIndex(hashSeed(seed + ':riddle'))
  const filament = pickFilament(seed)
  const lattice = buildLattice(seed, filament)
  const binding = normalizeBinding(riddle.answer, filament)
  const answerDigest = await sha256Hex(riddle.answer.trim().toLowerCase())
  const bindingDigest = await sha256Hex(binding)
  const seal = await mintSeal(binding, seed)

  return {
    seed,
    riddleId: riddle.id,
    prompt: riddle.prompt,
    nudge: riddle.nudge,
    difficulty: riddle.difficulty,
    lattice: publicLattice(lattice),
    answerDigest,
    bindingDigest,
    seal,
  }
}

/** Rebuild a public challenge from a share seed (no seal in the object). */
export async function challengeFromSeed(seedInput: string): Promise<PublicChallenge | null> {
  const seed = seedInput.trim().toLowerCase()
  if (!/^[a-f0-9]{8,16}$/.test(seed)) return null
  const forged = await forgeChallenge(seed)
  const { seal: _seal, ...pub } = forged
  return pub
}

export async function verifyAttempt(
  challenge: PublicChallenge,
  raw: string,
): Promise<{ ok: true; seal: string } | { ok: false; reason: string }> {
  const parsed = parseAttempt(raw)
  if (!parsed) {
    return {
      ok: false,
      reason: 'Speak both halves: the answer, then the filament the thread reveals.',
    }
  }

  const binding = normalizeBinding(parsed.answer, parsed.filament)
  const digest = await sha256Hex(binding)
  if (digest !== challenge.bindingDigest) {
    // Timing-safe-ish compare already via hash; give progressive help only via nudge elsewhere
    return { ok: false, reason: 'The binding does not hold. Look again.' }
  }

  const seal = await mintSeal(binding, challenge.seed)
  return { ok: true, seal }
}

/** True when the attempt matches this challenge's riddle answer (filament still required). */
export async function matchesChallengeAnswer(
  challenge: PublicChallenge,
  answer: string,
): Promise<boolean> {
  const attempt = await sha256Hex(answer.trim().toLowerCase())
  return attempt === challenge.answerDigest
}

export type HostLedgerEntry = {
  seed: string
  seal: string
  riddleId: string
  createdAt: number
  label?: string
}

const LEDGER_KEY = 'loom.host.ledger.v1'

export function loadLedger(): HostLedgerEntry[] {
  try {
    const raw = localStorage.getItem(LEDGER_KEY)
    if (!raw) return []
    return JSON.parse(raw) as HostLedgerEntry[]
  } catch {
    return []
  }
}

export function saveLedgerEntry(entry: HostLedgerEntry) {
  const list = loadLedger().filter((e) => e.seed !== entry.seed)
  list.unshift(entry)
  localStorage.setItem(LEDGER_KEY, JSON.stringify(list.slice(0, 40)))
}

export function findSealInLedger(seal: string): HostLedgerEntry | undefined {
  const normalized = seal.trim().toUpperCase()
  return loadLedger().find((e) => e.seal === normalized)
}
