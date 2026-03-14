import { tokenize } from './highlighter.js'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSourceTokens(code, lang) {
  // Return non-whitespace, non-newline tokens for the chip display
  return tokenize(code, lang)
    .filter(t => t.type !== 'ws' && t.type !== 'nl' && t.text.trim())
    .slice(0, 80) // cap for display
}

// Build a simplified AST from code lines
function buildAST(code, lang) {
  if (lang === 'python') return buildPyAST(code)
  if (lang === 'java')   return buildJavaAST(code)
  return buildCAST(code, lang)
}

function buildPyAST(code) {
  const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'))
  const children = []
  let i = 0
  while (i < lines.length) {
    const l = lines[i].trim()
    if (/^print\s*\(/.test(l)) {
      const inner = l.slice(l.indexOf('(')+1, l.lastIndexOf(')'))
      children.push({ type:'Expr', children:[{ type:'Call', value:'print', children: inner.split(',').map(a=>({ type: a.trim().startsWith('"')||a.trim().startsWith("'")?'Str':'Expr', value:a.trim() })) }] })
    } else if (/^for\s+\w+\s+in\s+/.test(l)) {
      const m = l.match(/^for\s+(\w+)\s+in\s+(.+):$/)
      if (m) children.push({ type:'For', value:`${m[1]} in ${m[2]}`, children:[{ type:'Body', value:`${countIndentedLines(lines,i)} statements` }] })
    } else if (/^def\s+/.test(l)) {
      const m = l.match(/^def\s+(\w+)\s*\(([^)]*)\)/)
      if (m) children.push({ type:'FunctionDef', value:`${m[1]}(${m[2]})`, children:[{ type:'Body', value:`${countIndentedLines(lines,i)} statements` }] })
    } else if (/^if\s+/.test(l)) {
      children.push({ type:'If', value:l.replace(/^if\s+/,'').replace(/:$/,''), children:[] })
    } else if (/^\w+\s*=/.test(l) && !/^\w+\s*==/.test(l)) {
      const [lhs, rhs] = l.split(/\s*=\s*/, 2)
      children.push({ type:'Assign', children:[{ type:'Name', value:lhs.trim() },{ type:'Value', value:rhs?.trim()||'' }] })
    } else if (l && !/^#/.test(l)) {
      children.push({ type:'Expr', value:l.slice(0,40) })
    }
    i++
  }
  return { type:'Module', children }
}

function countIndentedLines(lines, idx) {
  const base = lines[idx].search(/\S/)
  let count = 0
  for (let i = idx+1; i < lines.length; i++) {
    const ind = lines[i].search(/\S/)
    if (ind <= base && lines[i].trim()) break
    if (lines[i].trim()) count++
  }
  return count
}

function buildJavaAST(code) {
  const cm = code.match(/public\s+class\s+(\w+)/)
  const mm = code.match(/public\s+static\s+void\s+main/)
  const children = []
  if (mm) {
    const bodyMatch = code.match(/void\s+main[^{]+\{([\s\S]*?)\}\s*\}/)
    if (bodyMatch) {
      const body = bodyMatch[1]
      const stmts = body.split(';').map(s=>s.trim()).filter(s=>s&&!s.startsWith('//'))
      stmts.slice(0,8).forEach(s => {
        if(/System\.out\.print/.test(s)) children.push({ type:'Expr', children:[{ type:'Call', value:'System.out.println', children:[{ type:'Str', value:s.match(/\((.+)\)$/)?.[1]||'' }] }] })
        else if(/^\s*for/.test(s)) children.push({ type:'For', value:s.replace(/^for\s*/,'').slice(0,40), children:[] })
        else if(/(?:int|String|double)\s+\w+/.test(s)) children.push({ type:'VarDecl', value:s.slice(0,50) })
        else if(s.trim()) children.push({ type:'Stmt', value:s.slice(0,50) })
      })
    }
  }
  return {
    type:'CompilationUnit',
    children:[{ type:'ClassDecl', value:cm?.[1]||'Main', children:[{ type:'MethodDecl', value:'main(String[] args)', children }] }]
  }
}

function buildCAST(code, lang) {
  const mainM = code.match(/int\s+main[^{]*\{([\s\S]*)\}/)
  const children = []
  if (mainM) {
    const body = mainM[1]
    const stmts = body.split(';').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')&&!s.startsWith('//'))
    stmts.slice(0,8).forEach(s => {
      if(/printf|cout/.test(s)) children.push({ type:'Expr', children:[{ type:'Call', value:lang==='cpp'?'cout':'printf', children:[{ type:'Str', value:s.slice(0,30) }] }] })
      else if(/for\s*\(/.test(s)) children.push({ type:'For', value:s.replace(/^for\s*/,'').slice(0,40), children:[] })
      else if(/^(?:int|double|float|char)/.test(s)) children.push({ type:'VarDecl', value:s.slice(0,50) })
      else if(s.trim()) children.push({ type:'Stmt', value:s.slice(0,50) })
    })
  }
  return {
    type:'TranslationUnit',
    children:[{ type:'FunctionDef', value:'int main()', children }]
  }
}

// ── Bytecode / Assembly generators ───────────────────────────────────────────

function genPythonBytecode(code, output) {
  const instrs = []
  let offset = 0
  const addInstr = (op, arg='', comment='') => {
    instrs.push({ offset, op, arg, comment }); offset += 2
  }

  const lines = code.split('\n').filter(l => {
    const t = l.trim(); return t && !t.startsWith('#')
  })

  lines.forEach(line => {
    const l = line.trim()
    if (/^print\s*\(/.test(l)) {
      const inner = l.slice(l.indexOf('(')+1, l.lastIndexOf(')'))
      addInstr('LOAD_GLOBAL', '0 (print)')
      inner.split(',').forEach(a => {
        const t = a.trim()
        if (t.startsWith('"')||t.startsWith("'")) addInstr('LOAD_CONST', t.slice(0,20))
        else addInstr('LOAD_NAME', t)
      })
      addInstr('CALL_FUNCTION', `${inner.split(',').length}`, 'call print')
      addInstr('POP_TOP', '', 'discard return value')
    } else if (/^\w+\s*=/.test(l) && !/==/.test(l.slice(0,l.indexOf('=')))) {
      const [lhs, rhs] = l.split(/\s*=\s*/, 2)
      addInstr('LOAD_CONST', rhs?.trim()||'0')
      addInstr('STORE_NAME', lhs.trim())
    } else if (/^for\s+/.test(l)) {
      const m = l.match(/^for\s+(\w+)\s+in\s+(.+):/)
      if (m) {
        addInstr('LOAD_GLOBAL', `(${m[2]})`)
        addInstr('GET_ITER', '', 'get iterator')
        addInstr('FOR_ITER', `+${offset+8}`, 'jump if exhausted')
        addInstr('STORE_NAME', m[1])
        addInstr('JUMP_ABSOLUTE', `${offset-4}`)
      }
    } else if (/^def\s+/.test(l)) {
      const m = l.match(/^def\s+(\w+)/)
      if (m) {
        addInstr('MAKE_FUNCTION', '0', `define ${m[1]}`)
        addInstr('STORE_NAME', m[1])
      }
    } else if (l && !/^#/.test(l)) {
      addInstr('LOAD_NAME', l.slice(0,20))
      addInstr('CALL_FUNCTION', '0')
      addInstr('POP_TOP')
    }
  })

  addInstr('LOAD_CONST', 'None')
  addInstr('RETURN_VALUE', '', 'module returns None')
  return instrs.slice(0, 24)
}

function genJVMBytecode(code) {
  return [
    { offset:'0x0000', op:'getstatic',      arg:'#2 java/lang/System.out',         comment:'get System.out' },
    { offset:'0x0003', op:'ldc',            arg:'"Hello, World!"',                 comment:'load string constant' },
    { offset:'0x0005', op:'invokevirtual',  arg:'#3 PrintStream.println',          comment:'call println' },
    { offset:'0x0008', op:'bipush',         arg:'10',                              comment:'push int 10' },
    { offset:'0x000a', op:'istore_1',       arg:'',                                comment:'store as x' },
    { offset:'0x000b', op:'bipush',         arg:'20',                              comment:'push int 20' },
    { offset:'0x000d', op:'istore_2',       arg:'',                                comment:'store as y' },
    { offset:'0x000e', op:'getstatic',      arg:'#2 java/lang/System.out',         comment:'get System.out' },
    { offset:'0x0011', op:'iload_1',        arg:'',                                comment:'load x' },
    { offset:'0x0012', op:'iload_2',        arg:'',                                comment:'load y' },
    { offset:'0x0013', op:'iadd',           arg:'',                                comment:'x + y = 30' },
    { offset:'0x0014', op:'invokevirtual',  arg:'#4 PrintStream.println(int)',     comment:'print sum' },
    { offset:'0x0017', op:'iconst_0',       arg:'',                                comment:'i = 0' },
    { offset:'0x0018', op:'istore_3',       arg:'',                                comment:'store i' },
    { offset:'0x0019', op:'iload_3',        arg:'',                                comment:'load i' },
    { offset:'0x001a', op:'iconst_5',       arg:'',                                comment:'push 5' },
    { offset:'0x001b', op:'if_icmpge',      arg:'0x002a',                          comment:'if i >= 5, exit loop' },
    { offset:'0x001e', op:'getstatic',      arg:'#2 java/lang/System.out',         comment:'get System.out' },
    { offset:'0x0021', op:'iload_3',        arg:'',                                comment:'load i' },
    { offset:'0x0022', op:'invokevirtual',  arg:'#5 PrintStream.println',          comment:'print count' },
    { offset:'0x0025', op:'iinc',           arg:'3, 1',                            comment:'i++' },
    { offset:'0x0028', op:'goto',           arg:'0x0019',                          comment:'back to loop start' },
    { offset:'0x002a', op:'return',         arg:'',                                comment:'end of method' },
  ]
}

function genCAssembly(code, lang) {
  const isCpp = lang === 'cpp'
  return [
    { addr:'0x401020', op:'push',    args:'%rbp',                comment:'save base pointer' },
    { addr:'0x401021', op:'mov',     args:'%rsp, %rbp',          comment:'set up stack frame' },
    { addr:'0x401024', op:'sub',     args:'$0x20, %rsp',         comment:'allocate 32 bytes local storage' },
    { addr:'0x401028', op:'lea',     args:'str_Hello(%rip), %rdi',comment:`load "Hello, World!" addr` },
    { addr:'0x40102f', op:'call',    args:isCpp?'_ZStlsISt11char_traits...':'printf@PLT', comment:isCpp?'call cout<<':'call printf' },
    { addr:'0x401034', op:'movl',    args:'$10, -0x4(%rbp)',      comment:'x = 10' },
    { addr:'0x40103b', op:'movl',    args:'$20, -0x8(%rbp)',      comment:'y = 20' },
    { addr:'0x401042', op:'movl',    args:'-0x4(%rbp), %eax',    comment:'load x' },
    { addr:'0x401045', op:'addl',    args:'-0x8(%rbp), %eax',    comment:'x + y' },
    { addr:'0x401048', op:'movl',    args:'$0, -0xc(%rbp)',       comment:'i = 0  (loop init)' },
    { addr:'0x40104f', op:'cmpl',    args:'$5, -0xc(%rbp)',       comment:'compare i with 5' },
    { addr:'0x401053', op:'jge',     args:'0x401068',             comment:'jump if i >= 5 (exit loop)' },
    { addr:'0x401055', op:'movl',    args:'-0xc(%rbp), %esi',    comment:'load i for printf' },
    { addr:'0x401058', op:'lea',     args:'str_Count(%rip), %rdi',comment:'load "Count: %d" addr' },
    { addr:'0x40105f', op:'call',    args:isCpp?'operator<<':'printf@PLT', comment:'print Count' },
    { addr:'0x401064', op:'addl',    args:'$1, -0xc(%rbp)',       comment:'i++' },
    { addr:'0x401068', op:'jmp',     args:'0x40104f',             comment:'loop back' },
    { addr:'0x40106b', op:'xorl',    args:'%eax, %eax',          comment:'return 0' },
    { addr:'0x40106d', op:'pop',     args:'%rbp',                 comment:'restore base pointer' },
    { addr:'0x40106e', op:'ret',     args:'',                     comment:'return to caller' },
  ]
}

// ── Execute model data ────────────────────────────────────────────────────────

function buildExecModel(lang, execResult) {
  const vars = execResult?.vars || {}
  if (lang === 'python') {
    return {
      model: 'pvm',
      frames: [
        { name: '<module>', vars, active: true }
      ],
      interpreter: 'CPython 3.x',
      gc: 'reference counting + cyclic',
    }
  }
  if (lang === 'java') {
    return {
      model: 'jvm',
      thread: 'main (RUNNABLE)',
      frames: [{ name: 'main', cls: 'Main', vars, active: true }],
      heap: 'String pool + object heap',
      jit: 'JIT compilation threshold: 10,000 calls',
    }
  }
  return {
    model: 'native',
    registers: {
      rax: '0x' + Math.abs(Object.values(vars)[0]||0).toString(16).padStart(8,'0'),
      rbx: '0x00000000',
      rip: '0x40106e',
      rsp: '0x7ffd4a2c',
      rbp: '0x7ffd4a4c',
    },
    stack: Object.entries(vars).slice(0,6).map(([k,v],idx)=>({
      addr: '0x' + (0x7ffd4a4c - idx*4).toString(16),
      var: k, value: String(v),
      type: typeof v === 'number' ? 'int' : 'char*'
    })),
  }
}

// ── Main builder ──────────────────────────────────────────────────────────────

export function buildPipeline(code, lang, execResult) {
  const tokens = getSourceTokens(code, lang)
  const ast    = buildAST(code, lang)
  const exec   = buildExecModel(lang, execResult)

  const transform = lang === 'python'
    ? { label:'CPython Bytecode (.pyc)', instructions: genPythonBytecode(code, execResult?.output||[]) }
    : lang === 'java'
    ? { label:'JVM Bytecode (.class file)', instructions: genJVMBytecode(code) }
    : { label:lang==='cpp'?'C++ → x86-64 Assembly + Link':'C → x86-64 Assembly', instructions: genCAssembly(code, lang) }

  return [
    { id:'tokenize',  data:{ tokens } },
    { id:'ast',       data:{ tree: ast } },
    { id:'transform', data: transform },
    { id:'execute',   data: exec },
    { id:'output',    data:{ lines: execResult?.output || [] } },
  ]
}
