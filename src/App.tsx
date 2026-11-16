import { useCallback, useState } from 'react'
import { CryptexViewer } from './components/CryptexViewer'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LOCK_CODE_LABEL, cryptexPrintNotes } from './lib/cryptex'
import './App.css'

export default function App() {
  const [status, setStatus] = useState(`Code locked to ${LOCK_CODE_LABEL} — download the printable STL`)
  const [show3d, setShow3d] = useState(true)

  const onDownload = useCallback(() => {
    setStatus('Downloading STL…')
    // Prefer prebuilt printable file (clearance-aware solids)
    const a = document.createElement('a')
    a.href = `/pulseform-cryptex-${LOCK_CODE_LABEL}.stl`
    a.download = `pulseform-cryptex-${LOCK_CODE_LABEL}.stl`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setStatus(`Downloaded pulseform-cryptex-${LOCK_CODE_LABEL}.stl`)
  }, [])

  return (
    <div className="app">
      <div className="atmos" aria-hidden />
      <header className="top">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <p className="brand-name">Pulseform</p>
            <p className="brand-sub">Printable lock vault</p>
          </div>
        </div>
        <p className="gen-meter">
          Code <span>{LOCK_CODE_LABEL}</span>
        </p>
      </header>

      <section className="control-deck">
        <div className="control-copy">
          <p className="eyebrow">One-print cylinder lock</p>
          <h1 className="title">Cryptex Vault {LOCK_CODE_LABEL}</h1>
          <p className="tagline">
            Bike-lock style sliding cylinder with four moving dials. Only code {LOCK_CODE_LABEL} lines up the
            internal gates so the vault nose slides open — stash cavity inside for a key, USB, note, or ring.
          </p>
        </div>

        <div className="cta-row">
          <button type="button" className="btn btn-primary" id="btn-download" onClick={onDownload}>
            Download STL
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setShow3d((v) => !v)}>
            {show3d ? 'Hide 3D preview' : 'Show 3D preview'}
          </button>
        </div>
        <p className="status-line" id="live-status" role="status">
          {status}
        </p>
      </section>

      <main className="stage">
        {show3d ? (
          <section className="hero-visual">
            <ErrorBoundary>
              <CryptexViewer />
            </ErrorBoundary>
          </section>
        ) : (
          <section className="hero-visual viewer-fallback">
            <p>3D preview hidden — STL download still works.</p>
          </section>
        )}

        <section className="hero-meta">
          <dl className="meta">
            <div>
              <dt>How it opens</dt>
              <dd>
                Spin each dial so the amber tick faces the amber witness ridge on the housing. Sequence from rear
                to nose: <strong>6 · 7 · 6 · 7</strong>. Pull the light grip — the vault slides out.
              </dd>
            </div>
            <div>
              <dt>Inside</dt>
              <dd>
                Cylindrical stash pocket ~22mm diameter × 42mm deep. One-print moving dials + sliding vault with
                ~0.4mm FDM clearance.
              </dd>
            </div>
            <div>
              <dt>Print</dt>
              <dd>{cryptexPrintNotes()}</dd>
            </div>
            <div>
              <dt>Sell idea</dt>
              <dd>
                Gift-shop puzzle vaults, proposal ring boxes, USB dead-drops, escape-room props. Unpainted $22–$35 ·
                painted $45–$70.
              </dd>
            </div>
          </dl>
        </section>
      </main>

      <footer className="foot">
        <p>
          Pulseform Cryptex Vault — original generative printable lock. Correct combination factory-set to{' '}
          {LOCK_CODE_LABEL}. Free the dials gently after printing before first unlock.
        </p>
      </footer>
    </div>
  )
}
