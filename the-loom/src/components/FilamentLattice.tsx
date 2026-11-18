import { useEffect, useMemo, useState } from 'react'

type Cell = { row: number; col: number; letter: string }
type PathPt = { row: number; col: number }

type Props = {
  size: number
  cells: Cell[]
  path: PathPt[]
  /** When true, thread animates more obviously after the solver asks for a hint */
  emphasize?: boolean
  revealed?: boolean
}

const CELL = 44
const GAP = 10
const PAD = 18

export function FilamentLattice({ size, cells, path, emphasize, revealed }: Props) {
  const [progress, setProgress] = useState(0)
  const [tracing, setTracing] = useState(false)

  const width = PAD * 2 + size * CELL + (size - 1) * GAP
  const height = width

  const centers = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        map.set(`${r},${c}`, {
          x: PAD + c * (CELL + GAP) + CELL / 2,
          y: PAD + r * (CELL + GAP) + CELL / 2,
        })
      }
    }
    return map
  }, [size])

  const pathPoints = useMemo(
    () =>
      path.map((p) => centers.get(`${p.row},${p.col}`)!).filter(Boolean),
    [path, centers],
  )

  const polyline = pathPoints.map((p) => `${p.x},${p.y}`).join(' ')

  useEffect(() => {
    if (!tracing && !emphasize) {
      setProgress(0.22)
      return
    }
    let frame = 0
    let raf = 0
    const tick = () => {
      frame += 1
      const target = emphasize || tracing ? 1 : 0.35
      setProgress((p) => Math.min(target, p + 0.012))
      if (frame < 120) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [tracing, emphasize])

  const dash = useMemo(() => {
    let len = 0
    for (let i = 1; i < pathPoints.length; i++) {
      const a = pathPoints[i - 1]!
      const b = pathPoints[i]!
      len += Math.hypot(b.x - a.x, b.y - a.y)
    }
    return len
  }, [pathPoints])

  return (
    <div className="lattice-wrap">
      <div className="lattice-meta">
        <span className="lattice-label">The filament</span>
        <p>
          A copper thread wanders the lattice. Trace it — by eye or by dragging —
          and read the letters it kisses, in order. That word is the second half
          of the binding.
        </p>
      </div>

      <svg
        className={`lattice ${emphasize ? 'lattice-hot' : ''} ${revealed ? 'lattice-revealed' : ''}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Letter lattice with a wandering filament thread"
        onPointerDown={() => setTracing(true)}
        onPointerUp={() => setTracing(false)}
        onPointerLeave={() => setTracing(false)}
      >
        <defs>
          <linearGradient id="threadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b86a32" />
            <stop offset="50%" stopColor="#e0a15a" />
            <stop offset="100%" stopColor="#7a9e94" />
          </linearGradient>
          <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {cells.map((cell) => {
          const x = PAD + cell.col * (CELL + GAP)
          const y = PAD + cell.row * (CELL + GAP)
          return (
            <g key={`${cell.row}-${cell.col}`}>
              <rect
                x={x}
                y={y}
                width={CELL}
                height={CELL}
                rx="8"
                className="lattice-cell"
              />
              <text
                x={x + CELL / 2}
                y={y + CELL / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                className="lattice-letter"
              >
                {cell.letter}
              </text>
            </g>
          )
        })}

        <polyline
          points={polyline}
          fill="none"
          stroke="url(#threadGrad)"
          strokeWidth={emphasize || tracing || revealed ? 3.2 : 2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#softGlow)"
          strokeDasharray={dash}
          strokeDashoffset={dash * (1 - progress)}
          opacity={revealed ? 1 : emphasize ? 0.95 : 0.72}
          className="lattice-thread"
        />

        {pathPoints[0] && (
          <circle
            cx={pathPoints[0].x}
            cy={pathPoints[0].y}
            r={4.5}
            className="lattice-node start"
          />
        )}
        {pathPoints[pathPoints.length - 1] && progress > 0.85 && (
          <circle
            cx={pathPoints[pathPoints.length - 1]!.x}
            cy={pathPoints[pathPoints.length - 1]!.y}
            r={4.5}
            className="lattice-node end"
          />
        )}
      </svg>

      <p className="lattice-hint-line">
        Hold on the lattice to draw the thread brighter. Start at the marked node.
      </p>
    </div>
  )
}
