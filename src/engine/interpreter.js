// ═══════════════════════════════════════════════════════════
//  SHARED EXPRESSION EVALUATOR  (Pratt parser)
// ═══════════════════════════════════════════════════════════

function lexExpr(s) {
  const toks = []; let i = 0
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue }
    if (s[i] === '"' || s[i] === "'") {
      const q = s[i]; i++; let str = ''
      while (i < s.length && s[i] !== q) {
        if (s[i] === '\\') {
          i++
          str += s[i]==='n'?'\n':s[i]==='t'?'\t':s[i]==='r'?'\r':s[i]==='0'?'\0':s[i]
        } else str += s[i]
        i++
      }
      i++; toks.push({ t:'s', v:str }); continue
    }
    if (/[0-9]/.test(s[i]) || (s[i]==='.' && /[0-9]/.test(s[i+1]))) {
      let n = ''; while (i < s.length && /[0-9.xXa-fA-F]/.test(s[i])) n += s[i++]
      toks.push({ t:'n', v:parseFloat(n) }); continue
    }
    const tw = s.slice(i,i+2)
    if (['==','!=','<=','>=','&&','||','**','//','++','--'].includes(tw)) {
      toks.push({ t:'o', v:tw }); i+=2; continue
    }
    if ('+-*/<>=!%&|^~'.includes(s[i])) { toks.push({ t:'o', v:s[i++] }); continue }
    if ('()[]{},.;:'.includes(s[i])) { toks.push({ t:'p', v:s[i++] }); continue }
    if (/[a-zA-Z_]/.test(s[i])) {
      let id = ''; while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) id += s[i++]
      toks.push({ t:'id', v:id }); continue
    }
    i++
  }
  return toks
}

function pOr(t,p,vars,fns,out)  { let {v:l,p:i}=pAnd(t,p,vars,fns,out); while(i<t.length&&(t[i].v==='||'||t[i].v==='or')){i++;const r=pAnd(t,i,vars,fns,out);l=l||r.v;i=r.p} return{v:l,p:i} }
function pAnd(t,p,vars,fns,out) { let {v:l,p:i}=pCmp(t,p,vars,fns,out); while(i<t.length&&(t[i].v==='&&'||t[i].v==='and')){i++;const r=pCmp(t,i,vars,fns,out);l=l&&r.v;i=r.p} return{v:l,p:i} }
function pCmp(t,p,vars,fns,out) {
  let {v:l,p:i}=pAdd(t,p,vars,fns,out)
  while(i<t.length&&['==','!=','<','>','<=','>='].includes(t[i].v)){
    const op=t[i].v;i++;const r=pAdd(t,i,vars,fns,out)
    l=op==='=='?l===r.v:op==='!='?l!==r.v:op==='<'?l<r.v:op==='>'?l>r.v:op==='<='?l<=r.v:l>=r.v
    i=r.p
  }
  return{v:l,p:i}
}
function pAdd(t,p,vars,fns,out) {
  let {v:l,p:i}=pMul(t,p,vars,fns,out)
  while(i<t.length&&(t[i].v==='+'||t[i].v==='-')){
    const op=t[i].v;i++;const r=pMul(t,i,vars,fns,out)
    l=op==='+'?(typeof l==='string'||typeof r.v==='string'?String(l)+String(r.v):l+r.v):l-r.v
    i=r.p
  }
  return{v:l,p:i}
}
function pMul(t,p,vars,fns,out) {
  let {v:l,p:i}=pUn(t,p,vars,fns,out)
  while(i<t.length&&['*','/','//','%','**'].includes(t[i].v)){
    const op=t[i].v;i++;const r=pUn(t,i,vars,fns,out)
    l=op==='*'?(typeof l==='string'?l.repeat(r.v):l*r.v):op==='/'?l/r.v:op==='//'?Math.floor(l/r.v):op==='%'?l%r.v:Math.pow(l,r.v)
    i=r.p
  }
  return{v:l,p:i}
}
function pUn(t,p,vars,fns,out) {
  if(p<t.length&&t[p].v==='-'){const r=pPrim(t,p+1,vars,fns,out);return{v:-r.v,p:r.p}}
  if(p<t.length&&(t[p].v==='!'||t[p].v==='not')){const r=pPrim(t,p+1,vars,fns,out);return{v:!r.v,p:r.p}}
  return pPrim(t,p,vars,fns,out)
}
function pPrim(t,p,vars,fns,out) {
  if(p>=t.length) return{v:undefined,p}
  const tok=t[p]
  if(tok.t==='n') return{v:tok.v,p:p+1}
  if(tok.t==='s') return{v:tok.v,p:p+1}
  if(tok.t==='id') {
    const name=tok.v
    if(name==='True'||name==='true') return{v:true,p:p+1}
    if(name==='False'||name==='false') return{v:false,p:p+1}
    if(name==='None'||name==='null'||name==='nullptr') return{v:null,p:p+1}
    // method call e.g. x.method(...)
    if(p+2<t.length&&t[p+1].t==='p'&&t[p+1].v==='.'&&t[p+2].t==='id') {
      const obj=name in vars?vars[name]:null
      const method=t[p+2].v
      if(p+3<t.length&&t[p+3].v==='(') {
        let i=p+4; const args=[]
        while(i<t.length&&t[i].v!==')'){
          const r=pOr(t,i,vars,fns,out);args.push(r.v);i=r.p
          if(i<t.length&&t[i].v===',')i++
        }
        return{v:callMethod(obj,method,args),p:i+1}
      }
      return{v:undefined,p:p+3}
    }
    // function call
    if(p+1<t.length&&t[p+1].t==='p'&&t[p+1].v==='(') {
      let i=p+2; const args=[]
      while(i<t.length&&t[i].v!==')'){
        const r=pOr(t,i,vars,fns,out);args.push(r.v);i=r.p
        if(i<t.length&&t[i].v===',')i++
      }
      return{v:callFn(name,args,vars,fns,out),p:i+1}
    }
    // array index
    if(p+1<t.length&&t[p+1].t==='p'&&t[p+1].v==='[') {
      const r=pOr(t,p+2,vars,fns,out)
      const arr=vars[name]
      return{v:Array.isArray(arr)?arr[r.v]:typeof arr==='string'?arr[r.v]:undefined,p:r.p+1}
    }
    return{v:name in vars?vars[name]:undefined,p:p+1}
  }
  if(tok.t==='p'&&tok.v==='('){const r=pOr(t,p+1,vars,fns,out);return{v:r.v,p:r.p+1}}
  return{v:undefined,p:p+1}
}

function callMethod(obj, method, args) {
  if(typeof obj==='string') {
    if(method==='upper') return obj.toUpperCase()
    if(method==='lower') return obj.toLowerCase()
    if(method==='strip'||method==='trim') return obj.trim()
    if(method==='split') return obj.split(args[0]??/\s+/)
    if(method==='join') return args[0].join(obj)
    if(method==='replace') return obj.replaceAll(args[0],args[1])
    if(method==='startswith') return obj.startsWith(args[0])
    if(method==='endswith') return obj.endsWith(args[0])
  }
  return undefined
}

function callFn(name, args, vars, fns, out) {
  switch(name) {
    case 'range': {
      const [a,b,c]=args
      if(args.length===1) return Array.from({length:Math.max(0,a)},(_,i)=>i)
      if(args.length===2) return Array.from({length:Math.max(0,b-a)},(_,i)=>i+a)
      const res=[];if(c>0)for(let i=a;i<b;i+=c)res.push(i);else for(let i=a;i>b;i+=c)res.push(i);return res
    }
    case 'len': return Array.isArray(args[0])?args[0].length:String(args[0]).length
    case 'str': return String(args[0]??'')
    case 'int': return Math.trunc(parseFloat(String(args[0]??0)))
    case 'float': return parseFloat(String(args[0]??0))
    case 'abs': return Math.abs(args[0])
    case 'max': return Math.max(...(Array.isArray(args[0])?args[0]:args))
    case 'min': return Math.min(...(Array.isArray(args[0])?args[0]:args))
    case 'sum': return (args[0]||[]).reduce((a,b)=>a+b,0)
    case 'round': return Number(args[0].toFixed(args[1]??0))
    case 'print': {
      out.push({type:'out',text:args.map(a=>pyStr(a)).join(' ')})
      return null
    }
    default:
      if(fns[name]) {
        const fn=fns[name]
        const lv={...vars}
        fn.params.forEach((p,i)=>{lv[p]=args[i]})
        try{pyExecNodes(fn.body,lv,fns,out,0)}
        catch(e){if(e?.type==='return')return e.value;throw e}
        return null
      }
      return undefined
  }
}

function evalExpr(expr, vars, fns, out) {
  if(!expr||!expr.trim()) return undefined
  try {
    const t=lexExpr(expr.trim())
    return pOr(t,0,vars,fns||{},out||[]).v
  } catch(e) { throw new Error(`Expression error: ${expr}`) }
}

function pyStr(v) {
  if(v===null||v===undefined) return 'None'
  if(v===true) return 'True'
  if(v===false) return 'False'
  if(Array.isArray(v)) return '['+v.map(pyStr).join(', ')+']'
  return String(v)
}

// ─── Split comma-separated args respecting quotes/parens ─────────────────────
function splitArgs(s) {
  const args=[]; let depth=0,cur='',i=0
  while(i<s.length) {
    const c=s[i]
    if(c==='"'||c==="'") {
      const q=c;cur+=c;i++
      while(i<s.length&&s[i]!==q){if(s[i]==='\\'){cur+=s[i]+s[i+1];i+=2}else{cur+=s[i++]}}
      cur+=s[i]||'';i++
    } else if('([{'.includes(c)){depth++;cur+=c;i++}
    else if(')]}'.includes(c)){depth--;cur+=c;i++}
    else if(c===','&&depth===0){args.push(cur);cur='';i++}
    else{cur+=c;i++}
  }
  if(cur.trim())args.push(cur)
  return args
}

// ═══════════════════════════════════════════════════════════
//  PYTHON
// ═══════════════════════════════════════════════════════════

function pyParseBlocks(lines, startIdx, parentIndent) {
  const nodes=[]; let i=startIdx
  while(i<lines.length) {
    const raw=lines[i].replace(/\t/g,'    ')
    const trimmed=raw.trimStart()
    const content=trimmed.replace(/#.*$/,'').trimEnd()
    if(!content){i++;continue}
    const indent=raw.length-trimmed.length
    if(parentIndent>=0&&indent<=parentIndent)break
    const node={content:content.trim(),indent,body:[]}
    i++
    if(content.trim().endsWith(':')) {
      const sub=pyParseBlocks(lines,i,indent)
      node.body=sub.nodes; i=sub.endIdx
    }
    nodes.push(node)
  }
  return{nodes,endIdx:i}
}

function pyExecNodes(nodes, vars, fns, out, depth) {
  if(depth>50) throw new Error('RecursionError: maximum recursion depth exceeded')
  let i=0
  while(i<nodes.length) {
    const node=nodes[i]
    const line=node.content
    if(/^elif\s/.test(line)||line==='else:'){i++;continue}

    // print(...)
    if(/^print\s*\(/.test(line)) {
      const inner=line.slice(line.indexOf('(')+1,line.lastIndexOf(')'))
      const args=splitArgs(inner)
      const vals=args.map(a=>evalExpr(a.trim(),vars,fns,out))
      out.push({type:'out',text:vals.map(v=>pyStr(v)).join(' ')})
    }
    // for var in iter:
    else if(/^for\s+\w+\s+in\s+/.test(line)) {
      const m=line.match(/^for\s+(\w+)\s+in\s+(.+):$/)
      if(m) {
        const varName=m[1]
        const iter=evalExpr(m[2],vars,fns,out)
        const iterable=Array.isArray(iter)?iter:typeof iter==='string'?[...iter]:[]
        for(const val of iterable) {
          vars[varName]=val
          try{pyExecNodes(node.body,vars,fns,out,depth+1)}
          catch(e){if(e?.type==='break')break;if(e?.type==='continue')continue;throw e}
        }
      }
    }
    // while cond:
    else if(/^while\s+/.test(line)) {
      const cond=line.replace(/^while\s+/,'').replace(/:$/,'')
      let iters=0
      while(evalExpr(cond,vars,fns,out)&&++iters<1000) {
        try{pyExecNodes(node.body,vars,fns,out,depth+1)}
        catch(e){if(e?.type==='break')break;if(e?.type==='continue')continue;throw e}
      }
    }
    // if/elif/else chain
    else if(/^if\s+/.test(line)) {
      const chain=[node]; let j=i+1
      while(j<nodes.length&&(/^elif\s+/.test(nodes[j].content)||nodes[j].content==='else:')){
        chain.push(nodes[j]);j++
        if(nodes[j-1].content==='else:')break
      }
      i=j; let handled=false
      for(const c of chain) {
        if(handled)break
        if(c.content==='else:'){pyExecNodes(c.body,vars,fns,out,depth+1);handled=true}
        else {
          const cond=c.content.replace(/^(if|elif)\s+/,'').replace(/:$/,'')
          if(evalExpr(cond,vars,fns,out)){pyExecNodes(c.body,vars,fns,out,depth+1);handled=true}
        }
      }
      continue
    }
    // def name(params):
    else if(/^def\s+/.test(line)) {
      const m=line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*:$/)
      if(m){
        const params=m[2].split(',').map(p=>p.trim().split('=')[0].trim()).filter(Boolean)
        fns[m[1]]={params,body:node.body}
      }
    }
    // return expr
    else if(/^return\b/.test(line)) {
      const expr=line.replace(/^return\s*/,'').trim()
      throw{type:'return',value:expr?evalExpr(expr,vars,fns,out):null}
    }
    else if(line==='break'){throw{type:'break'}}
    else if(line==='continue'){throw{type:'continue'}}
    // compound assignment x += ...
    else if(/^\w+\s*[+\-*\/]?=/.test(line)&&!/^\w+\s*==/.test(line)) {
      const cmp=line.match(/^(\w+)\s*([+\-*\/])=\s*(.+)$/)
      if(cmp){
        const curr=vars[cmp[1]]??0
        const r=evalExpr(cmp[3],vars,fns,out)
        vars[cmp[1]]=cmp[2]==='+'?(typeof curr==='string'?curr+String(r):curr+r):cmp[2]==='-'?curr-r:cmp[2]==='*'?curr*r:curr/r
      } else {
        const eq=line.indexOf('=')
        const varName=line.slice(0,eq).trim()
        vars[varName]=evalExpr(line.slice(eq+1).trim(),vars,fns,out)
      }
    }
    // expression statement (function call, etc.)
    else { try{evalExpr(line,vars,fns,out)}catch(e){/*ignore*/} }
    i++
  }
}

function runPython(code) {
  const out=[], vars={}, fns={}
  try {
    const lines=code.split('\n')
    const{nodes}=pyParseBlocks(lines,0,-1)
    pyExecNodes(nodes,vars,fns,out,0)
  } catch(e) {
    if(!e?.type) out.push({type:'error',text:'❌ '+(e.message||String(e))})
  }
  return{output:out,vars,fns}
}

// ═══════════════════════════════════════════════════════════
//  SHARED C/Java UTILITIES
// ═══════════════════════════════════════════════════════════

function stripComments(code) {
  return code.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'')
}

function findBraceBlock(code,startIdx) {
  let depth=0,start=-1,inStr=false,strCh=''
  for(let i=startIdx;i<code.length;i++) {
    const c=code[i]
    if(inStr){if(c==='\\'){ i++; continue } if(c===strCh)inStr=false; continue}
    if(c==='"'||c==="'"){inStr=true;strCh=c;continue}
    if(c==='{'){if(start<0)start=i;depth++}
    else if(c==='}'){depth--;if(depth===0)return{start,end:i,body:code.slice(start+1,i)}}
  }
  return null
}

function splitStatements(code) {
  const stmts=[]; let i=0,bd=0,pd=0,cur='',inStr=false,strCh=''
  while(i<code.length) {
    const c=code[i]
    if(inStr){
      if(c==='\\'){cur+=c+(code[i+1]||'');i+=2;continue}
      if(c===strCh)inStr=false
      cur+=c;i++;continue
    }
    if(c==='"'||c==="'"){inStr=true;strCh=c;cur+=c;i++;continue}
    if(c==='{'){bd++;cur+=c}
    else if(c==='}'){bd--;cur+=c;if(bd===0&&pd===0){stmts.push(cur);cur='';i++;continue}}
    else if(c==='('){pd++;cur+=c}
    else if(c===')'){pd--;cur+=c}
    else if(c===';'&&bd===0&&pd===0){stmts.push(cur);cur='';i++;continue}
    else cur+=c
    i++
  }
  if(cur.trim())stmts.push(cur)
  return stmts
}

function splitBySemicolon(s) {
  const parts=[]; let depth=0,cur=''
  for(const c of s){
    if(c==='(')depth++;else if(c===')')depth--;
    else if(c===';'&&depth===0){parts.push(cur);cur='';continue}
    cur+=c
  }
  parts.push(cur); return parts
}

function parseForLoop(stmt) {
  const fm=stmt.match(/^for\s*\(/)
  if(!fm)return null
  let depth=1,i=fm[0].length,header=[]
  while(i<stmt.length){
    if(stmt[i]==='(')depth++;else if(stmt[i]===')'){depth--;if(depth===0)break}
    header.push(stmt[i]);i++
  }
  if(depth!==0)return null
  const parts=splitBySemicolon(header.join(''))
  if(parts.length<3)return null
  const after=stmt.slice(i+1).trim()
  let body=''
  if(after.startsWith('{')){const bl=findBraceBlock(after,0);if(bl)body=bl.body}
  else body=after.replace(/;$/,'')
  return{init:parts[0].trim(),cond:parts[1].trim(),step:parts[2].trim(),body}
}

function cEval(expr,vars){
  if(!expr||!expr.trim())return 0
  try{return pOr(lexExpr(expr.trim()),0,vars,{},[]??[]).v}catch{return 0}
}

// ═══════════════════════════════════════════════════════════
//  JAVA
// ═══════════════════════════════════════════════════════════

function javaExecSimple(stmt,vars,out) {
  stmt=stmt.trim().replace(/;$/,'')
  if(!stmt||stmt.startsWith('//'))return
  // System.out.println/print
  const pm=stmt.match(/System\.out\.print(?:ln)?\s*\((.+)\)$/)
  if(pm){const v=cEval(pm[1].trim(),vars);out.push({type:'out',text:String(v??'null')});return}
  // variable decl
  const dm=stmt.match(/^(?:int|double|float|long|short|String|boolean|char|var)\s+(\w+)\s*=\s*(.+)$/)
  if(dm){vars[dm[1]]=cEval(dm[2].trim(),vars);return}
  // int i declared, no assignment
  const dm2=stmt.match(/^(?:int|double|float|long|short|boolean|char)\s+(\w+)$/)
  if(dm2){vars[dm2[1]]=0;return}
  // i++ / i--
  if(/^\w+\+\+$/.test(stmt)){const n=stmt.slice(0,-2);vars[n]=(vars[n]||0)+1;return}
  if(/^\w+--$/.test(stmt)){const n=stmt.slice(0,-2);vars[n]=(vars[n]||0)-1;return}
  // compound
  const cm=stmt.match(/^(\w+)\s*([+\-*\/])=\s*(.+)$/)
  if(cm){const curr=vars[cm[1]]??0;const r=cEval(cm[3],vars);vars[cm[1]]=cm[2]==='+'?(typeof curr==='string'?curr+String(r):curr+r):cm[2]==='-'?curr-r:cm[2]==='*'?curr*r:curr/r;return}
  // assign
  const am=stmt.match(/^(\w+)\s*=\s*(.+)$/)
  if(am&&!['return','if','for','while'].includes(am[1])){vars[am[1]]=cEval(am[2],vars)}
}

function javaExecBlock(body,vars,out,depth=0) {
  if(depth>50)return
  const stmts=splitStatements(body)
  let i=0
  while(i<stmts.length) {
    const stmt=stmts[i].trim();if(!stmt){i++;continue}
    if(/^for\s*\(/.test(stmt)){
      const fp=parseForLoop(stmt)
      if(fp){const lv={...vars};if(fp.init)javaExecSimple(fp.init,lv,out);let its=0;while(cEval(fp.cond,lv)&&++its<1000){javaExecBlock(fp.body,lv,out,depth+1);if(fp.step)javaExecSimple(fp.step,lv,out)};Object.assign(vars,lv)}
      i++;continue
    }
    if(/^while\s*\(/.test(stmt)){
      const m=stmt.match(/^while\s*\((.+?)\)\s*\{([\s\S]*)\}$/)
      if(m){let its=0;while(cEval(m[1],vars)&&++its<1000)javaExecBlock(m[2],vars,out,depth+1)}
      i++;continue
    }
    if(/^if\s*\(/.test(stmt)){
      const m=stmt.match(/^if\s*\((.+?)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?$/)
      if(m){if(cEval(m[1],vars))javaExecBlock(m[2],vars,out,depth+1);else if(m[3])javaExecBlock(m[3],vars,out,depth+1)}
      i++;continue
    }
    javaExecSimple(stmt,vars,out)
    i++
  }
}

function runJava(code) {
  const out=[],vars={}
  try {
    const clean=stripComments(code)
    const mm=clean.match(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/)
    if(!mm)throw new Error('No main() method found')
    const blk=findBraceBlock(clean,mm.index+mm[0].length-1)
    if(blk)javaExecBlock(blk.body,vars,out)
  } catch(e) { out.push({type:'error',text:'❌ '+(e.message||String(e))}) }
  return{output:out,vars}
}

// ═══════════════════════════════════════════════════════════
//  C
// ═══════════════════════════════════════════════════════════

function cExecSimple(stmt,vars,out) {
  stmt=stmt.trim().replace(/;$/,'')
  if(!stmt||stmt.startsWith('#')||stmt.startsWith('//'))return
  if(stmt==='return 0'||stmt==='return')return
  // printf
  const pf=stmt.match(/^printf\s*\((.+)\)$/)
  if(pf){
    const args=splitArgs(pf[1])
    let fmt=cEval(args[0],vars)
    if(typeof fmt==='string'){
      let ai=1
      fmt=fmt.replace(/%[disfcuxo]/g,spec=>{
        const v=cEval(args[ai++]||'0',vars)
        if(spec==='%d'||spec==='%i')return Math.trunc(v??0)
        if(spec==='%f')return(v??0).toFixed(6)
        if(spec==='%s')return String(v??'')
        if(spec==='%c')return String.fromCharCode(v??0)
        if(spec==='%x')return(v??0).toString(16)
        if(spec==='%o')return(v??0).toString(8)
        if(spec==='%u')return Math.abs(Math.trunc(v??0))
        return v??''
      })
      const lines=fmt.split('\n')
      lines.forEach((l,idx)=>{if(l||(idx<lines.length-1))out.push({type:'out',text:l})})
    }
    return
  }
  // var decl
  const dm=stmt.match(/^(?:int|double|float|long|short|char|unsigned|signed)\s+(\w+)(?:\s*=\s*(.+))?$/)
  if(dm){vars[dm[1]]=dm[2]?cEval(dm[2],vars):0;return}
  if(/^\w+\+\+$/.test(stmt)){const n=stmt.slice(0,-2);vars[n]=(vars[n]||0)+1;return}
  if(/^\w+--$/.test(stmt)){const n=stmt.slice(0,-2);vars[n]=(vars[n]||0)-1;return}
  const cm=stmt.match(/^(\w+)\s*([+\-*\/])=\s*(.+)$/);if(cm){const curr=vars[cm[1]]??0;vars[cm[1]]=cm[2]==='+'?curr+cEval(cm[3],vars):cm[2]==='-'?curr-cEval(cm[3],vars):cm[2]==='*'?curr*cEval(cm[3],vars):curr/cEval(cm[3],vars);return}
  const am=stmt.match(/^(\w+)\s*=\s*(.+)$/);if(am&&!['return','if','for','while'].includes(am[1]))vars[am[1]]=cEval(am[2],vars)
}

function cExecBlock(body,vars,out,depth=0) {
  if(depth>50)return
  const stmts=splitStatements(body); let i=0
  while(i<stmts.length){
    const stmt=stmts[i].trim();if(!stmt){i++;continue}
    if(/^for\s*\(/.test(stmt)){const fp=parseForLoop(stmt);if(fp){const lv={...vars};if(fp.init)cExecSimple(fp.init,lv,out);let its=0;while(cEval(fp.cond,lv)&&++its<1000){cExecBlock(fp.body,lv,out,depth+1);if(fp.step)cExecSimple(fp.step,lv,out)};Object.assign(vars,lv)};i++;continue}
    if(/^while\s*\(/.test(stmt)){const m=stmt.match(/^while\s*\((.+?)\)\s*\{([\s\S]*)\}$/);if(m){let its=0;while(cEval(m[1],vars)&&++its<1000)cExecBlock(m[2],vars,out,depth+1)};i++;continue}
    if(/^if\s*\(/.test(stmt)){const m=stmt.match(/^if\s*\((.+?)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?$/);if(m){if(cEval(m[1],vars))cExecBlock(m[2],vars,out,depth+1);else if(m[3])cExecBlock(m[3],vars,out,depth+1)};i++;continue}
    cExecSimple(stmt,vars,out);i++
  }
}

function runC(code) {
  const out=[],vars={}
  try {
    const clean=stripComments(code)
    const mm=clean.match(/int\s+main\s*\([^)]*\)\s*\{/)
    if(!mm)throw new Error('No main() function found')
    const blk=findBraceBlock(clean,mm.index+mm[0].length-1)
    if(blk)cExecBlock(blk.body,vars,out)
  } catch(e){ out.push({type:'error',text:'❌ '+(e.message||String(e))}) }
  return{output:out,vars}
}

// ═══════════════════════════════════════════════════════════
//  C++
// ═══════════════════════════════════════════════════════════

function cppExecSimple(stmt,vars,out) {
  stmt=stmt.trim().replace(/;$/,'')
  if(!stmt||stmt.startsWith('#')||stmt.startsWith('//'))return
  if(stmt==='return 0'||stmt==='return'||/^using\s+namespace/.test(stmt))return
  // cout
  if(/cout/.test(stmt)) {
    const raw=stmt.replace(/^\s*cout\s*/,'').replace(/<<\s*endl\s*$|<<\s*"\\n"\s*$/,'').trim()
    const parts=raw.split('<<').map(p=>p.trim()).filter(p=>p&&p!=='endl'&&p!=='"\\n"')
    const vals=parts.map(p=>{const v=cEval(p,vars);return v!==undefined?String(v):''})
    out.push({type:'out',text:vals.join('')})
    return
  }
  // delegate to C
  cExecSimple(stmt+';',vars,out)
}

function cppExecBlock(body,vars,out,depth=0) {
  if(depth>50)return
  const stmts=splitStatements(body); let i=0
  while(i<stmts.length){
    const stmt=stmts[i].trim();if(!stmt){i++;continue}
    if(/^for\s*\(/.test(stmt)){const fp=parseForLoop(stmt);if(fp){const lv={...vars};if(fp.init)cppExecSimple(fp.init,lv,out);let its=0;while(cEval(fp.cond,lv)&&++its<1000){cppExecBlock(fp.body,lv,out,depth+1);if(fp.step)cppExecSimple(fp.step,lv,out)};Object.assign(vars,lv)};i++;continue}
    if(/^while\s*\(/.test(stmt)){const m=stmt.match(/^while\s*\((.+?)\)\s*\{([\s\S]*)\}$/);if(m){let its=0;while(cEval(m[1],vars)&&++its<1000)cppExecBlock(m[2],vars,out,depth+1)};i++;continue}
    if(/^if\s*\(/.test(stmt)){const m=stmt.match(/^if\s*\((.+?)\)\s*\{([\s\S]*?)\}(?:\s*else\s*\{([\s\S]*?)\})?$/);if(m){if(cEval(m[1],vars))cppExecBlock(m[2],vars,out,depth+1);else if(m[3])cppExecBlock(m[3],vars,out,depth+1)};i++;continue}
    cppExecSimple(stmt,vars,out);i++
  }
}

function runCpp(code) {
  const out=[],vars={}
  try {
    const clean=stripComments(code)
    const mm=clean.match(/int\s+main\s*\([^)]*\)\s*\{/)
    if(!mm)throw new Error('No main() function found')
    const blk=findBraceBlock(clean,mm.index+mm[0].length-1)
    if(blk)cppExecBlock(blk.body,vars,out)
  } catch(e){ out.push({type:'error',text:'❌ '+(e.message||String(e))}) }
  return{output:out,vars}
}

// ═══════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════
export function runCode(code, lang) {
  switch(lang) {
    case 'python': return runPython(code)
    case 'java':   return runJava(code)
    case 'c':      return runC(code)
    case 'cpp':    return runCpp(code)
    default: return{output:[{type:'error',text:'Unknown language'}],vars:{}}
  }
}
