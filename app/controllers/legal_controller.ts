import type { HttpContext } from '@adonisjs/core/http'

export default class LegalController {
  async terms({ inertia }: HttpContext) {
    return inertia.render('terms', {})
  }

  async privacy({ inertia }: HttpContext) {
    return inertia.render('privacy', {})
  }
}
