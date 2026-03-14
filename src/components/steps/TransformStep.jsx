import { useState } from 'react'

const LANG_DESC = {
  python: {
    what: 'Python compiles the AST to bytecode, a compact instruction set for the CPython Virtual Machine.',
    tip: 'Bytecode is still not machine code. It needs the CPython interpreter to execute it.',
    colA: 'OFFSET',
    colB: 'OPCODE',
    colC: 'ARGUMENT',
    colD: 'NOTES',
  },
  java: {
    what: 'Java compiles the source into JVM bytecode stored in a .class file. That bytecode can run on any machine with a JVM.',
    tip: 'This is the basis of Java portability. The JVM can also optimize hot paths into native code at runtime.',
    colA: 'OFFSET',
    colB: 'OPCODE',
    colC: 'OPERAND',
    colD: 'NOTES',
  },
  c: {
    what: 'C compiles source directly to native instructions. The generated assembly and binary are meant for the target CPU.',
    tip: 'C stays close to the hardware, so this stage is a good place to talk about memory and machine instructions.',
    colA: 'ADDR',
    colB: 'MNEMONIC',
    colC: 'OPERANDS',
    colD: 'NOTES',
  },
  cpp: {
    what: 'C++ follows the same native compilation path as C, with extra language machinery such as name mangling and overload resolution.',
    tip: 'The compiler has to keep similarly named functions distinct, which is why mangled symbol names appear in compiled output.',
    colA: 'ADDR',
    colB: 'MNEMONIC',
    colC: 'OPERANDS',
    colD: 'NOTES',
  },
}

export function TransformStep({ data, lang, stepMeta }) {
  const [active, setActive] = useState(-1)
  const { label, instructions = [] } = data
  const description = LANG_DESC[lang] || LANG_DESC.c
  const isAsm = lang === 'c' || lang === 'cpp'

  return (
    <div className="step-card">
      <div className="step-header">
        <span>{stepMeta.title}</span>
        <span className="step-sub">{stepMeta.sub}</span>
      </div>
      <p className="step-desc">{description.what}</p>
      <div className="info-box">
        <strong>Tip:</strong> {description.tip}
      </div>
      <div className="step-label">{label}</div>

      <div className="bc-table">
        <div className="bc-header">
          <span>{description.colA}</span>
          <span>{description.colB}</span>
          <span>{description.colC}</span>
          <span>{description.colD}</span>
        </div>
        <div className="bc-body">
          {instructions.map((instruction, index) => (
            <div
              key={index}
              className={`bc-row ${active === index ? 'bc-active' : ''}`}
              onClick={() => setActive(active === index ? -1 : index)}
              style={{ animationDelay: `${index * 25}ms` }}
            >
              <span className="bc-offset">{isAsm ? instruction.addr : instruction.offset}</span>
              <span className="bc-op">{instruction.op}</span>
              <span className="bc-arg">{isAsm ? instruction.args : instruction.arg}</span>
              <span className="bc-cmt">{instruction.comment}</span>
            </div>
          ))}
        </div>
      </div>

      {active >= 0 && instructions[active] && (
        <div className="bc-detail">
          <strong>{instructions[active].op}</strong>
          {' - '}
          {instructions[active].comment || 'Click a row to inspect what that instruction means.'}
        </div>
      )}
    </div>
  )
}
