import { test } from '@japa/runner'

test.group('Social auth', () => {
  test('redirect to an unsupported provider is a 404', async ({ client }) => {
    const response = await client.get('/oauth/facebook/redirect').redirects(0)

    response.assertStatus(404)
  })

  test('callback for an unsupported provider is a 404', async ({ client }) => {
    const response = await client.get('/oauth/facebook/callback').redirects(0)

    response.assertStatus(404)
  })

  test('redirect to google sends the browser to Google', async ({ client, assert }) => {
    const response = await client.get('/oauth/google/redirect').redirects(0)

    response.assertStatus(302)
    assert.include(response.header('location'), 'accounts.google.com')
  })

  test('redirect to github sends the browser to GitHub', async ({ client, assert }) => {
    const response = await client.get('/oauth/github/redirect').redirects(0)

    response.assertStatus(302)
    assert.include(response.header('location'), 'github.com')
  })
})
