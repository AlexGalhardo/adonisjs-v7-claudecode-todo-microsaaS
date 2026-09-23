/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'legal.terms': {
    methods: ["GET","HEAD"],
    pattern: '/terms',
    tokens: [{"old":"/terms","type":0,"val":"terms","end":""}],
    types: placeholder as Registry['legal.terms']['types'],
  },
  'legal.privacy': {
    methods: ["GET","HEAD"],
    pattern: '/privacy',
    tokens: [{"old":"/privacy","type":0,"val":"privacy","end":""}],
    types: placeholder as Registry['legal.privacy']['types'],
  },
  'contact.create': {
    methods: ["GET","HEAD"],
    pattern: '/contact',
    tokens: [{"old":"/contact","type":0,"val":"contact","end":""}],
    types: placeholder as Registry['contact.create']['types'],
  },
  'contact.store': {
    methods: ["POST"],
    pattern: '/contact',
    tokens: [{"old":"/contact","type":0,"val":"contact","end":""}],
    types: placeholder as Registry['contact.store']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'password_resets.create': {
    methods: ["GET","HEAD"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password_resets.create']['types'],
  },
  'password_resets.store': {
    methods: ["POST"],
    pattern: '/forgot-password',
    tokens: [{"old":"/forgot-password","type":0,"val":"forgot-password","end":""}],
    types: placeholder as Registry['password_resets.store']['types'],
  },
  'password_resets.edit': {
    methods: ["GET","HEAD"],
    pattern: '/reset-password/:token',
    tokens: [{"old":"/reset-password/:token","type":0,"val":"reset-password","end":""},{"old":"/reset-password/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['password_resets.edit']['types'],
  },
  'password_resets.update': {
    methods: ["PUT"],
    pattern: '/reset-password',
    tokens: [{"old":"/reset-password","type":0,"val":"reset-password","end":""}],
    types: placeholder as Registry['password_resets.update']['types'],
  },
  'magic_links.create': {
    methods: ["GET","HEAD"],
    pattern: '/magic-link',
    tokens: [{"old":"/magic-link","type":0,"val":"magic-link","end":""}],
    types: placeholder as Registry['magic_links.create']['types'],
  },
  'magic_links.store': {
    methods: ["POST"],
    pattern: '/magic-link',
    tokens: [{"old":"/magic-link","type":0,"val":"magic-link","end":""}],
    types: placeholder as Registry['magic_links.store']['types'],
  },
  'magic_links.consume': {
    methods: ["GET","HEAD"],
    pattern: '/magic-link/:token',
    tokens: [{"old":"/magic-link/:token","type":0,"val":"magic-link","end":""},{"old":"/magic-link/:token","type":1,"val":"token","end":""}],
    types: placeholder as Registry['magic_links.consume']['types'],
  },
  'two_factor_challenges.create': {
    methods: ["GET","HEAD"],
    pattern: '/two-factor/challenge',
    tokens: [{"old":"/two-factor/challenge","type":0,"val":"two-factor","end":""},{"old":"/two-factor/challenge","type":0,"val":"challenge","end":""}],
    types: placeholder as Registry['two_factor_challenges.create']['types'],
  },
  'two_factor_challenges.store': {
    methods: ["POST"],
    pattern: '/two-factor/challenge',
    tokens: [{"old":"/two-factor/challenge","type":0,"val":"two-factor","end":""},{"old":"/two-factor/challenge","type":0,"val":"challenge","end":""}],
    types: placeholder as Registry['two_factor_challenges.store']['types'],
  },
  'social_auths.redirect': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider/redirect',
    tokens: [{"old":"/oauth/:provider/redirect","type":0,"val":"oauth","end":""},{"old":"/oauth/:provider/redirect","type":1,"val":"provider","end":""},{"old":"/oauth/:provider/redirect","type":0,"val":"redirect","end":""}],
    types: placeholder as Registry['social_auths.redirect']['types'],
  },
  'social_auths.callback': {
    methods: ["GET","HEAD"],
    pattern: '/oauth/:provider/callback',
    tokens: [{"old":"/oauth/:provider/callback","type":0,"val":"oauth","end":""},{"old":"/oauth/:provider/callback","type":1,"val":"provider","end":""},{"old":"/oauth/:provider/callback","type":0,"val":"callback","end":""}],
    types: placeholder as Registry['social_auths.callback']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [{"old":"/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['dashboard']['types'],
  },
  'todos.store': {
    methods: ["POST"],
    pattern: '/todos',
    tokens: [{"old":"/todos","type":0,"val":"todos","end":""}],
    types: placeholder as Registry['todos.store']['types'],
  },
  'todos.update': {
    methods: ["PUT"],
    pattern: '/todos/:id',
    tokens: [{"old":"/todos/:id","type":0,"val":"todos","end":""},{"old":"/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['todos.update']['types'],
  },
  'todos.destroy': {
    methods: ["DELETE"],
    pattern: '/todos/:id',
    tokens: [{"old":"/todos/:id","type":0,"val":"todos","end":""},{"old":"/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['todos.destroy']['types'],
  },
  'two_factor_settings.create': {
    methods: ["GET","HEAD"],
    pattern: '/settings/two-factor',
    tokens: [{"old":"/settings/two-factor","type":0,"val":"settings","end":""},{"old":"/settings/two-factor","type":0,"val":"two-factor","end":""}],
    types: placeholder as Registry['two_factor_settings.create']['types'],
  },
  'two_factor_settings.store': {
    methods: ["POST"],
    pattern: '/settings/two-factor',
    tokens: [{"old":"/settings/two-factor","type":0,"val":"settings","end":""},{"old":"/settings/two-factor","type":0,"val":"two-factor","end":""}],
    types: placeholder as Registry['two_factor_settings.store']['types'],
  },
  'two_factor_settings.destroy': {
    methods: ["DELETE"],
    pattern: '/settings/two-factor',
    tokens: [{"old":"/settings/two-factor","type":0,"val":"settings","end":""},{"old":"/settings/two-factor","type":0,"val":"two-factor","end":""}],
    types: placeholder as Registry['two_factor_settings.destroy']['types'],
  },
  'api.session.store': {
    methods: ["POST"],
    pattern: '/api/login',
    tokens: [{"old":"/api/login","type":0,"val":"api","end":""},{"old":"/api/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['api.session.store']['types'],
  },
  'api.session.destroy': {
    methods: ["POST"],
    pattern: '/api/logout',
    tokens: [{"old":"/api/logout","type":0,"val":"api","end":""},{"old":"/api/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['api.session.destroy']['types'],
  },
  'api.todos.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/todos',
    tokens: [{"old":"/api/todos","type":0,"val":"api","end":""},{"old":"/api/todos","type":0,"val":"todos","end":""}],
    types: placeholder as Registry['api.todos.index']['types'],
  },
  'api.todos.store': {
    methods: ["POST"],
    pattern: '/api/todos',
    tokens: [{"old":"/api/todos","type":0,"val":"api","end":""},{"old":"/api/todos","type":0,"val":"todos","end":""}],
    types: placeholder as Registry['api.todos.store']['types'],
  },
  'api.todos.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/todos/:id',
    tokens: [{"old":"/api/todos/:id","type":0,"val":"api","end":""},{"old":"/api/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.todos.show']['types'],
  },
  'api.todos.update': {
    methods: ["PUT"],
    pattern: '/api/todos/:id',
    tokens: [{"old":"/api/todos/:id","type":0,"val":"api","end":""},{"old":"/api/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.todos.update']['types'],
  },
  'api.todos.destroy': {
    methods: ["DELETE"],
    pattern: '/api/todos/:id',
    tokens: [{"old":"/api/todos/:id","type":0,"val":"api","end":""},{"old":"/api/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['api.todos.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
