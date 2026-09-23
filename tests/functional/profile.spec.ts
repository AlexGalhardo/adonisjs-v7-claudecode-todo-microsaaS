import limiter from '@adonisjs/limiter/services/main'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { UserFactory } from '#database/factories/user_factory'

test.group('Profile', (group) => {
  // Two tests below hit POST /login (loginThrottle) — same in-memory-store
  // leak risk rate_limiting.spec.ts guards against for its own test.
  group.each.teardown(() => limiter.clear())

  test('updates the full name', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .patch('/profile')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({ fullName: 'Updated Name' })

    response.assertStatus(302)
    await user.refresh()
    assert.equal(user.fullName, 'Updated Name')
  })

  test('rejects a password change with the wrong current password', async ({ client, assert }) => {
    const user = await UserFactory.create()

    const response = await client
      .put('/profile/password')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({
        currentPassword: 'WrongPassword123!',
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      })

    response.assertStatus(302)
    response.assertFlashMessage('error')
    await user.refresh()
    assert.isFalse(await user.verifyPassword('NewPassword123!'))
  })

  test('updates the password when the current one is correct', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'CurrentPassword123!' }).create()

    const response = await client
      .put('/profile/password')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .form({
        currentPassword: 'CurrentPassword123!',
        password: 'NewPassword123!',
        passwordConfirmation: 'NewPassword123!',
      })

    response.assertStatus(302)
    await user.refresh()
    assert.isTrue(await user.verifyPassword('NewPassword123!'))
  })

  test('deleting the account logs the user out and schedules deletion', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()

    const response = await client.delete('/profile').loginAs(user).withCsrfToken().redirects(0)

    response.assertStatus(302)
    await user.refresh()
    assert.isNotNull(user.deletionRequestedAt)
  })

  test('logging back in within 30 days cancels a pending deletion', async ({ client, assert }) => {
    const user = await UserFactory.merge({ password: 'Password123!' }).create()
    user.deletionRequestedAt = DateTime.now().minus({ days: 5 })
    await user.save()

    const response = await client
      .post('/login')
      .withCsrfToken()
      .redirects(0)
      .form({ email: user.email, password: 'Password123!' })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/dashboard')
    await user.refresh()
    assert.isNull(user.deletionRequestedAt)
  })

  test('logging in after 30 days is denied as if the account was deleted', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.merge({ password: 'Password123!' }).create()
    user.deletionRequestedAt = DateTime.now().minus({ days: 31 })
    await user.save()

    const response = await client
      .post('/login')
      .withCsrfToken()
      .redirects(0)
      .form({ email: user.email, password: 'Password123!' })

    response.assertStatus(302)
    response.assertFlashMessage('error')
    await user.refresh()
    assert.isNotNull(user.deletionRequestedAt)
  })
})
