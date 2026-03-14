export function OutputStep({ data, lang, stepMeta }) {
  const { lines = [] } = data
  const outLines = lines.filter((line) => line.type === 'out')
  const errorLines = lines.filter((line) => line.type === 'error')

  const langFlavour = {
    python: { runtime: 'CPython PVM', journey: 'Bytecode -> PVM' },
    java: { runtime: 'JVM (HotSpot)', journey: 'Bytecode -> JVM' },
    c: { runtime: 'Native binary (CPU)', journey: 'Assembly -> CPU' },
    cpp: { runtime: 'Native binary (CPU)', journey: 'Compilation -> CPU' },
  }
  const flavour = langFlavour[lang] || langFlavour.python

  return (
    <div className="step-card">
      <div className="step-header">
        <span>{stepMeta.title}</span>
        <span className="step-sub">{stepMeta.sub}</span>
      </div>
      <p className="step-desc">
        Your program ran on the <strong>{flavour.runtime}</strong> and produced the output below.
        The full journey was source code to tokens to AST to {flavour.journey} to output.
      </p>
      <div className="step-label">stdout ({outLines.length} line{outLines.length !== 1 ? 's' : ''})</div>
      <div className="out-block">
        {lines.length === 0
          ? <div className="out-empty">No output produced.</div>
          : lines.map((line, index) => (
            <div key={index} className={`out-line ol-${line.type}`}>
              <span className="out-prompt">{line.type === 'error' ? 'ERR' : line.type === 'warn' ? 'WARN' : 'OUT'}</span>
              <span>{line.text}</span>
            </div>
          ))}
      </div>
      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">Lines of output</span>
          <span className="stat-val">{outLines.length}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Errors</span>
          <span className="stat-val" style={{ color: errorLines.length ? 'var(--tok-op)' : 'var(--tok-fn)' }}>
            {errorLines.length}
          </span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Runtime</span>
          <span className="stat-val">{flavour.runtime}</span>
        </div>
      </div>
    </div>
  )
}
