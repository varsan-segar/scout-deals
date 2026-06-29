type ConfidenceLevel = 'high' | 'medium' | 'low'

interface CertaintySignalProps {
  level: ConfidenceLevel
  source?: string | null
}

const CONFIG = {
  high:   { bars: 3, color: 'var(--conf-high)',   label: 'HIGH',  bg: 'var(--conf-high-bg)',   border: 'var(--conf-high-border)' },
  medium: { bars: 2, color: 'var(--conf-medium)', label: 'MED',   bg: 'var(--conf-medium-bg)', border: 'var(--conf-medium-border)' },
  low:    { bars: 1, color: 'var(--conf-low)',     label: 'LOW',   bg: 'var(--conf-low-bg)',    border: 'var(--conf-low-border)' },
}

export function CertaintySignal({ level, source }: CertaintySignalProps) {
  const normalizedLevel = (level?.toString().trim().toLowerCase() as ConfidenceLevel) || 'low'
  const c = CONFIG[normalizedLevel] || CONFIG.low
  return (
    <span
      className="certainty-signal"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      {[1, 2, 3].map(i => (
        <span
          key={i}
          className={`certainty-bar ${i > c.bars ? 'inactive' : ''}`}
          style={i <= c.bars ? { background: c.color } : undefined}
        />
      ))}
      <span style={{ color: c.color }}>{c.label}</span>
      {source && (
        <a href={source} target="_blank" rel="noopener noreferrer" className="certainty-source">↗</a>
      )}
    </span>
  )
}
