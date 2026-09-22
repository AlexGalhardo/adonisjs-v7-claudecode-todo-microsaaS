/**
 * Shared layout for every transactional email in this app: a heading, a
 * message, a call-to-action button, and a plain-text fallback link. Plain
 * JSX/inline styles (not the `@react-email/components` package, which — along
 * with every individual `@react-email/*` primitive — is deprecated in favor
 * of the unified `react-email` package; that package pulls its whole CLI
 * toolchain, esbuild/tailwindcss/prismjs included, into the dependency tree,
 * which is not worth it for two simple emails). Rendered to an HTML string
 * with `@react-email/render` (still maintained on its own, lean deps) via
 * `renderEmail()` in `app/mails/render.ts`.
 */
export function EmailLayout(props: {
  previewText: string
  heading: string
  message: string
  actionUrl: string
  actionLabel: string
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.heading}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#f4f4f5',
          fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <span
          style={{
            display: 'none',
            overflow: 'hidden',
            lineHeight: '1px',
            opacity: 0,
            maxHeight: 0,
            maxWidth: 0,
          }}
        >
          {props.previewText}
        </span>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: '#f4f4f5', padding: '32px 0' }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  role="presentation"
                  width="480"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 8,
                    padding: '32px 24px',
                    maxWidth: 480,
                  }}
                >
                  <tbody>
                    <tr>
                      <td>
                        <h1 style={{ fontSize: 20, margin: '0 0 16px', color: '#111111' }}>
                          {props.heading}
                        </h1>
                        <p style={{ fontSize: 15, color: '#444444', lineHeight: 1.5, margin: 0 }}>
                          {props.message}
                        </p>
                        <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '24px 0' }}>
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  backgroundColor: '#111111',
                                  borderRadius: 6,
                                }}
                              >
                                <a
                                  href={props.actionUrl}
                                  style={{
                                    display: 'inline-block',
                                    padding: '10px 20px',
                                    color: '#ffffff',
                                    textDecoration: 'none',
                                    fontWeight: 500,
                                    fontSize: 15,
                                  }}
                                >
                                  {props.actionLabel}
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <p style={{ fontSize: 13, color: '#888888', margin: 0 }}>
                          If the button doesn't work, copy and paste this link:
                          <br />
                          <span style={{ wordBreak: 'break-all' }}>{props.actionUrl}</span>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}
