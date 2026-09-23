import { test } from '@japa/runner'

test.group('Stripe webhooks', () => {
  test('rejects a request with no signature header', async ({ client }) => {
    const response = await client.post('/webhooks/stripe').json({ id: 'evt_test' })

    response.assertStatus(400)
  })

  test('rejects a request with an invalid signature', async ({ client }) => {
    const response = await client
      .post('/webhooks/stripe')
      .header('stripe-signature', 't=1,v1=invalid')
      .json({ id: 'evt_test', type: 'checkout.session.completed' })

    response.assertStatus(400)
  })
})
