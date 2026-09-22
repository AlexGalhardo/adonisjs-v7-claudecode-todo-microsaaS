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

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])

    router.get('todos', [controllers.Todos, 'index'])
    router.post('todos', [controllers.Todos, 'store'])
    router.put('todos/:id', [controllers.Todos, 'update'])
    router.delete('todos/:id', [controllers.Todos, 'destroy'])
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
