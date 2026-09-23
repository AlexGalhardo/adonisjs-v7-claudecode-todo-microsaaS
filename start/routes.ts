/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import {
  loginThrottle,
  magicLinkThrottle,
  passwordResetThrottle,
  contactThrottle,
} from '#start/limiter'

router.on('/').renderInertia('home', {}).as('home').use(middleware.guest())

router.get('terms', [controllers.Legal, 'terms'])
router.get('privacy', [controllers.Legal, 'privacy'])

router.get('contact', [controllers.Contact, 'create'])
router.post('contact', [controllers.Contact, 'store']).use(contactThrottle)

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store']).use(loginThrottle)

    router.get('forgot-password', [controllers.PasswordResets, 'create'])
    router.post('forgot-password', [controllers.PasswordResets, 'store']).use(passwordResetThrottle)
    router.get('reset-password/:token', [controllers.PasswordResets, 'edit'])
    router.put('reset-password', [controllers.PasswordResets, 'update'])

    router.get('magic-link', [controllers.MagicLinks, 'create'])
    router.post('magic-link', [controllers.MagicLinks, 'store']).use(magicLinkThrottle)
    router.get('magic-link/:token', [controllers.MagicLinks, 'consume'])

    router.get('two-factor/challenge', [controllers.TwoFactorChallenges, 'create'])
    router.post('two-factor/challenge', [controllers.TwoFactorChallenges, 'store'])

    router.get('oauth/:provider/redirect', [controllers.SocialAuths, 'redirect'])
    router.get('oauth/:provider/callback', [controllers.SocialAuths, 'callback'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('dashboard', [controllers.Todos, 'index']).as('dashboard')
    router.post('todos', [controllers.Todos, 'store'])
    router.put('todos/:id', [controllers.Todos, 'update'])
    router.delete('todos/:id', [controllers.Todos, 'destroy'])

    router.get('settings/two-factor', [controllers.TwoFactorSettings, 'create'])
    router.post('settings/two-factor', [controllers.TwoFactorSettings, 'store'])
    router.delete('settings/two-factor', [controllers.TwoFactorSettings, 'destroy'])

    router.get('profile/api', [controllers.ProfileApi, 'index'])
    router.post('profile/api/tokens', [controllers.ProfileApi, 'store'])
    router.delete('profile/api/tokens/:id', [controllers.ProfileApi, 'destroy'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.post('login', [controllers.api.Session, 'store']).as('api.session.store')

    router
      .group(() => {
        router.post('logout', [controllers.api.Session, 'destroy']).as('api.session.destroy')

        router.get('todos', [controllers.api.Todos, 'index']).as('api.todos.index')
        router.post('todos', [controllers.api.Todos, 'store']).as('api.todos.store')
        router.get('todos/:id', [controllers.api.Todos, 'show']).as('api.todos.show')
        router.put('todos/:id', [controllers.api.Todos, 'update']).as('api.todos.update')
        router.delete('todos/:id', [controllers.api.Todos, 'destroy']).as('api.todos.destroy')
      })
      .use(middleware.auth({ guards: ['api'] }))
  })
  .prefix('api')
