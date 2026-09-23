import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '500..599': (_, { inertia }) => inertia.render('errors/server_error', {}),
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    /**
     * Self-rendering exceptions (VineJS validation, Bouncer authorization) pick
     * HTML-vs-JSON based on the request's Accept header, redirecting browser
     * navigations back with a flashed error. The REST API is a pure JSON
     * surface with no "back" page to redirect to, so force JSON here
     * regardless of what the client sent.
     */
    if (ctx.request.url().startsWith('/api/')) {
      ctx.request.request.headers.accept = 'application/json'
    }

    /**
     * Any unmatched route (typo, stale bookmark, ...) sends the visitor back
     * to the landing page instead of a dead-end 404 screen — checked ahead of
     * `renderStatusPages` (production-only) so this applies in every
     * environment, and skipped for the API surface, which must 404 in JSON.
     */
    if (this.#isRouteNotFound(error) && !ctx.request.url().startsWith('/api/')) {
      return ctx.response.redirect('/')
    }

    return super.handle(error, ctx)
  }

  #isRouteNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'E_ROUTE_NOT_FOUND'
    )
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
