import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'

test.group('Checkout', () => {
  test('guests are redirected to login', async ({ client }) => {
    const response = await client.get('/checkout')

    response.assertRedirectsTo('/login')
  })

  test('renders the plan cards for a free-plan user', async ({ client }) => {
    const user = await UserFactory.create()

    const response = await client.get('/checkout').loginAs(user).withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('checkout')
  })

  test('redirects an already-subscribed user to their profile', async ({ client }) => {
    const user = await UserFactory.merge({ subscriptionStatus: 'active' }).create()

    const response = await client.get('/checkout').loginAs(user).withInertia()

    response.assertRedirectsTo('/profile')
  })
})
