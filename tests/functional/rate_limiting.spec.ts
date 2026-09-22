import { test } from '@japa/runner'

test.group('Rate limiting', () => {
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
