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
    'session.destroy': { paramsTuple?: []; params?: {} }
    'todos.index': { paramsTuple?: []; params?: {} }
    'todos.store': { paramsTuple?: []; params?: {} }
    'todos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.edit': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.index': { paramsTuple?: []; params?: {} }
    'api.todos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'todos.store': { paramsTuple?: []; params?: {} }
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
    'api.todos.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}