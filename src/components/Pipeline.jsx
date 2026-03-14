import { LANGS } from '../languages/config.js'
import { TokenizeStep } from './steps/TokenizeStep.jsx'
import { ASTStep } from './steps/ASTStep.jsx'
import { TransformStep } from './steps/TransformStep.jsx'
import { ExecuteStep } from './steps/ExecuteStep.jsx'
import { OutputStep } from './steps/OutputStep.jsx'

const STEP_COMPONENTS = {
  tokenize: TokenizeStep,
  ast: ASTStep,
  transform: TransformStep,
  execute: ExecuteStep,
  output: OutputStep,
}

const LANG_FLOW = {
  python: [
    { id: 'tokenize', badge: '01', pill: 'Lexing' },
    { id: 'ast', badge: '02', pill: 'Parsing' },
    { id: 'transform', badge: '03', pill: 'Bytecode' },
    { id: 'execute', badge: '04', pill: 'PVM' },
    { id: 'output', badge: '05', pill: 'Output' },
  ],
  java: [
    { id: 'tokenize', badge: '01', pill: 'Lexing' },
    { id: 'ast', badge: '02', pill: 'Parsing' },
    { id: 'transform', badge: '03', pill: '.class' },
    { id: 'execute', badge: '04', pill: 'JVM' },
    { id: 'output', badge: '05', pill: 'Output' },
  ],
  c: [
    { id: 'tokenize', badge: '01', pill: 'Lexing' },
    { id: 'ast', badge: '02', pill: 'Parsing' },
    { id: 'transform', badge: '03', pill: 'Assembly' },
    { id: 'execute', badge: '04', pill: 'CPU' },
    { id: 'output', badge: '05', pill: 'Output' },
  ],
  cpp: [
    { id: 'tokenize', badge: '01', pill: 'Lexing' },
    { id: 'ast', badge: '02', pill: 'Parsing' },
    { id: 'transform', badge: '03', pill: 'Compile' },
    { id: 'execute', badge: '04', pill: 'CPU' },
    { id: 'output', badge: '05', pill: 'Output' },
  ],
}

function IdleState({ lang }) {
  const cfg = LANGS[lang]

  return (
    <div className="pipeline-idle">
      <div className="idle-glyph">READY</div>
      <div className="idle-title">Pipeline ready for {cfg.name}</div>
      <div className="idle-sub">
        Run the starter code to see how {cfg.name} moves through tokenization, parsing,
        transformation, execution, and output.
      </div>
      <div className="idle-hint-row">
        <div className="idle-hint-item"><span className="idle-step">1</span><span>Tokenize</span></div>
        <div className="idle-arrow">-&gt;</div>
        <div className="idle-hint-item"><span className="idle-step">2</span><span>Parse</span></div>
        <div className="idle-arrow">-&gt;</div>
        <div className="idle-hint-item"><span className="idle-step">3</span><span>Transform</span></div>
        <div className="idle-arrow">-&gt;</div>
        <div className="idle-hint-item"><span className="idle-step">4</span><span>Execute</span></div>
        <div className="idle-arrow">-&gt;</div>
        <div className="idle-hint-item"><span className="idle-step">5</span><span>Output</span></div>
      </div>
    </div>
  )
}

export function Pipeline({ pipeline, lang, step, onStep }) {
  const cfg = LANGS[lang]
  const flow = LANG_FLOW[lang] || LANG_FLOW.python
  const total = pipeline.length

  if (!pipeline || total === 0) {
    return (
      <div className="pipeline-panel">
        <div className="panel-hdr">
          <div className="panel-heading">
            <span className="panel-title">Pipeline</span>
            <p className="panel-copy">Inspect what the compiler or runtime is doing.</p>
          </div>
          <span className="pipeline-tagline">{cfg.tagline}</span>
        </div>
        <IdleState lang={lang} />
      </div>
    )
  }

  const current = pipeline[step]
  const StepComp = current ? STEP_COMPONENTS[current.id] : null
  const stepMeta = {
    title: cfg.stepTitles[step],
    sub: cfg.stepSubs[step],
  }

  return (
    <div className="pipeline-panel">
      <div className="panel-hdr">
        <div className="panel-heading">
          <span className="panel-title">Pipeline</span>
          <p className="panel-copy">Move step by step or jump directly to a stage.</p>
        </div>
        <span className="pipeline-tagline">{cfg.tagline}</span>
        <div className="step-nav">
          <button
            type="button"
            className="nav-btn"
            onClick={() => onStep(step - 1)}
            disabled={step === 0}
            title="Previous step"
          >
            Previous
          </button>
          <span className="step-counter">{step + 1} / {total}</span>
          <button
            type="button"
            className="nav-btn"
            onClick={() => onStep(step + 1)}
            disabled={step === total - 1}
            title="Next step"
          >
            Next
          </button>
        </div>
      </div>

      <div className="flow-bar">
        {flow.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            className={`flow-pill ${index === step ? 'flow-pill-active' : ''} ${index < step ? 'flow-pill-done' : ''}`}
            onClick={() => onStep(index)}
            style={index === step ? { borderColor: `var(${cfg.cssVar})`, color: `var(${cfg.cssVar})` } : {}}
          >
            <span className="flow-icon">{entry.badge}</span>
            <span>{entry.pill}</span>
          </button>
        ))}
      </div>

      <div className="pipeline-content">
        {StepComp && (
          <StepComp
            key={`${lang}-${step}`}
            data={current.data}
            lang={lang}
            stepMeta={stepMeta}
          />
        )}
      </div>
    </div>
  )
}
