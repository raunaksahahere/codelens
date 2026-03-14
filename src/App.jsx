import { useState, useCallback, useEffect } from 'react'
import { Header } from './components/Header.jsx'
import { LandingPage } from './components/LandingPage.jsx'
import { Editor } from './components/Editor.jsx'
import { Pipeline } from './components/Pipeline.jsx'
import { Console } from './components/Console.jsx'
import { Footer } from './components/Footer.jsx'
import { LANGS } from './languages/config.js'
import { runCode } from './engine/interpreter.js'
import { buildPipeline } from './engine/pipelineBuilder.js'

const THEME_ATTR = 'data-theme'

function createIntroConsole(lang) {
  return [
    {
      type: 'info',
      text: `Choose a small change, run the ${LANGS[lang].name} example, and watch each stage update from source code to final output.`,
    },
  ]
}

export default function App() {
  const [lang, setLang] = useState('python')
  const [theme, setTheme] = useState('dark')
  const [view, setView] = useState('landing')
  const [code, setCode] = useState(LANGS.python.starter)
  const [pipeline, setPipeline] = useState([])
  const [step, setStep] = useState(0)
  const [conLines, setConLines] = useState(createIntroConsole('python'))
  const [running, setRunning] = useState(false)

  const currentLang = LANGS[lang]

  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTR, theme)
  }, [theme])

  useEffect(() => {
    const cfg = LANGS[lang]
    document.documentElement.style.setProperty('--lc', `var(${cfg.cssVar})`)
  }, [lang])

  const loadStarter = useCallback((nextLang) => {
    const targetLang = nextLang ?? lang
    if (targetLang !== lang) {
      setLang(targetLang)
    }
    setCode(LANGS[targetLang].starter)
    setPipeline([])
    setStep(0)
    setConLines(createIntroConsole(targetLang))
  }, [lang])

  const handleLangChange = useCallback((nextLang) => {
    loadStarter(nextLang)
  }, [loadStarter])

  const handleStart = useCallback((nextLang = lang) => {
    loadStarter(nextLang)
    setView('workspace')
  }, [lang, loadStarter])

  const handleResetStarter = useCallback(() => {
    loadStarter()
  }, [loadStarter])

  const handleRun = useCallback(async () => {
    setRunning(true)
    setConLines([{ type: 'info', text: `Running ${LANGS[lang].name}...` }])

    await new Promise((resolve) => setTimeout(resolve, 60))

    try {
      const result = runCode(code, lang)
      const pipe = buildPipeline(code, lang, result)

      setPipeline(pipe)
      setStep(0)

      if (result.output.length === 0) {
        setConLines([{ type: 'info', text: 'Program ran but produced no output.' }])
      } else {
        const intro = {
          type: 'info',
          text: `${LANGS[lang].name} finished with ${result.output.length} line(s) of output.`,
        }
        setConLines([intro, ...result.output])
      }
    } catch (error) {
      setConLines([{ type: 'error', text: error.message || String(error) }])
    }

    setRunning(false)
  }, [code, lang])

  useEffect(() => {
    if (view !== 'workspace') {
      return undefined
    }

    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        if (!running) handleRun()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRun, running, view])

  if (view === 'landing') {
    return (
      <div className="app-root">
        <LandingPage onStart={handleStart} />
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-root">
      <Header
        lang={lang}
        theme={theme}
        running={running}
        onLang={handleLangChange}
        onTheme={setTheme}
        onRun={handleRun}
        onReset={handleResetStarter}
        onOpenIntro={() => setView('landing')}
      />

      <main className="workspace-shell">
        <section className="workspace-intro">
          <div className="workspace-copy">
            <span className="eyebrow">Interactive workspace</span>
            <h1>Follow how {currentLang.name} becomes output.</h1>
            <p>
              {currentLang.overview} Start with the example program, change one line, and run it
              again to compare every stage.
            </p>
          </div>
          <div className="workspace-stats">
            <article className="workspace-stat">
              <span className="workspace-stat-label">Pipeline</span>
              <strong>{currentLang.stepTitles.length} stages</strong>
            </article>
            <article className="workspace-stat">
              <span className="workspace-stat-label">Shortcut</span>
              <strong>Ctrl+Enter</strong>
            </article>
            <article className="workspace-stat">
              <span className="workspace-stat-label">Status</span>
              <strong>{pipeline.length ? `Stage ${step + 1} selected` : 'Ready for your first run'}</strong>
            </article>
          </div>
        </section>

        <section className="workspace-tipbar">
          <p>
            Beginner tip: change one literal, one variable, or one loop limit at a time so you can
            clearly see what changed in the pipeline.
          </p>
          <button type="button" className="inline-link-btn" onClick={() => setView('landing')}>
            Read the intro again
          </button>
        </section>

        <div className="main-area">
          <Editor
            code={code}
            lang={lang}
            onChange={setCode}
          />
          <Pipeline
            pipeline={pipeline}
            lang={lang}
            step={step}
            onStep={setStep}
          />
        </div>

        <Console
          lines={conLines}
          onClear={() => setConLines(createIntroConsole(lang))}
        />
      </main>

      <Footer />
    </div>
  )
}
