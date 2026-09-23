import mail from '@adonisjs/mail/services/main'
import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import PasswordResetNotification from '#mails/password_reset_notification'

test.group('Password reset', (group) => {
  group.each.teardown(() => {
    mail.restore()
  })

  test('requesting a reset sends an email with a working link', async ({ client, assert }) => {
    const fakeMailer = mail.fake()
    const user = await UserFactory.create()

    const response = await client
      .post('/forgot-password')
      .withCsrfToken()
      .redirects(0)
      .form({ email: user.email })

    response.assertStatus(302)
    fakeMailer.mails.assertSent(PasswordResetNotification, (m) =>
      m.resetUrl.includes('/reset-password/')
    )

    const sent = fakeMailer.mails.sent()[0] as PasswordResetNotification
    const token = sent.resetUrl.split('/reset-password/')[1]

    const resetResponse = await client
      .put('/reset-password')
      .withCsrfToken()
      .redirects(0)
      .form({ token, password: 'NewPassword123!', passwordConfirmation: 'NewPassword123!' })

    resetResponse.assertStatus(302)
    await user.refresh()
    assert.isTrue(await user.verifyPassword('NewPassword123!'))
  })

  test('requesting a reset for an unknown email still responds successfully', async ({
    client,
  }) => {
    const fakeMailer = mail.fake()

    const response = await client
      .post('/forgot-password')
      .withCsrfToken()
      .redirects(0)
      .form({ email: 'nobody@example.com' })

    response.assertStatus(302)
    fakeMailer.mails.assertNoneSent()
  })

  test('an invalid token is rejected', async ({ client }) => {
    const response = await client.put('/reset-password').withCsrfToken().redirects(0).form({
      token: 'invalid',
      password: 'NewPassword123!',
      passwordConfirmation: 'NewPassword123!',
    })

    response.assertStatus(302)
    response.assertFlashMessage('error')
  })

  test('a token can only be used once', async ({ client, assert }) => {
    const fakeMailer = mail.fake()
    const user = await UserFactory.create()

    await client.post('/forgot-password').withCsrfToken().form({ email: user.email })
    const sent = fakeMailer.mails.sent()[0] as PasswordResetNotification
    const token = sent.resetUrl.split('/reset-password/')[1]

    await client
      .put('/reset-password')
      .withCsrfToken()
      .form({ token, password: 'NewPassword123!', passwordConfirmation: 'NewPassword123!' })

    const secondAttempt = await client.put('/reset-password').withCsrfToken().redirects(0).form({
      token,
      password: 'AnotherPassword123!',
      passwordConfirmation: 'AnotherPassword123!',
    })

    secondAttempt.assertStatus(302)
    secondAttempt.assertFlashMessage('error')
    await user.refresh()
    assert.isTrue(await user.verifyPassword('NewPassword123!'))
  })
})
