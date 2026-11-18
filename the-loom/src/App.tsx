import { useEffect, useMemo, useState } from 'react'
import { HeroThreads } from './components/HeroThreads'
import {
  challengeFromSeed,
  findSealInLedger,
  forgeChallenge,
  loadLedger,
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
        if (!ch) setFeedback('This contest link is invalid.')
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
      return
    }
    const next = tries + 1
    setTries(next)
    if (next >= 3) setShowNudge(true)
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
            New contest
          </button>
          <button
            type="button"
            className={view === 'ledger' ? 'active' : ''}
            onClick={() => {
              setLedger(loadLedger())
              setView('ledger')
            }}
          >
            Prize desk
          </button>
        </nav>
      </header>

      {view === 'home' && (
        <main className="hero">
          <HeroThreads />
          <div className="hero-copy">
            <p className="eyebrow">Sunday contest riddles</p>
            <h1 className="brand-hero">The Loom</h1>
            <p className="lede">
              Classic think-riddles — the kind you could print in the paper.
              First person with the right answer gets the seal. That seal is
              the claim ticket.
            </p>
            <div className="cta-row">
              <button type="button" className="btn primary" onClick={() => void onForge()} disabled={busy}>
                {busy ? 'Printing…' : 'Post a contest riddle'}
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => {
                  setLedger(loadLedger())
                  setView('ledger')
                }}
              >
                Check a claim seal
              </button>
            </div>
          </div>
        </main>
      )}

      {view === 'home' && (
        <section className="how">
          <h2>How the contest works</h2>
          <p className="section-lede">
            No scavenger hunts. No apps to install. Just a riddle worth chewing on.
          </p>
          <ol className="steps">
            <li>
              <strong>You post the riddle</strong>
              <span>
                Share the contest link — a clean question about everyday things,
                like a Mustang, a kettle, a road.
              </span>
            </li>
            <li>
              <strong>They think</strong>
              <span>
                Anyone can work on it at the kitchen table. Exact wording wins;
                close guesses do not.
              </span>
            </li>
            <li>
              <strong>The seal is the prize ticket</strong>
              <span>
                The first correct answer mints a <code>LOOM-XXXX-XXXX-XXXX</code>{' '}
                seal. They show you that code. You check it at the prize desk —
                so a vague “I know it” or an AI paraphrase cannot cash in.
              </span>
            </li>
          </ol>
        </section>
      )}

      {view === 'forge' && forged && (
        <main className="panel forge-panel">
          <header className="panel-head">
            <h1>Contest desk</h1>
            <p>
              Publish the riddle link. Keep the seal private — it is your master
              ticket for whoever claims the prize.
            </p>
          </header>

          <div className="forge-grid">
            <article className="share-card">
              <h2>Riddle to publish</h2>
              <p className="riddle-text">{forged.prompt}</p>
              <div className="field-block">
                <label>Contest link</label>
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
                Open as a solver
              </button>
            </article>

            <article className="seal-card">
              <h2>Prize seal</h2>
              <p className="warn">
                Do not print this next to the riddle. Anyone who brings you this
                exact code has the winning answer for contest{' '}
                <code>{forged.seed}</code>.
              </p>
              <p className="seal-display">{forged.seal}</p>
              <button
                type="button"
                className="btn small"
                onClick={() => copyText('seal', forged.seal)}
              >
                {copied === 'seal' ? 'Copied' : 'Copy seal'}
              </button>
              <p className="fine">Saved to your prize desk in this browser.</p>
            </article>
          </div>

          <div className="forge-actions">
            <button type="button" className="btn ghost" onClick={() => void onForge()} disabled={busy}>
              Draw another riddle
            </button>
          </div>
        </main>
      )}

      {view === 'challenge' && (
        <main className="panel challenge-panel">
          {busy && !challenge && <p className="loading">Setting the type…</p>}
          {challenge && (
            <>
              <header className="panel-head">
                <p className="eyebrow">Contest riddle</p>
                <h1>What’s the answer?</h1>
                <p>
                  Sit with it. When you know — type the exact answer. A correct
                  entry mints your claim seal.
                </p>
              </header>

              <blockquote className="riddle-block">{challenge.prompt}</blockquote>

              <form className="attempt-form" onSubmit={(e) => void onSubmit(e)}>
                <label htmlFor="answer">Your answer</label>
                <p className="format-hint">
                  One word or a short phrase. Spelling counts.
                </p>
                <input
                  id="answer"
                  value={attempt}
                  onChange={(e) => setAttempt(e.target.value)}
                  placeholder="e.g. mustang"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={Boolean(wonSeal)}
                />
                {!wonSeal && (
                  <button type="submit" className="btn primary" disabled={!attempt.trim()}>
                    Submit for the seal
                  </button>
                )}
              </form>

              {feedback && <p className="feedback">{feedback}</p>}
              {showNudge && !wonSeal && <p className="nudge">{challenge.nudge}</p>}

              {wonSeal && (
                <div className="victory">
                  <h2>You earned the seal</h2>
                  <p>
                    Show this code to the contest host. It proves you had the
                    exact answer — without spoiling it in the comments.
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
            <h1>Prize desk</h1>
            <p>
              Someone claims they solved it? Paste their seal. If it matches a
              contest you posted in this browser, the claim is good.
            </p>
          </header>

          <form
            className="verify-form"
            onSubmit={(e) => {
              e.preventDefault()
              const hit = findSealInLedger(verifyInput)
              if (hit) {
                setVerifyResult(
                  `Valid claim — posted ${new Date(hit.createdAt).toLocaleString('en-US', { timeZone: 'America/Denver' })} MT · contest ${hit.seed}`,
                )
              } else {
                setVerifyResult(
                  'No match on this prize desk. Wrong seal, or the contest was forged on another device.',
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
              Verify claim
            </button>
          </form>
          {verifyResult && <p className="feedback">{verifyResult}</p>}

          <h2 className="subhead">Your posted contests</h2>
          {ledger.length === 0 ? (
            <p className="empty">No contests yet. Post a riddle to begin.</p>
          ) : (
            <ul className="ledger-list">
              {ledger.map((entry) => (
                <li key={entry.seed}>
                  <code className="seal-inline">{entry.seal}</code>
                  <span className="ledger-meta">
                    {new Date(entry.createdAt).toLocaleString('en-US', {
                      timeZone: 'America/Denver',
                    })}{' '}
                    MT ·{' '}
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => void openChallenge(entry.seed)}
                    >
                      open
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

      <footer className="footer">
        <p>
          Newspaper-style riddles. Exact answers. The seal is how the winner
          proves it — not a screenshot of a chat with an AI.
        </p>
      </footer>
    </div>
  )
}
