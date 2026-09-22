import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import MagicLinkNotification from '#mails/magic_link_notification'

test.group('Magic link', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('requesting a link sends an email and following it logs the user in', async ({
    client,
    assert,
  }) => {
    const fakeMailer = mail.fake()
    const user = await UserFactory.create()

    const response = await client
      .post('/magic-link')
      .withCsrfToken()
      .redirects(0)
      .form({ email: user.email })

    response.assertStatus(302)
    fakeMailer.mails.assertSent(MagicLinkNotification)

    const sent = fakeMailer.mails.sent()[0] as MagicLinkNotification
    const token = sent.loginUrl.split('/magic-link/')[1]

    const consumeResponse = await client.get(`/magic-link/${token}`).redirects(0)

    consumeResponse.assertStatus(302)
    assert.equal(consumeResponse.header('location'), '/todos')
    assert.equal(consumeResponse.session('auth_web'), user.id)
  })

  test('requesting a link for an unknown email still responds successfully', async ({ client }) => {
    const fakeMailer = mail.fake()

    const response = await client
      .post('/magic-link')
      .withCsrfToken()
      .redirects(0)
      .form({ email: 'nobody@example.com' })

    response.assertStatus(302)
    fakeMailer.mails.assertNoneSent()
  })

  test('an invalid link redirects to login with an error', async ({ client, assert }) => {
    const response = await client.get('/magic-link/invalid-token').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('a magic link can only be used once', async ({ client, assert }) => {
    const fakeMailer = mail.fake()
    const user = await UserFactory.create()

    await client.post('/magic-link').withCsrfToken().form({ email: user.email })
    const sent = fakeMailer.mails.sent()[0] as MagicLinkNotification
    const token = sent.loginUrl.split('/magic-link/')[1]

    await client.get(`/magic-link/${token}`)

    const secondAttempt = await client.get(`/magic-link/${token}`).redirects(0)
    secondAttempt.assertStatus(302)
    assert.equal(secondAttempt.header('location'), '/login')
  })
})
