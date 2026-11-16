import { useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
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
  const [status, setStatus] = useState('Ready — tap Generate anytime')
  // Start with 3D off so Generate/Download always respond; user can enable preview.
  const [show3d, setShow3d] = useState(false)

  const designRef = useRef(design)
  const genBtnRef = useRef<HTMLButtonElement>(null)
  const dlBtnRef = useRef<HTMLButtonElement>(null)
  designRef.current = design

  useEffect(() => {
    const genBtn = genBtnRef.current
    const dlBtn = dlBtnRef.current
    if (!genBtn || !dlBtn) return

    const onGenerate = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      const prev = designRef.current
      const next = generateDesign(freshSeed())
      setFlash(true)
      setHistory((h) => [prev, ...h].slice(0, HISTORY_MAX))
      setDesign(next)
      setGenCount((n) => n + 1)
      setStatus(`New design: ${next.name}`)
      // Direct DOM feedback even if React paint stalls
      const live = document.getElementById('live-status')
      if (live) live.textContent = `New design: ${next.name}`
      const title = document.getElementById('design-title')
      if (title) title.textContent = next.name
      const count = document.getElementById('design-count')
      if (count) count.textContent = String(Number(count.textContent || '0') + 1).padStart(3, '0')
    }

    const onDownload = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      const current = designRef.current
      setStatus(`Building STL for ${current.name}…`)
      try {
        downloadStl(current)
        setStatus(`Downloaded ${current.name}.stl`)
        const live = document.getElementById('live-status')
        if (live) live.textContent = `Downloaded ${current.name}.stl`
      } catch (err) {
        console.error(err)
        setStatus('STL failed — generate again and retry')
        window.alert('Could not build STL. Tap Generate, then try Download again.')
      }
    }

    genBtn.addEventListener('click', onGenerate)
    dlBtn.addEventListener('click', onDownload)

    return () => {
      genBtn.removeEventListener('click', onGenerate)
      dlBtn.removeEventListener('click', onDownload)
    }
  }, [])

  useEffect(() => {
    if (!flash) return
    const t = window.setTimeout(() => setFlash(false), 420)
    return () => window.clearTimeout(t)
  }, [flash, design.id])

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
          Design <span id="design-count">{String(genCount).padStart(3, '0')}</span>
        </p>
      </header>

      <section className="control-deck">
        <div className="control-copy">
          <p className="eyebrow">{archetypeTitle(design.archetype)}</p>
          <h1 key={design.id} className="title" id="design-title">
            {design.name}
          </h1>
          <p className="tagline">{design.tagline}</p>
        </div>

        <div className="cta-row">
          <button ref={genBtnRef} id="btn-generate" type="button" className="btn btn-primary">
            Generate new design
          </button>
          <button ref={dlBtnRef} id="btn-download" type="button" className="btn btn-ghost">
            Download STL
          </button>
        </div>
        <p className="status-line" id="live-status" role="status">
          {status}
        </p>
        <div className="viewer-toggles">
          <button type="button" className="btn btn-ghost btn-small" onClick={() => setShow3d((v) => !v)}>
            {show3d ? 'Hide 3D preview' : 'Show 3D preview'}
          </button>
        </div>
      </section>

      <main className="stage">
        {show3d ? (
          <section className={`hero-visual ${flash ? 'is-regen' : ''}`}>
            <ErrorBoundary>
              <FigureViewer spec={design} />
            </ErrorBoundary>
          </section>
        ) : (
          <section className="hero-visual viewer-fallback">
            <p>3D preview hidden — Generate and Download still work.</p>
          </section>
        )}

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
