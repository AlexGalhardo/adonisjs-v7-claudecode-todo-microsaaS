/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  todos: {
    index: typeof routes['todos.index']
    store: typeof routes['todos.store']
    update: typeof routes['todos.update']
    destroy: typeof routes['todos.destroy']
  }
  api: {
    session: {
      store: typeof routes['api.session.store']
      destroy: typeof routes['api.session.destroy']
    }
    todos: {
      index: typeof routes['api.todos.index']
      store: typeof routes['api.todos.store']
      show: typeof routes['api.todos.show']
      update: typeof routes['api.todos.update']
      destroy: typeof routes['api.todos.destroy']
    }
  }
}
