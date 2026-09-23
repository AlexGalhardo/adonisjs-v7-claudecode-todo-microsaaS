/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes.
|
*/

import limiter from '@adonisjs/limiter/services/main'

/**
 * Keyed by IP by default — protects against brute-force login attempts.
 */
export const loginThrottle = limiter.define('login', () => {
  return limiter.allowRequests(5).every('1 minute').blockFor('5 minutes')
})

/**
 * Keyed by IP — protects against abusing the password-reset flow to spam
 * arbitrary email addresses.
 */
export const passwordResetThrottle = limiter.define('password_reset', () => {
  return limiter.allowRequests(3).every('15 minutes')
})

/**
 * Same limits as password reset — same abuse shape (spamming emails to
 * arbitrary addresses).
 */
export const magicLinkThrottle = limiter.define('magic_link', () => {
  return limiter.allowRequests(3).every('15 minutes')
})

/**
 * The contact form is public and sends an email on every submission —
 * same spam-vector shape as the flows above.
 */
export const contactThrottle = limiter.define('contact', () => {
  return limiter.allowRequests(3).every('15 minutes')
})
