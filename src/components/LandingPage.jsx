import { LANGS } from '../languages/config.js'

const LEARNING_POINTS = [
  {
    title: 'See the hidden steps',
    text: 'Beginners usually see only source code and final output. CodeLens fills in the missing middle so the runtime feels less mysterious.',
  },
  {
    title: 'Compare how languages differ',
    text: 'Python, Java, C, and C++ all execute differently. CodeLens gives each one a clear starting point before you enter the workspace.',
  },
  {
    title: 'Learn by changing one line',
    text: 'Tweak the starter program, run it again, and watch how the tokens, trees, bytecode or assembly, and output respond to your change.',
  },
]

const STAGE_OVERVIEW = [
  {
    step: '01',
    title: 'Tokenize',
    text: 'Break source code into keywords, identifiers, numbers, strings, punctuation, and operators.',
  },
  {
    step: '02',
    title: 'Parse',
    text: 'Turn the token stream into an abstract syntax tree so the structure of the program becomes visible.',
  },
  {
    step: '03',
    title: 'Transform',
    text: 'Show the language-specific intermediate form: bytecode for Python and Java, and compilation output for C and C++.',
  },
  {
    step: '04',
    title: 'Execute',
    text: 'Visualize what the virtual machine or CPU is doing while it runs the program.',
  },
  {
    step: '05',
    title: 'Output',
    text: 'Connect the earlier stages to the final result printed by the program.',
  },
]

export function LandingPage({ onStart }) {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <span className="eyebrow">Beginner-first programming visualizer</span>
          <h1>Understand what happens after you press Run.</h1>
          <p className="landing-lead">
            CodeLens helps new programmers understand how code becomes behavior. Instead of jumping
            straight into a tiny editor, you first get a guided overview of the journey from source
            code to output.
          </p>
          <div className="landing-actions">
            <button type="button" className="primary-btn" onClick={() => onStart('python')}>
              Open the workspace
            </button>
            <button type="button" className="secondary-btn" onClick={() => onStart('java')}>
              Start with Java
            </button>
          </div>
          <div className="landing-metrics">
            <article className="metric-card">
              <span className="metric-label">Languages</span>
              <strong>4 guided runtimes</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Pipeline</span>
              <strong>5 learning stages</strong>
            </article>
            <article className="metric-card">
              <span className="metric-label">Audience</span>
              <strong>Built for beginners</strong>
            </article>
          </div>
        </div>

        <aside className="hero-panel">
          <span className="hero-panel-label">What CodeLens teaches</span>
          <div className="hero-panel-list">
            <div className="hero-panel-item">
              <strong>Syntax to structure</strong>
              <span>See how characters become tokens and tokens become an AST.</span>
            </div>
            <div className="hero-panel-item">
              <strong>Interpreters and compilers</strong>
              <span>Compare Python and Java virtual machines with native C and C++ execution.</span>
            </div>
            <div className="hero-panel-item">
              <strong>Cause and effect</strong>
              <span>Trace how a tiny edit in source code changes the runtime path and final output.</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="eyebrow">Why this matters</span>
          <h2>Programming gets easier when the invisible parts are visible.</h2>
        </div>
        <div className="feature-grid">
          {LEARNING_POINTS.map((item) => (
            <article key={item.title} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="eyebrow">Before you code</span>
          <h2>The learning path inside the workspace</h2>
        </div>
        <div className="stage-grid">
          {STAGE_OVERVIEW.map((stage) => (
            <article key={stage.step} className="stage-card">
              <span className="stage-index">{stage.step}</span>
              <h3>{stage.title}</h3>
              <p>{stage.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <span className="eyebrow">Choose a starting language</span>
          <h2>Pick the path you want to explore first</h2>
        </div>
        <div className="language-grid">
          {Object.entries(LANGS).map(([id, cfg]) => (
            <article
              key={id}
              className="language-card"
              style={{ '--lang-accent': `var(${cfg.cssVar})` }}
            >
              <span className="language-name">{cfg.name}</span>
              <p className="language-tagline">{cfg.tagline}</p>
              <p className="language-copy">{cfg.overview}</p>
              <button type="button" className="language-btn" onClick={() => onStart(id)}>
                Start with {cfg.name}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
