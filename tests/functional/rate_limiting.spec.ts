import limiter from '@adonisjs/limiter/services/main'
import { test } from '@japa/runner'

test.group('Rate limiting', (group) => {
  // Exhausting a throttle here would otherwise leak into every later test
  // hitting the same route — the in-memory store isn't covered by the
  // per-test DB transaction rollback.
  group.each.teardown(() => limiter.clear())

  test('login is throttled after 5 attempts per minute', async ({ client }) => {
    const attempt = () =>
      client
        .post('/login')
        .withCsrfToken()
        .redirects(0)
        .form({ email: 'nobody@example.com', password: 'wrong-password' })

    for (let i = 0; i < 5; i++) {
      const response = await attempt()
      response.assertStatus(302)
    }

    const throttled = await attempt()
    throttled.assertStatus(429)
  }).timeout(10000)
})
