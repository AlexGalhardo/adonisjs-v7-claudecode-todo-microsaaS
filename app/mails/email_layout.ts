/**
 * Minimal shared HTML wrapper for transactional emails (password reset, magic
 * link). Kept as a plain template function rather than an Edge view since
 * these emails are a single heading, message and call-to-action button —
 * not worth a templating layer.
 */
export function emailLayout(options: {
  heading: string
  message: string
  actionUrl: string
  actionLabel: string
}) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${options.heading}</h1>
      <p style="font-size: 15px; color: #444; line-height: 1.5;">${options.message}</p>
      <p style="margin: 24px 0;">
        <a href="${options.actionUrl}" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">
          ${options.actionLabel}
        </a>
      </p>
      <p style="font-size: 13px; color: #888;">
        If the button doesn't work, copy and paste this link:<br />
        <span style="word-break: break-all;">${options.actionUrl}</span>
      </p>
    </div>
  `
}
