import { test } from '@japa/runner'

test.group('Unknown routes', () => {
  test('an unmatched path redirects to the landing page', async ({ client, assert }) => {
    const response = await client.get('/this-route-does-not-exist').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/')
  })
})
