import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
    'password_resets.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'password_resets.update': { paramsTuple?: []; params?: {} }
    'magic_links.create': { paramsTuple?: []; params?: {} }
    'magic_links.store': { paramsTuple?: []; params?: {} }
    'magic_links.consume': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'two_factor_challenges.create': { paramsTuple?: []; params?: {} }
    'two_factor_challenges.store': { paramsTuple?: []; params?: {} }
    'social_auths.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social_auths.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'todos.store': { paramsTuple?: []; params?: {} }
    'todos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'two_factor_settings.create': { paramsTuple?: []; params?: {} }
    'two_factor_settings.store': { paramsTuple?: []; params?: {} }
    'two_factor_settings.destroy': { paramsTuple?: []; params?: {} }
    'api.session.store': { paramsTuple?: []; params?: {} }
    'api.session.destroy': { paramsTuple?: []; params?: {} }
    'api.todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.store': { paramsTuple?: []; params?: {} }
    'api.todos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.todos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'magic_links.create': { paramsTuple?: []; params?: {} }
    'magic_links.consume': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'two_factor_challenges.create': { paramsTuple?: []; params?: {} }
    'social_auths.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social_auths.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'two_factor_settings.create': { paramsTuple?: []; params?: {} }
    'api.todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'magic_links.create': { paramsTuple?: []; params?: {} }
    'magic_links.consume': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'two_factor_challenges.create': { paramsTuple?: []; params?: {} }
    'social_auths.redirect': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'social_auths.callback': { paramsTuple: [ParamValue]; params: {'provider': ParamValue} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'two_factor_settings.create': { paramsTuple?: []; params?: {} }
    'api.todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
    'magic_links.store': { paramsTuple?: []; params?: {} }
    'two_factor_challenges.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'todos.store': { paramsTuple?: []; params?: {} }
    'two_factor_settings.store': { paramsTuple?: []; params?: {} }
    'api.session.store': { paramsTuple?: []; params?: {} }
    'api.session.destroy': { paramsTuple?: []; params?: {} }
    'api.todos.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'password_resets.update': { paramsTuple?: []; params?: {} }
    'todos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.todos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'two_factor_settings.destroy': { paramsTuple?: []; params?: {} }
    'api.todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}