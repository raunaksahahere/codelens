export function ExecuteStep({ data, lang, stepMeta }) {
  const isPvm = data.model === 'pvm'
  const isJvm = data.model === 'jvm'
  const isNative = data.model === 'native'

  return (
    <div className="step-card">
      <div className="step-header">
        <span>{stepMeta.title}</span>
        <span className="step-sub">{stepMeta.sub}</span>
      </div>
      {isPvm && <PVMView data={data} />}
      {isJvm && <JVMView data={data} />}
      {isNative && <NativeView data={data} lang={lang} />}
    </div>
  )
}

function PVMView({ data }) {
  const { frames = [], interpreter, gc } = data

  return (
    <>
      <p className="step-desc">
        CPython&apos;s <strong>PVM</strong> processes bytecode one instruction at a time. Each function call
        creates a new <strong>frame</strong> on the call stack with its own local variables.
      </p>
      <div className="info-box">
        <strong>Tip:</strong> Think of the call stack like a stack of trays. Each function call adds
        a new tray on top, and local variables stay inside that tray until the function ends.
      </div>
      <div className="exec-row">
        <div className="exec-col">
          <div className="step-label">Call Stack</div>
          {frames.map((frame, index) => (
            <div key={index} className={`exec-frame ${frame.active ? 'frame-active' : ''}`}>
              <div className="frame-name">Frame: <span>{frame.name}</span></div>
              <div className="frame-vars">
                {Object.entries(frame.vars).length === 0
                  ? <span className="empty-vars">No local variables</span>
                  : Object.entries(frame.vars).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="var-row">
                      <span className="var-k">{key}</span>
                      <span className="var-eq">=</span>
                      <span className="var-v">{String(value).slice(0, 24)}</span>
                      <span className="var-type">{typeof value}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <div className="exec-col">
          <div className="step-label">Runtime Info</div>
          <div className="info-grid">
            <div className="info-item"><span>Interpreter</span><span>{interpreter}</span></div>
            <div className="info-item"><span>Garbage Collector</span><span>{gc}</span></div>
            <div className="info-item"><span>GIL</span><span>Held (single thread)</span></div>
            <div className="info-item"><span>Memory</span><span>Object heap</span></div>
          </div>
        </div>
      </div>
    </>
  )
}

function JVMView({ data }) {
  const { thread, frames = [], heap, jit } = data

  return (
    <>
      <p className="step-desc">
        The <strong>JVM</strong> loads your .class file, verifies the bytecode, and executes it. The JIT
        compiler can translate hot code paths into native machine code while the program runs.
      </p>
      <div className="info-box">
        <strong>Tip:</strong> The JVM acts like a portability layer. Your bytecode stays the same,
        but the JVM adapts it to the operating system and CPU underneath.
      </div>
      <div className="exec-row">
        <div className="exec-col">
          <div className="step-label">Thread State</div>
          <div className="jvm-thread">{thread}</div>
          <div className="step-label" style={{ marginTop: 10 }}>Stack Frames</div>
          {frames.map((frame, index) => (
            <div key={index} className={`exec-frame ${frame.active ? 'frame-active' : ''}`}>
              <div className="frame-name">{frame.cls}.<span>{frame.name}</span></div>
              <div className="frame-vars">
                {Object.entries(frame.vars).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="var-row">
                    <span className="var-k">{key}</span>
                    <span className="var-eq">=</span>
                    <span className="var-v">{String(value).slice(0, 20)}</span>
                    <span className="var-type">{typeof value === 'number' ? 'int' : 'String'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="exec-col">
          <div className="step-label">JVM Subsystems</div>
          <div className="info-grid">
            <div className="info-item"><span>Heap</span><span>{heap}</span></div>
            <div className="info-item"><span>JIT</span><span>{jit}</span></div>
            <div className="info-item"><span>Class Loader</span><span>Bootstrap CL</span></div>
            <div className="info-item"><span>GC</span><span>G1 Garbage Collector</span></div>
          </div>
        </div>
      </div>
    </>
  )
}

function NativeView({ data, lang }) {
  const { registers = {}, stack = [] } = data

  return (
    <>
      <p className="step-desc">
        {lang === 'cpp'
          ? 'After C++ compilation and linking, the CPU executes the native binary directly without a virtual machine.'
          : 'The compiled binary runs directly on the CPU. The operating system loads it into memory and the processor executes it natively.'}
      </p>
      <div className="info-box">
        <strong>Tip:</strong> C and C++ stay close to the hardware, which is why they are common in systems programming and performance-sensitive software.
      </div>
      <div className="exec-row">
        <div className="exec-col">
          <div className="step-label">CPU Registers</div>
          <div className="reg-grid">
            {Object.entries(registers).map(([key, value]) => (
              <div key={key} className="reg-box">
                <span className="reg-name">{key.toUpperCase()}</span>
                <span className="reg-val">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="exec-col">
          <div className="step-label">Stack Frame (main)</div>
          {stack.length === 0
            ? <div className="empty-vars">No local variables tracked</div>
            : stack.map((entry, index) => (
              <div key={index} className="stack-row">
                <span className="stack-addr">{entry.addr}</span>
                <span className="stack-type">[{entry.type}]</span>
                <span className="stack-var">{entry.var}</span>
                <span className="stack-val">= {entry.value}</span>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
