import { useEffect, useMemo, useState } from 'react'
import { FilamentLattice } from './components/FilamentLattice'
import { HeroThreads } from './components/HeroThreads'
import {
  challengeFromSeed,
  findSealInLedger,
  forgeChallenge,
  loadLedger,
  matchesChallengeAnswer,
  saveLedgerEntry,
  verifyAttempt,
  type ForgedChallenge,
  type HostLedgerEntry,
  type PublicChallenge,
} from './engine/seal'

type View = 'home' | 'forge' | 'challenge' | 'ledger'

function readSeedFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  return params.get('c')
}

function setUrlSeed(seed: string | null) {
  const url = new URL(window.location.href)
  if (seed) url.searchParams.set('c', seed)
  else url.searchParams.delete('c')
  window.history.replaceState({}, '', url.toString())
}

export default function App() {
  const initialSeed = useMemo(() => readSeedFromUrl(), [])
  const [view, setView] = useState<View>(initialSeed ? 'challenge' : 'home')
  const [forged, setForged] = useState<ForgedChallenge | null>(null)
  const [challenge, setChallenge] = useState<PublicChallenge | null>(null)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [wonSeal, setWonSeal] = useState<string | null>(null)
  const [tries, setTries] = useState(0)
  const [showNudge, setShowNudge] = useState(false)
  const [emphasizeThread, setEmphasizeThread] = useState(false)
  const [ledger, setLedger] = useState<HostLedgerEntry[]>(() => loadLedger())
  const [verifyInput, setVerifyInput] = useState('')
  const [verifyResult, setVerifyResult] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (!initialSeed) return
    let cancelled = false
    ;(async () => {
      setBusy(true)
      const ch = await challengeFromSeed(initialSeed)
      if (!cancelled) {
        setChallenge(ch)
        setBusy(false)
        if (!ch) setFeedback('This loom seed is malformed.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [initialSeed])

  useEffect(() => {
    setShareUrl(window.location.origin + window.location.pathname)
  }, [])

  async function onForge() {
    setBusy(true)
    setFeedback(null)
    setWonSeal(null)
    const ch = await forgeChallenge()
    setForged(ch)
    saveLedgerEntry({
      seed: ch.seed,
      seal: ch.seal,
      riddleId: ch.riddleId,
      createdAt: Date.now(),
    })
    setLedger(loadLedger())
    setUrlSeed(null)
    setView('forge')
    setBusy(false)
  }

  async function openChallenge(seed: string) {
    setBusy(true)
    setWonSeal(null)
    setAttempt('')
    setFeedback(null)
    setTries(0)
    setShowNudge(false)
    setEmphasizeThread(false)
    const ch = await challengeFromSeed(seed)
    setChallenge(ch)
    setUrlSeed(seed)
    setView('challenge')
    setBusy(false)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!challenge || wonSeal) return
    setFeedback(null)
    const result = await verifyAttempt(challenge, attempt)
    if (result.ok) {
      setWonSeal(result.seal)
      setFeedback(null)
      setEmphasizeThread(true)
      return
    }
    const next = tries + 1
    setTries(next)
    if (next >= 2) setEmphasizeThread(true)
    if (next >= 3) setShowNudge(true)

    const tokens = attempt.trim().split(/\s+/)
    const maybeAnswer =
      tokens.length === 1 ? tokens[0]! : tokens.slice(0, -1).join(' ')
    if (maybeAnswer && (await matchesChallengeAnswer(challenge, maybeAnswer))) {
      setFeedback(
        'That may be the riddle — but a riddle alone cannot mint a seal. Find the filament.',
      )
      return
    }
    setFeedback(result.reason)
  }

  function copyText(label: string, text: string) {
    void navigator.clipboard.writeText(text)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1600)
  }

  function goHome() {
    setUrlSeed(null)
    setView('home')
    setWonSeal(null)
    setFeedback(null)
  }

  const challengeLink = forged
    ? `${shareUrl}?c=${forged.seed}`
    : challenge
      ? `${shareUrl}?c=${challenge.seed}`
      : shareUrl

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <header className="topbar">
        <button type="button" className="brand" onClick={goHome}>
          <span className="brand-mark" aria-hidden="true" />
          The Loom
        </button>
        <nav className="nav">
          <button type="button" className={view === 'home' ? 'active' : ''} onClick={goHome}>
            Home
          </button>
          <button
            type="button"
            className={view === 'forge' ? 'active' : ''}
            onClick={() => void onForge()}
            disabled={busy}
          >
            Forge
          </button>
          <button
            type="button"
            className={view === 'ledger' ? 'active' : ''}
            onClick={() => {
              setLedger(loadLedger())
              setView('ledger')
            }}
          >
            Host ledger
          </button>
        </nav>
      </header>

      {view === 'home' && (
        <main className="hero">
          <HeroThreads />
          <div className="hero-copy">
            <p className="eyebrow">Riddle machine</p>
            <h1 className="brand-hero">The Loom</h1>
            <p className="lede">
              Forges mind-teasing riddles sealed with a second secret woven into
              the page — so pasting the question into an AI cannot mint the key.
            </p>
            <div className="cta-row">
              <button type="button" className="btn primary" onClick={() => void onForge()} disabled={busy}>
                {busy ? 'Spinning…' : 'Forge a sealed riddle'}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setLedger(loadLedger())
                  setView('ledger')
                }}
              >
                Verify a seal
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'home' && (
        <section className="how">
          <h2>How the lock works</h2>
          <p className="section-lede">
            One question. Two secrets. One proof.
          </p>
          <ol className="steps">
            <li>
              <strong>The riddle</strong>
              <span>
                A fair lateral puzzle that feels solvable — precise answer required.
              </span>
            </li>
            <li>
              <strong>The filament</strong>
              <span>
                An instance-specific word spelled by a copper thread in the letter
                lattice. It never appears in the riddle text you might paste elsewhere.
              </span>
            </li>
            <li>
              <strong>The seal</strong>
              <span>
                Only the correct binding — answer plus filament — mints a{' '}
                <code>LOOM-XXXX-XXXX-XXXX</code> key. Solvers show you the seal; you
                check it in your host ledger. Near-misses and AI paraphrases fail.
              </span>
            </li>
          </ol>
        </section>
      )}

      {view === 'forge' && forged && (
        <main className="panel forge-panel">
          <header className="panel-head">
            <h1>Host forge</h1>
            <p>
              Share the challenge link. Keep the seal private — it is your proof
              key when someone claims they solved it.
            </p>
          </header>

          <div className="forge-grid">
            <article className="share-card">
              <h2>Challenge to share</h2>
              <p className="riddle-text">{forged.prompt}</p>
              <div className="field-block">
                <label>Share link</label>
                <div className="copy-row">
                  <code>{challengeLink}</code>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => copyText('link', challengeLink)}
                  >
                    {copied === 'link' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => void openChallenge(forged.seed)}
              >
                Open as solver
              </button>
            </article>

            <article className="seal-card">
              <h2>Host seal</h2>
              <p className="warn">
                Do not post this with the riddle. Anyone who shows you this exact
                code has bound both secrets for seed <code>{forged.seed}</code>.
              </p>
              <p className="seal-display">{forged.seal}</p>
              <button
                type="button"
                className="btn small"
                onClick={() => copyText('seal', forged.seal)}
              >
                {copied === 'seal' ? 'Copied' : 'Copy seal'}
              </button>
              <p className="fine">
                Saved to your host ledger in this browser. Difficulty:{' '}
                <em>{forged.difficulty}</em>
              </p>
            </article>
          </div>

          <div className="forge-actions">
            <button type="button" className="btn ghost" onClick={() => void onForge()} disabled={busy}>
              Forge another
            </button>
          </div>
        </main>
      )}

      {view === 'challenge' && (
        <main className="panel challenge-panel">
          {busy && !challenge && <p className="loading">Threading the loom…</p>}
          {challenge && (
            <>
              <header className="panel-head">
                <p className="eyebrow">Sealed challenge · {challenge.difficulty}</p>
                <h1>Untie the binding</h1>
              </header>

              <blockquote className="riddle-block">{challenge.prompt}</blockquote>

              <FilamentLattice
                size={challenge.lattice.size}
                cells={challenge.lattice.cells}
                path={challenge.lattice.path}
                emphasize={emphasizeThread}
                revealed={Boolean(wonSeal)}
              />

              <form className="attempt-form" onSubmit={(e) => void onSubmit(e)}>
                <label htmlFor="binding">Your binding</label>
                <p className="format-hint">
                  Format: <code>answer filament</code> — the riddle’s answer, then
                  the word the thread spells.
                </p>
                <input
                  id="binding"
                  value={attempt}
                  onChange={(e) => setAttempt(e.target.value)}
                  placeholder="e.g. shadow ember"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={Boolean(wonSeal)}
                />
                {!wonSeal && (
                  <button type="submit" className="btn primary" disabled={!attempt.trim()}>
                    Mint the seal
                  </button>
                )}
              </form>

              {feedback && <p className="feedback">{feedback}</p>}
              {showNudge && !wonSeal && (
                <p className="nudge">{challenge.nudge}</p>
              )}

              {wonSeal && (
                <div className="victory">
                  <h2>Seal minted</h2>
                  <p>
                    Show this code to the host. It proves you bound both secrets
                    for this loom — without spoiling the answer in chat.
                  </p>
                  <p className="seal-display">{wonSeal}</p>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() => copyText('won', wonSeal)}
                  >
                    {copied === 'won' ? 'Copied' : 'Copy seal'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      )}

      {view === 'ledger' && (
        <main className="panel ledger-panel">
          <header className="panel-head">
            <h1>Host ledger</h1>
            <p>
              Paste a seal someone claims. If it matches a riddle you forged in
              this browser, the claim holds.
            </p>
          </header>

          <form
            className="verify-form"
            onSubmit={(e) => {
              e.preventDefault()
              const hit = findSealInLedger(verifyInput)
              if (hit) {
                setVerifyResult(
                  `Valid — forged ${new Date(hit.createdAt).toLocaleString('en-US', { timeZone: 'America/Denver' })} MT · seed ${hit.seed} · ${hit.riddleId}`,
                )
              } else {
                setVerifyResult(
                  'No match in this browser’s ledger. Either the seal is wrong, or it was forged on another device.',
                )
              }
            }}
          >
            <label htmlFor="seal-check">Claimed seal</label>
            <input
              id="seal-check"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="LOOM-XXXX-XXXX-XXXX"
              spellCheck={false}
            />
            <button type="submit" className="btn primary">
              Verify
            </button>
          </form>
          {verifyResult && <p className="feedback">{verifyResult}</p>}

          <h2 className="subhead">Your forged seals</h2>
          {ledger.length === 0 ? (
            <p className="empty">No seals yet. Forge a riddle to begin.</p>
          ) : (
            <ul className="ledger-list">
              {ledger.map((entry) => (
                <li key={entry.seed}>
                  <code className="seal-inline">{entry.seal}</code>
                  <span className="ledger-meta">
                    {new Date(entry.createdAt).toLocaleString('en-US', {
                      timeZone: 'America/Denver',
                    })}{' '}
                    MT · <button type="button" className="linkish" onClick={() => void openChallenge(entry.seed)}>open</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

      <footer className="footer">
        <p>
          The Loom never puts the filament inside the riddle text. AI that only
          sees the question cannot mint a seal.
        </p>
      </footer>
    </div>
  )
}
