import { useRef, useEffect, useCallback } from 'react'
import { highlight } from '../engine/highlighter.js'
import { LANGS } from '../languages/config.js'

export function Editor({ code, lang, onChange }) {
  const taRef = useRef(null)
  const hlRef = useRef(null)
  const lnRef = useRef(null)
  const cfg = LANGS[lang]
  const lineCount = code.split('\n').length

  const syncScroll = useCallback(() => {
    if (!taRef.current || !hlRef.current || !lnRef.current) return
    hlRef.current.scrollTop = taRef.current.scrollTop
    hlRef.current.scrollLeft = taRef.current.scrollLeft
    lnRef.current.scrollTop = taRef.current.scrollTop
  }, [])

  useEffect(() => {
    if (!hlRef.current) return
    hlRef.current.innerHTML = highlight(code, lang) + '\n'
  }, [code, lang])

  useEffect(() => {
    if (!lnRef.current) return
    const count = code.split('\n').length
    lnRef.current.innerHTML = Array.from({ length: count }, (_, index) => index + 1).join('\n')
  }, [code])

  const handleKeyDown = useCallback((event) => {
    const textarea = taRef.current
    if (!textarea) return

    if (event.key === 'Tab') {
      event.preventDefault()
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newCode = code.slice(0, start) + '    ' + code.slice(end)
      onChange(newCode)
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4
      })
      return
    }

    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" }
    if (pairs[event.key]) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start === end) {
        event.preventDefault()
        const close = pairs[event.key]
        const newCode = code.slice(0, start) + event.key + close + code.slice(end)
        onChange(newCode)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1
        })
        return
      }
    }

    if (event.key === 'Enter') {
      const start = textarea.selectionStart
      const lineStart = code.lastIndexOf('\n', start - 1) + 1
      const currentLine = code.slice(lineStart, start)
      const indent = currentLine.match(/^(\s*)/)[1]
      const extraIndent = (currentLine.trimEnd().endsWith(':') || currentLine.trimEnd().endsWith('{')) ? '    ' : ''
      event.preventDefault()
      const newCode = code.slice(0, start) + '\n' + indent + extraIndent + code.slice(start)
      onChange(newCode)
      requestAnimationFrame(() => {
        const newPos = start + 1 + indent.length + extraIndent.length
        textarea.selectionStart = textarea.selectionEnd = newPos
      })
    }
  }, [code, onChange])

  return (
    <div className="editor-panel">
      <div className="panel-hdr">
        <div className="panel-heading">
          <span className="panel-title">Editor</span>
          <p className="panel-copy">Edit the starter program, then run it to compare every stage.</p>
        </div>
        <div className="panel-meta">
          <span
            className="lang-badge-sm"
            style={{ borderColor: `var(${cfg.cssVar})`, color: `var(${cfg.cssVar})` }}
          >
            {cfg.name} {cfg.ext}
          </span>
          <span className="panel-stat">{lineCount} lines</span>
          <span className="panel-stat">{code.length} chars</span>
        </div>
      </div>

      <div className="panel-toolbar">
        <span className="editor-hint">Ctrl+Enter to run</span>
        <span className="editor-hint">Tab inserts spaces</span>
        <span className="editor-hint">Brackets auto-close</span>
      </div>

      <div className="editor-wrap">
        <div className="line-nums" ref={lnRef} aria-hidden="true">1</div>

        <div className="editor-inner">
          <pre className="hl-overlay" ref={hlRef} aria-hidden="true" />

          <textarea
            ref={taRef}
            className="code-area"
            value={code}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={syncScroll}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label={`${cfg.name} editor`}
          />
        </div>
      </div>
    </div>
  )
}
