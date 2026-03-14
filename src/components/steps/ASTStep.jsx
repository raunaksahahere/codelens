function ASTNode({ node, depth = 0 }) {
  if (!node) return null

  const colors = ['var(--lc)', 'var(--tok-str)', 'var(--tok-num)', 'var(--tok-fn)', 'var(--tok-type)', 'var(--tok-kw)']
  const color = colors[depth % colors.length]

  return (
    <div className="ast-node" style={{ marginLeft: depth * 18 }}>
      <span className="ast-connector" style={{ color }}>
        {depth > 0 ? '|- ' : ''}
      </span>
      <span className="ast-type" style={{ color }}>{node.type}</span>
      {node.value && (
        <span className="ast-val">
          {' '}
          <span className="ast-val-text">
            {node.value.length > 40 ? `${node.value.slice(0, 38)}...` : node.value}
          </span>
        </span>
      )}
      {node.children?.map((child, index) => (
        <ASTNode key={index} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export function ASTStep({ data, lang, stepMeta }) {
  const { tree } = data
  const langDescriptions = {
    python: 'Python usually builds a module that contains a list of statements.',
    java: 'Java usually builds a compilation unit that contains classes, methods, and statements.',
    c: 'C usually builds a translation unit that contains function definitions and statements.',
    cpp: 'C++ follows the same core structure as C, with extra nodes for classes, templates, and namespaces.',
  }

  return (
    <div className="step-card">
      <div className="step-header">
        <span>{stepMeta.title}</span>
        <span className="step-sub">{stepMeta.sub}</span>
      </div>
      <p className="step-desc">
        The <strong>parser</strong> turns the token stream into an <strong>Abstract Syntax Tree</strong>.
        This tree represents the structure of your program so the compiler or interpreter can reason about it.
      </p>
      <div className="info-box">
        <strong>Tip:</strong> The AST is like a grammar diagram for code. It shows what belongs to what,
        such as a loop body, a function call, or a variable assignment.
        <em>{langDescriptions[lang]}</em>
      </div>
      <div className="step-label">Simplified AST</div>
      <div className="ast-tree">
        <ASTNode node={tree} depth={0} />
      </div>
    </div>
  )
}
