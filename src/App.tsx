import { useCallback, useEffect, useState } from 'react'
import { FigureViewer } from './components/FigureViewer'
import {
  archetypeTitle,
  freshSeed,
  generateDesign,
  type DesignSpec,
} from './lib/designs'
import { downloadStl } from './lib/stl'
import './App.css'

const HISTORY_MAX = 12

export default function App() {
  const [design, setDesign] = useState<DesignSpec>(() => generateDesign(freshSeed()))
  const [history, setHistory] = useState<DesignSpec[]>([])
  const [flash, setFlash] = useState(false)
  const [genCount, setGenCount] = useState(1)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const regenerate = useCallback(() => {
    if (busy) return
    setBusy(true)
    setFlash(true)
    setStatus('Forging a new figure…')
    const prev = design
    const next = generateDesign(freshSeed())
    setHistory((h) => [prev, ...h].slice(0, HISTORY_MAX))
    setDesign(next)
    setGenCount((n) => n + 1)
    setStatus(`Ready: ${next.name}`)
    window.setTimeout(() => setBusy(false), 250)
  }, [busy, design])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(false), 420)
    return () => window.clearTimeout(t)
  }, [flash, design.id])

  const onDownload = useCallback(() => {
    setStatus('Building STL…')
    try {
      downloadStl(design)
      setStatus(`Downloaded ${design.name}.stl`)
    } catch {
      setStatus('STL failed — try Generate again')
    }
  }, [design])

  const restore = (item: DesignSpec) => {
    setHistory((h) => [design, ...h.filter((d) => d.id !== item.id)].slice(0, HISTORY_MAX))
    setDesign(item)
    setStatus(`Restored ${item.name}`)
  }

  return (
    <div className="app">
      <div className="atmos" aria-hidden />
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">Pulseform</p>
            <p className="brand-sub">AI print design lab</p>
          </div>
        </div>
        <p className="gen-meter">
          Design <span>{String(genCount).padStart(3, '0')}</span>
        </p>
      </header>

      <section className="control-deck">
        <div className="control-copy">
          <p className="eyebrow">{archetypeTitle(design.archetype)}</p>
          <h1 key={design.id} className="title">
            {design.name}
          </h1>
          <p className="tagline">{design.tagline}</p>
        </div>

        <div className="cta-row">
          <button
            type="button"
            className={`btn btn-primary ${busy ? 'is-busy' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              regenerate()
            }}
          >
            {busy ? 'Forging…' : 'Generate new design'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDownload()
            }}
          >
            Download STL
          </button>
        </div>
        {status ? <p className="status-line" role="status">{status}</p> : null}
      </section>

      <main className="stage">
        <section className={`hero-visual ${flash ? 'is-regen' : ''}`}>
          <FigureViewer spec={design} />
        </section>

        <section className="hero-meta">
          <dl className="meta">
            <div>
              <dt>Print</dt>
              <dd>{design.printNotes}</dd>
            </div>
            <div>
              <dt>Sell idea</dt>
              <dd>{design.businessIdea}</dd>
            </div>
            <div>
              <dt>Price band</dt>
              <dd>{design.priceHint}</dd>
            </div>
          </dl>

          <div className="swatches" aria-label="Color palette">
            {design.palette.map((c) => (
              <span key={c} style={{ background: c }} title={c} />
            ))}
          </div>
        </section>
      </main>

      {history.length > 0 && (
        <section className="history">
          <div className="history-head">
            <h2>Recent regenerations</h2>
            <p>Tap any to restore and download again.</p>
          </div>
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => restore(item)}>
                  <span className="hist-swatch" style={{ background: item.palette[0] }} />
                  <span className="hist-text">
                    <strong>{item.name}</strong>
                    <em>{archetypeTitle(item.archetype)}</em>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="foot">
        <p>
          Original generative figures for FDM printing — not affiliated with any movie studio or toy brand.
          Keep regenerating until you find a hit, then print and sell.
        </p>
      </footer>
    </div>
  )
}
