import User from '#models/user'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Profile API tokens', () => {
  test('generating a token flashes the plain value once', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const storeResponse = await client
      .post('/profile/api/tokens')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ name: 'CLI token' })

    storeResponse.assertStatus(302)
    assert.match(String(storeResponse.flashMessage('newApiToken')), /^oat_/)

    const indexResponse = await client.get('/profile/api').loginAs(user).withInertia()
    indexResponse.assertStatus(200)
    assert.lengthOf(indexResponse.inertiaProps.tokens, 1)
    assert.equal(indexResponse.inertiaProps.tokens[0].name, 'CLI token')
    // Not the same request that created it — the one-time flash is already gone.
    assert.isUndefined(indexResponse.inertiaProps.newToken)
  })

  test('the generated token actually authenticates API requests', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const storeResponse = await client
      .post('/profile/api/tokens')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ name: 'CLI token' })
    const plainToken = String(storeResponse.flashMessage('newApiToken'))

    const apiResponse = await client
      .get('/api/todos')
      .header('Authorization', `Bearer ${plainToken}`)
    apiResponse.assertStatus(200)
    assert.isArray(apiResponse.body().data)
  })

  test('revoking a token removes it and it can no longer authenticate', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const token = await User.accessTokens.create(user, ['*'], { name: 'to revoke' })
    const plainToken = token.value!.release()

    const destroyResponse = await client
      .delete(`/profile/api/tokens/${token.identifier}`)
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)

    destroyResponse.assertStatus(302)

    const apiResponse = await client
      .get('/api/todos')
      .header('Authorization', `Bearer ${plainToken}`)
    apiResponse.assertStatus(401)

    const indexResponse = await client.get('/profile/api').loginAs(user).withInertia()
    assert.lengthOf(indexResponse.inertiaProps.tokens, 0)
  })

  test("a user cannot revoke another user's token", async ({ client, assert }) => {
    const owner = await UserFactory.create()
    const intruder = await UserFactory.create()
    const token = await User.accessTokens.create(owner, ['*'], { name: 'owner token' })

    await client
      .delete(`/profile/api/tokens/${token.identifier}`)
      .loginAs(intruder)
      .withCsrfToken()
      .redirects(0)

    const stillThere = await User.accessTokens.find(owner, token.identifier)
    assert.isNotNull(stillThere)
  })
})
