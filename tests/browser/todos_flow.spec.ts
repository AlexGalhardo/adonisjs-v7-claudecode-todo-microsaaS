import env from '#start/env'
import { test } from '@japa/runner'

const baseUrl = `http://${env.get('HOST')}:${env.get('PORT')}`

test.group('Todos flow', () => {
  test('signup, create/toggle/edit/delete a todo, then logout', async ({ visit, assert }) => {
    const email = `browser-${Date.now()}@example.com`

    const signupPage = await visit(`${baseUrl}/signup`)
    await signupPage.fill('#fullName', 'Browser Test')
    await signupPage.fill('#email', email)
    await signupPage.fill('#password', 'Password123!')
    await signupPage.fill('#passwordConfirmation', 'Password123!')
    await signupPage.click('button[type=submit]')
    await signupPage.waitForURL('**/dashboard')

    // Create
    await signupPage.click('text=New todo')
    await signupPage.fill('#title', 'Buy milk')
    await signupPage.fill('#description', 'Whole milk, 2 liters')
    await signupPage.click('button[type=submit]:has-text("Create")')
    await signupPage.assertExists('text=Buy milk')

    // Toggle complete
    await signupPage.click('[role=checkbox]')
    await signupPage.assertVisible('.line-through')

    // Edit
    await signupPage.click('text=⋯')
    await signupPage.click('text=Edit')
    await signupPage.fill('#title', 'Buy oat milk')
    await signupPage.click('button[type=submit]:has-text("Save")')
    await signupPage.assertExists('text=Buy oat milk')

    // Delete
    await signupPage.click('text=⋯')
    await signupPage.click('text=Delete')
    await signupPage.assertExists('text=No todos yet')

    // Logout
    await signupPage.click('[aria-label="User menu"]')
    await signupPage.click('text=Logout')
    await signupPage.waitForURL('**/login')
    assert.include(signupPage.url(), '/login')
  })
})
