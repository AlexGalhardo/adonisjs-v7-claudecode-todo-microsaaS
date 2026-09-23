const SUBJECT_LABELS = {
  bug: 'Bug / technical issue',
  suggestion: 'Suggestion or question',
  other: 'Other',
}

export function ContactNotification(props: {
  fullName: string
  email: string
  subject: keyof typeof SUBJECT_LABELS
  message: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        style={{
          margin: 0,
          padding: '32px 24px',
          fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          backgroundColor: '#f4f4f5',
        }}
      >
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: '#ffffff', borderRadius: 8, maxWidth: 480, margin: '0 auto' }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '32px 24px' }}>
                <h1 style={{ fontSize: 18, margin: '0 0 16px', color: '#111111' }}>
                  New contact form message
                </h1>
                <p style={{ fontSize: 14, color: '#444444', margin: '0 0 4px' }}>
                  <strong>From:</strong> {props.fullName} ({props.email})
                </p>
                <p style={{ fontSize: 14, color: '#444444', margin: '0 0 16px' }}>
                  <strong>Subject:</strong> {SUBJECT_LABELS[props.subject]}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: '#111111',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {props.message}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
