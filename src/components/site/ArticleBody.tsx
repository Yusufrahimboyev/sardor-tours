import s from './site.module.css';

type Block = { kind: 'h'; text: string } | { kind: 'p'; text: string } | { kind: 'ul'; items: string[] };

/** Parses the small article format: blank-line separated paragraphs, "## " headings, "- " bullet lines. */
function parse(body: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ kind: 'p', text: para.join(' ') });
    para = [];
  };
  for (const raw of body.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith('## ')) {
      flush();
      out.push({ kind: 'h', text: line.slice(3) });
    } else if (line.startsWith('- ')) {
      flush();
      const last = out[out.length - 1];
      if (last?.kind === 'ul') last.items.push(line.slice(2));
      else out.push({ kind: 'ul', items: [line.slice(2)] });
    } else {
      para.push(line);
    }
  }
  flush();
  return out;
}

export function ArticleBody({ body }: { body: string }) {
  return (
    <div className={s.prose}>
      {parse(body).map((b, i) =>
        b.kind === 'h' ? (
          <h2 key={i}>{b.text}</h2>
        ) : b.kind === 'ul' ? (
          <ul key={i}>
            {b.items.map((it, j) => (
              <li key={j}>{it}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{b.text}</p>
        ),
      )}
    </div>
  );
}
