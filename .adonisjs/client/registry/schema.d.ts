/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_resets.create': {
    methods: ["GET","HEAD"]
    pattern: '/forgot-password'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['create']>>>
    }
  }
  'password_resets.store': {
    methods: ["POST"]
    pattern: '/forgot-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/password_reset').forgotPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/password_reset').forgotPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'password_resets.edit': {
    methods: ["GET","HEAD"]
    pattern: '/reset-password/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['edit']>>>
    }
  }
  'password_resets.update': {
    methods: ["PUT"]
    pattern: '/reset-password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/password_reset').resetPasswordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/password_reset').resetPasswordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/password_resets_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'magic_links.create': {
    methods: ["GET","HEAD"]
    pattern: '/magic-link'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['create']>>>
    }
  }
  'magic_links.store': {
    methods: ["POST"]
    pattern: '/magic-link'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/magic_link').requestMagicLinkValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/magic_link').requestMagicLinkValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'magic_links.consume': {
    methods: ["GET","HEAD"]
    pattern: '/magic-link/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['consume']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/magic_links_controller').default['consume']>>>
    }
  }
  'two_factor_challenges.create': {
    methods: ["GET","HEAD"]
    pattern: '/two-factor/challenge'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/two_factor_challenges_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/two_factor_challenges_controller').default['create']>>>
    }
  }
  'two_factor_challenges.store': {
    methods: ["POST"]
    pattern: '/two-factor/challenge'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/two_factor').twoFactorChallengeValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/two_factor').twoFactorChallengeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/two_factor_challenges_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/two_factor_challenges_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'social_auths.redirect': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider/redirect'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social_auths_controller').default['redirect']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social_auths_controller').default['redirect']>>>
    }
  }
  'social_auths.callback': {
    methods: ["GET","HEAD"]
    pattern: '/oauth/:provider/callback'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { provider: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/social_auths_controller').default['callback']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/social_auths_controller').default['callback']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'todos.index': {
    methods: ["GET","HEAD"]
    pattern: '/todos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['index']>>>
    }
  }
  'todos.store': {
    methods: ["POST"]
    pattern: '/todos'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/todo').createTodoValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/todo').createTodoValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'todos.update': {
    methods: ["PUT"]
    pattern: '/todos/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/todo').updateTodoValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/todo').updateTodoValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'todos.destroy': {
    methods: ["DELETE"]
    pattern: '/todos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/todos_controller').default['destroy']>>>
    }
  }
  'two_factor_settings.create': {
    methods: ["GET","HEAD"]
    pattern: '/settings/two-factor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['create']>>>
    }
  }
  'two_factor_settings.store': {
    methods: ["POST"]
    pattern: '/settings/two-factor'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/two_factor').confirmTwoFactorValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/two_factor').confirmTwoFactorValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'two_factor_settings.destroy': {
    methods: ["DELETE"]
    pattern: '/settings/two-factor'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/two_factor_settings_controller').default['destroy']>>>
    }
  }
  'api.session.store': {
    methods: ["POST"]
    pattern: '/api/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.session.destroy': {
    methods: ["POST"]
    pattern: '/api/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/session_controller').default['destroy']>>>
    }
  }
  'api.todos.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/todos'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['index']>>>
    }
  }
  'api.todos.store': {
    methods: ["POST"]
    pattern: '/api/todos'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/todo').createTodoValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/todo').createTodoValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.todos.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/todos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['show']>>>
    }
  }
  'api.todos.update': {
    methods: ["PUT"]
    pattern: '/api/todos/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/todo').updateTodoValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/todo').updateTodoValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.todos.destroy': {
    methods: ["DELETE"]
    pattern: '/api/todos/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/todos_controller').default['destroy']>>>
    }
  }
}
