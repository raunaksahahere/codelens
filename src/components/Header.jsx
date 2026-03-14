import { LANGS, THEMES } from '../languages/config.js'

export function Header({ lang, theme, running, onLang, onTheme, onRun, onReset, onOpenIntro }) {
  const cfg = LANGS[lang]

  return (
    <header className="hdr">
      <div className="hdr-brand">
        <button type="button" className="logo-btn" onClick={onOpenIntro}>
          <span className="logo-code">Code</span>
          <span className="logo-lens">Lens</span>
        </button>
        <p className="hdr-copy">Visualize how {cfg.name} moves from source code to output.</p>
      </div>

      <div className="hdr-controls">
        <label className="hdr-group">
          <span className="hdr-label">Language</span>
          <select value={lang} onChange={(event) => onLang(event.target.value)} className="lang-select">
            {Object.entries(LANGS).map(([key, value]) => (
              <option key={key} value={key}>{value.name}</option>
            ))}
          </select>
        </label>

        <span
          className="lang-badge"
          style={{ borderColor: `var(${cfg.cssVar})`, color: `var(${cfg.cssVar})` }}
        >
          {cfg.tagline}
        </span>

        <div className="hdr-group">
          <span className="hdr-label">Theme</span>
          <div className="theme-pills">
            {THEMES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`theme-pill ${theme === item.id ? 'theme-pill-on' : ''}`}
                onClick={() => onTheme(item.id)}
                title={item.label}
              >
                <span
                  className="theme-swatch"
                  style={{ background: `radial-gradient(circle at 40% 40%, ${item.dot[1]}, ${item.dot[0]})` }}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="ghost-btn" onClick={onReset}>
          Reset example
        </button>

        <button type="button" className="ghost-btn" onClick={onOpenIntro}>
          Intro
        </button>

        <button type="button" className="run-btn" onClick={onRun} disabled={running}>
          {running ? 'Running...' : 'Run code'}
        </button>
      </div>
    </header>
  )
}
