// ── Keyword sets ──────────────────────────────────────────────────────────────
const PY_KW = new Set([
  'def','class','if','elif','else','for','while','in','not','and','or','is',
  'None','True','False','return','import','from','pass','break','continue',
  'lambda','try','except','finally','with','as','yield','del','raise','assert',
  'global','nonlocal',
])
const PY_BUILTINS = new Set([
  'print','range','len','str','int','float','abs','max','min','sum',
  'input','type','list','tuple','dict','set','bool','enumerate','zip',
])
const JAVA_KW = new Set([
  'public','private','protected','static','void','int','double','float','long',
  'short','byte','char','boolean','class','interface','extends','implements',
  'if','else','for','while','do','return','new','null','true','false','this',
  'super','import','package','try','catch','finally','throw','throws','break',
  'continue','switch','case','default','instanceof','abstract','final',
  'synchronized','String','System',
])
const C_KW = new Set([
  'int','char','float','double','long','short','unsigned','signed','void',
  'if','else','for','while','do','return','struct','union','enum','typedef',
  'sizeof','const','static','extern','register','volatile','break','continue',
  'switch','case','default','goto','NULL','printf','scanf',
])
const CPP_KW = new Set([
  ...C_KW,'class','template','typename','namespace','using','public','private',
  'protected','virtual','override','new','delete','nullptr','true','false',
  'bool','string','auto','this','throw','try','catch','inline','explicit',
  'friend','operator','cout','cin','cerr','endl',
])
const TYPE_KW = new Set([
  'int','char','float','double','long','short','void','bool','string',
  'String','auto','unsigned','signed','byte','var',
])

// ── Tokenizer (returns array of {text, type}) ─────────────────────────────────
export function tokenize(code, lang) {
  const kws = lang === 'python' ? PY_KW
    : lang === 'java' ? JAVA_KW
    : lang === 'cpp'  ? CPP_KW
    : C_KW

  const builtins = lang === 'python' ? PY_BUILTINS : new Set()
  const tokens = []
  let i = 0

  while (i < code.length) {
    // Newline
    if (code[i] === '\n') { tokens.push({ text: '\n', type: 'nl' }); i++; continue }

    // Whitespace
    if (/[ \t]/.test(code[i])) {
      let ws = ''
      while (i < code.length && /[ \t]/.test(code[i])) ws += code[i++]
      tokens.push({ text: ws, type: 'ws' }); continue
    }

    // Line comment
    if (lang !== 'python' && code[i] === '/' && code[i+1] === '/') {
      let c = ''
      while (i < code.length && code[i] !== '\n') c += code[i++]
      tokens.push({ text: c, type: 'comment' }); continue
    }
    // Block comment
    if (code[i] === '/' && code[i+1] === '*') {
      let c = code[i] + code[i+1]; i += 2
      while (i < code.length && !(code[i-1] === '*' && code[i] === '/')) c += code[i++]
      if (i < code.length) c += code[i++]
      tokens.push({ text: c, type: 'comment' }); continue
    }
    // Python comment
    if (lang === 'python' && code[i] === '#') {
      let c = ''
      while (i < code.length && code[i] !== '\n') c += code[i++]
      tokens.push({ text: c, type: 'comment' }); continue
    }
    // C comment with /*
    if ((lang === 'c' || lang === 'cpp') && code[i] === '/' && code[i+1] === '*') {
      let c = ''; while (i < code.length && !(code[i] === '*' && code[i+1] === '/')) c += code[i++]
      c += '*/'; i += 2
      tokens.push({ text: c, type: 'comment' }); continue
    }

    // Preprocessor directive
    if ((lang === 'c' || lang === 'cpp') && code[i] === '#') {
      let c = ''
      while (i < code.length && code[i] !== '\n') c += code[i++]
      tokens.push({ text: c, type: 'directive' }); continue
    }

    // String (double or single quote)
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i]; let s = q; i++
      while (i < code.length && code[i] !== q) {
        if (code[i] === '\\') { s += code[i] + (code[i+1]||''); i += 2 }
        else s += code[i++]
      }
      s += q; i++
      tokens.push({ text: s, type: 'string' }); continue
    }

    // Number
    if (/[0-9]/.test(code[i]) || (code[i] === '.' && /[0-9]/.test(code[i+1]))) {
      let n = ''
      while (i < code.length && /[0-9.xXa-fA-F_]/.test(code[i])) n += code[i++]
      tokens.push({ text: n, type: 'number' }); continue
    }

    // Identifier / keyword
    if (/[a-zA-Z_]/.test(code[i])) {
      let id = ''
      while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) id += code[i++]
      let type = 'ident'
      if (kws.has(id)) {
        type = TYPE_KW.has(id) && lang !== 'python' ? 'type' : 'keyword'
      } else if (builtins.has(id)) {
        type = 'builtin'
      } else if (i < code.length && code[i] === '(') {
        type = 'fn'
      }
      tokens.push({ text: id, type }); continue
    }

    // Operators
    const tw = code.slice(i, i+2)
    if (['==','!=','<=','>=','&&','||','**','//','<<','>>','->','++','--','::'].includes(tw)) {
      tokens.push({ text: tw, type: 'operator' }); i += 2; continue
    }
    if ('+-*/<>=!&|%^~'.includes(code[i])) {
      tokens.push({ text: code[i], type: 'operator' }); i++; continue
    }

    // Punctuation
    if ('()[]{},.;:'.includes(code[i])) {
      tokens.push({ text: code[i], type: 'punct' }); i++; continue
    }

    tokens.push({ text: code[i], type: 'other' }); i++
  }

  return tokens
}

// ── HTML highlighter (used by Editor overlay) ─────────────────────────────────
const ESC = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

const TYPE_CLASS = {
  keyword:   'hl-kw',
  builtin:   'hl-builtin',
  type:      'hl-type',
  string:    'hl-str',
  number:    'hl-num',
  fn:        'hl-fn',
  operator:  'hl-op',
  comment:   'hl-cmt',
  directive: 'hl-dir',
  punct:     'hl-punct',
  ident:     'hl-id',
  ws:        null,
  nl:        null,
  other:     null,
}

export function highlight(code, lang) {
  const toks = tokenize(code, lang)
  return toks.map(t => {
    const cls = TYPE_CLASS[t.type]
    const escaped = ESC(t.text)
    return cls ? `<span class="${cls}">${escaped}</span>` : escaped
  }).join('')
}
