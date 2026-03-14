import { useEffect, useRef } from 'react'

export function Console({ lines, onClear }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="console">
      <div className="console-hdr">
        <div className="console-dots">
          <span className="cdot cdot-r" />
          <span className="cdot cdot-y" />
          <span className="cdot cdot-g" />
        </div>
        <span className="console-title">Output Console</span>
        <button type="button" className="console-clear" onClick={onClear}>
          Reset
        </button>
      </div>
      <div className="console-body" ref={scrollRef}>
        {lines.length === 0
          ? <div className="console-empty">Run the example to see program output here.</div>
          : lines.map((line, index) => (
            <div key={index} className={`console-line cl-${line.type}`} style={{ animationDelay: `${index * 30}ms` }}>
              <span className="cl-prompt">
                {line.type === 'error' ? 'ERR' : line.type === 'warn' ? 'WARN' : line.type === 'info' ? 'INFO' : 'OUT'}
              </span>
              <span className="cl-text">{line.text}</span>
            </div>
          ))}
      </div>
    </div>
  )
}
