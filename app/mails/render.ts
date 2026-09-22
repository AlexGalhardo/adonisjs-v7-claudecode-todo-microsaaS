import { render } from '@react-email/render'
import type { ReactElement } from 'react'

/**
 * Renders an email JSX component to an HTML string suitable for
 * `this.message.html(...)` inside a `BaseMail#prepare()`.
 */
export function renderEmail(component: ReactElement): Promise<string> {
  return render(component)
}
