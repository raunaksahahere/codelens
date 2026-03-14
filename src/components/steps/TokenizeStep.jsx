export function TokenizeStep({ data, stepMeta }) {
  const { tokens = [] } = data
  const typeLabels = {
    keyword: 'KW',
    builtin: 'BUILTIN',
    type: 'TYPE',
    string: 'STR',
    number: 'NUM',
    fn: 'FN',
    operator: 'OP',
    comment: 'CMT',
    directive: 'DIR',
    punct: 'PUNCT',
    ident: 'ID',
    other: '?',
  }

  return (
    <div className="step-card">
      <div className="step-header">
        <span>{stepMeta.title}</span>
        <span className="step-sub">{stepMeta.sub}</span>
      </div>
      <p className="step-desc">
        The <strong>lexer</strong> scans your source code character by character and groups those
        characters into <em>tokens</em>, the smallest meaningful units in the language.
      </p>
      <div className="info-box">
        <strong>Tip:</strong> Think of tokens like words and punctuation in a sentence. A string,
        a number, and an equals sign each play a different role.
      </div>
      <div className="step-label">Token stream ({tokens.length} tokens)</div>
      <div className="token-wrap">
        {tokens.map((token, index) => (
          <span
            key={index}
            className={`token-chip tc-${token.type}`}
            title={`${typeLabels[token.type] || '?'}: ${token.text}`}
            style={{ animationDelay: `${Math.min(index * 18, 500)}ms` }}
          >
            <span className="tc-text">{token.text.length > 16 ? `${token.text.slice(0, 14)}...` : token.text}</span>
            <span className="tc-badge">{typeLabels[token.type] || '?'}</span>
          </span>
        ))}
      </div>
      <div className="legend-row">
        {['keyword', 'string', 'number', 'fn', 'operator', 'comment', 'type', 'punct', 'ident'].map((type) => (
          <span key={type} className={`legend-item tc-${type}`}>{typeLabels[type] || type}</span>
        ))}
      </div>
    </div>
  )
}
